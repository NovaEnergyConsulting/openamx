export function serializeCsvText(rows) {
    const records = rows.map(row => row.map(cell => {
        const value = cell.value;
        const quote = cell.quoted || value === '' || /[",\r\n]/.test(value) || /^\s|\s$/.test(value);
        return quote ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(','));
    return `${records.join('\n')}\n`;
}
//# sourceMappingURL=csvTextSerialization.js.map