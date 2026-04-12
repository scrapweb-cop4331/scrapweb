import { useState, useMemo } from "react";
import { EntryGrid } from "./EntryGrid"
import { Button } from "@react95/core";
import { useLoaderData } from "react-router";
import { mapMediaToEntry, type MediaDTO, type EntryItem } from "./data";
import EntryButton from "./EntryButton";
import LargeView from "./LargeView";
import { EntrySeparator } from "./EntrySeparator";
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

    const entriesWithSeparators = useMemo(() => {
        const result: (EntryItem | { isSeparator: true; type: "month" | "year"; label: string; id: string })[] = [];
        let lastYear = "";
        let lastMonth = "";

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        entries.forEach((entry) => {
            const [month, , year] = entry.date.split("-");
            const monthName = monthNames[parseInt(month, 10) - 1];

            if (year !== lastYear) {
                result.push({
                    isSeparator: true,
                    type: "year",
                    label: year,
                    id: `year-${year}`,
                });
                lastYear = year;
                lastMonth = "";
            }

            if (monthName !== lastMonth) {
                result.push({
                    isSeparator: true,
                    type: "month",
                    label: monthName,
                    id: `month-${year}-${month}`,
                });
                lastMonth = monthName;
            }

            result.push(entry);
        });

        return result;
    }, [entries]);

    const selectedEntry = useMemo(() => {
        return entries.find(e => e.id === selectedId);
    }, [entries, selectedId]);

    return (
        <div className="modal-content">
            <div className="main-layout">
                <div className="grid-section">
                    <EntryGrid>
                        {entriesWithSeparators.length > 0 ? (
                            entriesWithSeparators.map((item) => {
                                if ("isSeparator" in item) {
                                    return (
                                        <EntrySeparator
                                            key={item.id}
                                            type={item.type}
                                            label={item.label}
                                        />
                                    );
                                }
                                return (
                                    <EntryButton
                                        key={item.id}
                                        date={item.date}
                                        imageURL={item.imageURL}
                                        isActive={selectedId === item.id}
                                        onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                                    />
                                );
                            })
                        ) : (
                            <div className="no-entries">No entries found.</div>
                        )}
                    </EntryGrid>
                </div>
                <div className="largeview-section">
                    {selectedEntry ? (
                        <LargeView {...selectedEntry} />
                    ) : (
                        <div className="no-selection">Select an entry to view details</div>
                    )}
                </div>
            </div>
            <div className="footer-buttons">
                <Button 
                    className="reset-button" 
                    onClick={() => setSelectedId(null)}
                    disabled={selectedId === null}
                >
                    Reset Selection
                </Button>
            </div>
        </div>
    );
}
