import { Frame, Fieldset } from "@react95/core";
import type { ReactNode } from "react";

interface EntryGridProps {
  children: ReactNode;
}

export const EntryGrid = ({ children }: EntryGridProps) => {
  return (
      <Frame boxShadow="$in" className="entries-grid">
        {children}
      </Frame>
  );
};
