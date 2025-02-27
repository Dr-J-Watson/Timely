export const calculateTotalDuration = (entries) => {
    return entries.reduce((total, entry) => {
        if (!entry?.start) return total;
        const start = new Date(entry.start);
        const end = entry.end === null ? new Date() : new Date(entry.end);
        return total + (end - start);
    }, 0);
};