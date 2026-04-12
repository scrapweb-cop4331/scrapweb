import { useState } from "react";
import { EntryGrid } from "./EntryGrid"
import { Button } from "@react95/core";
import { LargeView } from "./LargeView";
import "./styles.css";
import { mapMediaToEntry, type MediaDTO } from "./data";

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
            // console.log({
            //     input: e,
            //     output: res,
            // });
            return res;
        });
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