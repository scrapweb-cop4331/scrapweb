
export type EditEntryDTO = {
    note: string;
    date: string;
    photo?: File;
    audio?: File;
};

export function validateDate(dateStr: string): string | null {
    const dateRE = /^(\d{2})-(\d{2})-(\d{4})$/; // MM-DD-YYYY
    const match = dateStr.match(dateRE);
    
    if (!match) return null;
    
    const [_, monthStr, dayStr, yearStr] = match;
    const isoDate = `${yearStr}-${monthStr}-${dayStr}`;
    
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return null;
    
    // Check if the parts match to catch roll-overs (e.g. Feb 30 -> Mar 2)
    if (
        date.getUTCFullYear() !== parseInt(yearStr, 10) ||
        (date.getUTCMonth() + 1) !== parseInt(monthStr, 10) ||
        date.getUTCDate() !== parseInt(dayStr, 10)
    ) {
        return null;
    }
    
    return isoDate;
}

export function formatISOToDisplay(isoDate: string): string {
    const [year, month, day] = isoDate.split("-");
    return `${month}-${day}-${year}`;
}
