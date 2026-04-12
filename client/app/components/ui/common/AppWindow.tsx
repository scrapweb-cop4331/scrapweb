import { Modal, Tabs, Tab, TitleBar } from "@react95/core";
import { Computer } from "@react95/icons";
import { useLocation, useNavigate } from "react-router";
import React from "react";
import "./AppWindow.css";

interface AppWindowProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AppWindow({ children, isOpen, setIsOpen }: AppWindowProps) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentPath = location.pathname;

  return (
    <Modal
      title="Scrapweb"
      className="app-modal"
      titleBarOptions={[
        <TitleBar.Close key="close" onClick={() => setIsOpen(false)} />,
      ]}
      icon={<Computer variant="16x16_4" />}
      menu={[]}
    >
      <Tabs
        key={currentPath}
        defaultActiveTab={currentPath === "/" ? "Home" : "Explore"}
        onChange={
          ((tab: string) => {
            if (tab === "Home") navigate("/");
            else if (tab === "Explore") {
              navigate("/explore");
            } else navigate("/login");
          }) as any
        }
      >
        <Tab title="Home">
          {currentPath === "/" ? children : null}
        </Tab>
        <Tab title="Explore">
          {currentPath === "/explore" ? children : null}
        </Tab>
      </Tabs>
    </Modal>
  );
}
