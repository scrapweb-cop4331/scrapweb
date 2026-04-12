import { useState, useMemo } from "react";
import { EntryGrid } from "./EntryGrid"
import { Button } from "@react95/core";
import { useLoaderData } from "react-router";
import { mapMediaToEntry, type MediaDTO, type EntryItem } from "./data";
import EntryButton from "./EntryButton";
import LargeView from "./LargeView";
import "./styles.css";

const jwtbase64 =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDk2YjE2YjhhNTkwZWVkMzBiMmI5MyIsImlhdCI6MTc3NTk1NTgzOSwiZXhwIjoxNzc2MDQyMjM5fQ.4FvoxUWeVpZKm-Oer4tPZxyXYX9A6PwvWvnc-YfEZFs";

export async function loader() {
    try {
        const response = await fetch("http://137.184.93.240/api/media", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtbase64}`
            },
        });
        if (!response.ok) {
            console.error("Failed to fetch media data");
            return [];
        }

        const data = await response.json();
        const results: MediaDTO[] = data.media || [];
        return results.map((e) => {
            const res = mapMediaToEntry(e);
            return res;
        });
    } catch (error) {
        console.error("Error loading media:", error);
        return [];
    }
}

export default function Route() {
    const rawEntries = useLoaderData<EntryItem[]>();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const entries = useMemo(() => {
        if (!rawEntries) return [];
        return rawEntries
            .filter(entry => !entry.isInvalid)
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [rawEntries]);

    const selectedEntry = useMemo(() => {
        return entries.find(e => e.id === selectedId);
    }, [entries, selectedId]);

    return (
        <div className="center-div">
            {selectedEntry && (
                <LargeView {...selectedEntry} />
            )}
            <EntryGrid>
                {entries && entries.length > 0 ? (
                    entries.map((entry) => (
                        <EntryButton
                            key={entry.id}
                            date={entry.date}
                            imageURL={entry.imageURL}
                            isActive={selectedId === entry.id}
                            onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
                        />
                    ))
                ) : (
                    <div className="no-entries">No entries found.</div>
                )}
            </EntryGrid>
            <Button 
                className="reset-button" 
                onClick={() => setSelectedId(null)}
                disabled={selectedId === null}
            >
                Reset Selection
            </Button>
        </div>
    );
}