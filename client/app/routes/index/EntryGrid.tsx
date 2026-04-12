import { Frame, Fieldset } from "@react95/core";
import "./styles.css";
import type { ReactNode } from "react";

interface EntryGridProps {
  children: ReactNode;
}

export const EntryGrid = ({ children }: EntryGridProps) => {
  return (
    <Fieldset legend="Entries" className="entry-fieldset">
      <Frame boxShadow="$in" className="entries-grid">
        {children}
      </Frame>
    </Fieldset>
  );
};
