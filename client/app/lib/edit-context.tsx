import { createContext, useContext, useState } from "react";

interface EditContextType {
    isDirty: boolean;
    setIsDirty: (isDirty: boolean) => void;
    entryDate: string;
    setEntryDate: (date: string) => void;
    entryId: string;
    setEntryId: (id: string) => void;
}

const EditContext = createContext<EditContextType | null>(null);

export function EditProvider({ children }: { children: React.ReactNode }) {
    const [isDirty, setIsDirty] = useState(false);
    const [entryDate, setEntryDate] = useState("");
    const [entryId, setEntryId] = useState("");
    
    return (
        <EditContext.Provider value={{ isDirty, setIsDirty, entryDate, setEntryDate, entryId, setEntryId }}>
            {children}
        </EditContext.Provider>
    );
}

export function useEdit() {
    const context = useContext(EditContext);
    if (!context) {
        throw new Error("useEdit must be used within an EditProvider");
    }
    return context;
}
