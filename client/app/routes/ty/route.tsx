import { EntryGrid } from "./EntryGrid"
import "./styles.css";
import { mapMediaToEntry, type MediaDTO } from "./data";

export async function loader() {
    console.log("Hellow, world");
    try {
        // Replace with your actual API endpoint from SwaggerHub
        const response = await fetch("http://137.184.93.240/api/media");
        console.log(response);
        if (!response.ok) {
            console.error("Failed to fetch media data");
            return [];
        }

        const data = await response.json();

        // Assuming the API returns { results: MediaDTO[] }
        const results: MediaDTO[] = data.results || [];

        return results.map(mapMediaToEntry);
    } catch (error) {
        console.error("Error loading media:", error);
        return [];
    }
}

export default () => (
    <div className="center-div">
        <EntryGrid />
    </div>
)