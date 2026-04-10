import { useState } from "react";
import { EntryGrid } from "./EntryGrid"
import { Button } from "@react95/core";
import "./styles.css";
import { mapMediaToEntry, type MediaDTO } from "./data";

const jwtbase64 =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDk2YjE2YjhhNTkwZWVkMzBiMmI5MyIsImlhdCI6MTc3NTg1NjQ3MCwiZXhwIjoxNzc1OTQyODcwfQ.5Vlu5Solcw63qThIMGApgOHSw8FDPkcy_-1ZKNKeP-Q";

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
        return results.map(mapMediaToEntry);
    } catch (error) {
        console.error("Error loading media:", error);
        return [];
    }
}

export default () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className="center-div">
            <EntryGrid 
                selectedId={selectedId} 
                onSelect={setSelectedId} 
            />
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