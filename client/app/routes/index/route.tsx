import { useState, useMemo } from "react";
import { EntryGrid } from "./components/EntryGrid";
import { Button, Modal } from "@react95/core";
import { useLoaderData, useNavigate, useRevalidator } from "react-router";
import { type EntryItem } from "./utils/data";
import EntryButton from "./components/EntryButton";
import LargeView from "./components/LargeView";
import { EntrySeparator } from "./components/EntrySeparator";
import "./styles.css";
import { getEntries, newEntry } from "~/lib/api";
import type { Route } from "./+types/route";
import scrapwebicon from "~/assets/logo-icon.png"

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return getEntries();
}

export default function Route() {
  const unsortedEntries = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const entriesSorted = useMemo(() => {
    if (!unsortedEntries) return [];
    return unsortedEntries
      .filter((entry) => !entry.isInvalid)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [unsortedEntries]);

  const entriesWithSeparators = useMemo(() => {
    const result: (
      | EntryItem
      | { isSeparator: true; type: "month" | "year"; label: string; id: string }
    )[] = [];
    let lastYear = "";
    let lastMonth = "";

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    entriesSorted.forEach((entry) => {
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
  }, [entriesSorted]);

  const selectedEntry = useMemo(() => {
    const entry = entriesSorted.find((e) => e.id === selectedId);
    return entry
      ? entry
      : {
          id: "",
          imageURL: "",
          audioURL: "",
          timestamp: 0,
          date: "",
          note: "",
          isInvalid: true,
        };
  }, [entriesSorted, selectedId]);

  return (
    <Modal icon=<img src={scrapwebicon} /> title="Scrapweb.exe" style={{ width: "80%", height: "80%" }} className="app-modal">
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
                      onClick={() =>
                        setSelectedId(selectedId === item.id ? null : item.id)
                      }
                    />
                  );
                })
              ) : (
                <div className="no-entries">No entries found.</div>
              )}
            </EntryGrid>
          </div>
          <div className="right-panel">
            <LargeView {...selectedEntry} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            onClick={async () => {
              const success = await newEntry();
              if (success) {
                revalidator.revalidate();
              }
            }}
          >
            New Entry
          </Button>
          <Button
            className="reset-button"
            onClick={() => setSelectedId(null)}
            disabled={selectedId === null}
          >
            Reset Selection
          </Button>
          <Button
            onClick={() => navigate(`/entry/${selectedId}`)}
            disabled={selectedId === null}
          >
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  );
}
