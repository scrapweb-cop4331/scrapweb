import { Modal, Tabs, Tab } from "@react95/core";
import { Computer } from "@react95/icons";
import { useLocation, useNavigate } from "react-router";
import React from "react";

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
      closeModal={() => setIsOpen(false)}
      icon={<Computer variant="16x16_4" />}
      menu={[]}
    >
      <Tabs 
        activeTab={currentPath === "/" ? "Home" : "Explore"} 
        onChange={(tab: string) => {
           if (tab === "Home") navigate("/");
           else navigate("/explore");
        }}
      >
        <Tab value="Home" label="Home">
           {currentPath === "/" ? children : null}
        </Tab>
        <Tab value="Explore" label="Explore">
           {currentPath === "/explore" ? children : null}
        </Tab>
      </Tabs>
    </Modal>
  );
}
