import { Frame, Fieldset } from "@react95/core";
import "./styles.css";
import { useLoaderData } from "react-router";
import type { EntryItem } from "./data";
import EntryButton from "./EntryButton";



interface EntryGridProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const EntryGrid = ({ selectedId, onSelect }: EntryGridProps) => {
  const entries = useLoaderData<EntryItem[]>();

  return (

      <Fieldset legend="Entries" className="entry-fieldset">
        <Frame boxShadow="$in" className="entries-grid">
          {entries && entries.length > 0 ? (
            entries.map((entry) => (
              <EntryButton
                key={entry.id}
                date={entry.date}
                imageURL={entry.imageURL}
                isActive={selectedId === entry.id}
                onClick={() => onSelect(entry.id)}
              />
            ))
          ) : (
            <div className="no-entries">No entries found.</div>
          )}
        </Frame>
      </Fieldset>

  );
};
