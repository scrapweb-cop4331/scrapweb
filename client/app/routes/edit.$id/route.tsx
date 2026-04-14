import { useState, useMemo, useEffect } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router";
import { Button, Input, TextArea, Alert } from "@react95/core";
import { Footer } from "../../components/ui/common/AppWindow";
import { auth } from "../../lib/auth";
import { validateDate, formatISOToDisplay } from "./data";
import { mapMediaToEntry, type MediaDTO, type EntryItem } from "../index/data";
import type { Route } from "./+types/route";
import { useEdit } from "../../lib/edit-context";

export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
    const user = auth.loadUser();
    const token = user?.token;

    console.log(`Loading entry ${params.id}...`);

    try {
        const response = await fetch("https://scrapweb.kite-keeper.com/api/media", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            console.error(`Failed to fetch media data: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const results: MediaDTO[] = data.media || [];
        
        const dto = results.find(e => e._id === params.id);
        
        if (!dto) {
            console.error(`Entry ${params.id} not found in media list`);
            return null;
        }

        return mapMediaToEntry(dto);
    } catch (error) {
        console.error("Error loading media:", error);
        return null;
    }
}

export default function EditRoute() {
    const initialEntry = useLoaderData<typeof clientLoader>();
    const navigate = useNavigate();
    const params = useParams();
    const { setIsDirty, setEntryDate, setEntryId } = useEdit();

    const [note, setNote] = useState(initialEntry?.note || "");
    const [date, setDate] = useState(initialEntry?.date || "");
    const [photo, setPhoto] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isDirty = useMemo(() => {
        return (
            note !== (initialEntry?.note || "") ||
            date !== (initialEntry?.date || "") ||
            photo !== null ||
            audio !== null
        );
    }, [note, date, photo, audio, initialEntry]);

    useEffect(() => {
        setIsDirty(isDirty);
    }, [isDirty, setIsDirty]);

    useEffect(() => {
        if (initialEntry?.date) {
            setEntryDate(initialEntry.date);
        }
        if (params.id) {
            setEntryId(params.id);
        }
    }, [initialEntry, params.id, setEntryDate, setEntryId]);

    const handleSave = async () => {
        const isoDate = validateDate(date);
        if (!isoDate) {
            alert("Invalid date format. Use MM-DD-YYYY");
            return;
        }

        setIsSaving(true);
        const formData = new FormData();
        formData.append("notes", note);
        formData.append("date", isoDate);
        if (photo) formData.append("photo", photo);
        if (audio) formData.append("audio", audio);

        const token = auth.getToken();
        const url = `https://scrapweb.kite-keeper.com/api/media/${params.id}`;

        const requestLog: any = {
            url,
            method: "PATCH",
            headers: {
                Authorization: token ? `Bearer ${token.substring(0, 8)}...` : "None",
            },
            body: {}
        };

        formData.forEach((value, key) => {
            if (value instanceof File) {
                requestLog.body[key] = `[File: ${value.name}]`;
            } else {
                requestLog.body[key] = value;
            }
        });

        console.log("Sending PATCH request:", requestLog);

        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            
            console.log("hello world");
            console.log(`PATCH response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                window.location.reload(); // Simple way to refresh loader data
            } else {
                const errorText = await response.text();
                console.error("PATCH request failed:", errorText);
                alert("Failed to save changes");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (isDirty) {
            setShowAlert(true);
        } else {
            navigate("/");
        }
    };

    const handleDiscard = () => {
        setShowAlert(false);
        setIsDirty(false);
        setEntryId("");
        setEntryDate("");
        navigate("/");
    };

    const handleSaveAndClose = async () => {
        setShowAlert(false);
        await handleSave();
        navigate("/");
    };

    if (!initialEntry) {
        return (
            <div className="modal-content">
                <p>Failed to load entry. Please check the console for details or try again.</p>
                <Footer>
                    <Button onClick={() => navigate("/")}>Back to Home</Button>
                </Footer>
            </div>
        );
    }

    return (
        <div className="modal-content">
            <div className="edit-form">
                <div className="form-field">
                    <label>Date (MM-DD-YYYY):</label>
                    <Input value={date} onChange={(e: any) => setDate(e.target.value)} placeholder="MM-DD-YYYY" />
                </div>
                <div className="form-field">
                    <label>Note:</label>
                    <TextArea value={note} onChange={(e: any) => setNote(e.target.value)} placeholder="Original Note" />
                </div>
                <div className="form-field">
                    <label>Photo:</label>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e: any) => setPhoto(e.target.files?.[0] || null)} />
                    {photo && <span>{photo.name}</span>}
                </div>
                <div className="form-field">
                    <label>Audio:</label>
                    <input type="file" accept="audio/mpeg" onChange={(e: any) => setAudio(e.target.files?.[0] || null)} />
                    {audio && <span>{audio.name}</span>}
                </div>
            </div>

            {showAlert && (
                <Alert
                    title="Pending Changes"
                    message="You have unsaved changes. What would you like to do?"
                    closeAlert={() => setShowAlert(false)}
                    buttons={[
                        { value: "Save changes", onClick: handleSaveAndClose },
                        { value: "Discard changes", onClick: handleDiscard },
                        { value: "Cancel", onClick: () => setShowAlert(false) },
                    ]}
                />
            )}

            <Footer>
                <Button onClick={handleSave} disabled={!isDirty || isSaving}>
                    Save
                </Button>
                <Button onClick={handleClose}>
                    Close
                </Button>
            </Footer>
        </div>
    );
}
