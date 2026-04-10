import { Frame, Fieldset, Button } from "@react95/core";
import "./styles.css";
import type { ButtonProps } from "@react95/core/Button";
import { useLoaderData } from "react-router";
import type { EntryItem } from "./data";

export interface EntryProps extends ButtonProps {
  label: string;
  imageUrl: string;
}

export const Entry = ({ label, imageUrl, ...props }: EntryProps) => {
    return (
      <Button {...props} className="entry">
        <img src={imageUrl} alt={label} className="entry-image"/>
        <div className="entry-label">{label}</div>
      </Button>
    );
}

export const EntryGrid = () => {
  const entries = useLoaderData<EntryItem[]>();

  return (
    <Frame
      boxShadow="$out"
      className="main-frame"
    >
      <Fieldset
        legend="Entries"
        className="entry-fieldset"
      >
        <Frame
          boxShadow="$in"
          className="entries-grid"
        >
          {entries && entries.length > 0 ? (
            entries.map((entry) => (
              <Entry 
                key={entry.id} 
                className="grid-button"
                label={entry.label}
                imageUrl={entry.imageUrl}
              />
            ))
          ) : (
            <div className="no-entries">No entries found.</div>
          )}
        </Frame>
      </Fieldset>
    </Frame>
  );
};
