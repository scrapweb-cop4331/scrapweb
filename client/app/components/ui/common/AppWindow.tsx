import { Modal, Tabs, Tab, TitleBar } from "@react95/core";
import { Computer } from "@react95/icons";
import { useLocation, useNavigate } from "react-router";
import React from "react";
import "./AppWindow.css";
import type { DragOptions } from "@neodrag/react";
import { useEdit } from "../../../lib/edit-context";

interface AppWindowProps {
  children: React.ReactNode;
  isOpen: boolean;
  dragOptions: DragOptions;
  setIsOpen: (isOpen: boolean) => void;
}

export function Footer({ children }: { children: React.ReactNode }) {
  return <div className="footer-buttons">{children}</div>;
}

export function AppWindow({ children, isOpen, setIsOpen, dragOptions}: AppWindowProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDirty, entryDate, entryId } = useEdit();

  if (!isOpen) return null;

  const currentPath = location.pathname;
  const isEditing = currentPath.startsWith("/edit/");

  const editingTabTitle = `Editing: ${entryDate || "..."}`;

  return (
    <Modal
      title={`Scrapweb${isDirty ? " *" : ""}`}
      className="app-modal"
      dragOptions={dragOptions}
      titleBarOptions={[
        <TitleBar.Close key="close" onClick={() => setIsOpen(false)} />,
      ]}
      icon={<Computer variant="16x16_4" />}
      menu={[]}
    >
      <Tabs
        key={currentPath}
        defaultActiveTab={isEditing ? editingTabTitle : "Home"}
        onChange={
          ((tab: string) => {
            if (tab === "Home") navigate("/");
            else if (tab === editingTabTitle) {
              if (!isEditing && entryId) {
                navigate(`/edit/${entryId}`);
              }
            } else navigate("/login");
          }) as any
        }
      >
        <Tab title="Home">
          {currentPath === "/" ? <>{children}</> : <div />}
        </Tab>
        {(isEditing || isDirty) ? (
          <Tab title={editingTabTitle}>
            <>{children}</>
          </Tab>
        ) : (
          <Tab title="__hidden" style={{ display: 'none' }} />
        )}
      </Tabs>
    </Modal>
  );
}
