import { Frame, Fieldset } from "@react95/core";
import "./styles.css";
import { useLoaderData } from "react-router";
import type { EntryItem } from "./data";

export interface EntryButtonProps {
  date: string;
  imageUrl: string;
  isActive: boolean;
  onClick: () => void;
}

export const EntryButton = ({date: date, imageUrl, isActive, onClick }: EntryButtonProps) => {
  console.log();
    return (
      <Frame
        as="button"
        onClick={onClick}
        boxShadow={isActive ? "$in" : "$out"}
        className={`entry-button ${isActive ? "active" : ""}`}
      >
        <Frame boxShadow="$in" className="entry-image-frame">
          <img
            src={imageUrl}
            className="entry-image"
          />
        </Frame>
        <div className="entry-label">{date}</div>
      </Frame>
    );
}

interface EntryGridProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const EntryGrid = ({ selectedId, onSelect }: EntryGridProps) => {
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
              <EntryButton 
                key={entry.id} 
                date={entry.date}
                imageUrl={entry.imageURL}
                isActive={selectedId === entry.id}
                onClick={() => onSelect(entry.id)}
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

