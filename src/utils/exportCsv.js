/**
 * Exports data as a CSV file download.
 * @param {Array<Object>} data - Array of objects to export
 * @param {Array<{key: string, label: string}>} columns - Column definitions
 * @param {string} [filename='export.csv'] - Output filename
 */
export function exportToCSV(data, columns, filename = 'export.csv') {
  if (!data || data.length === 0) return;

  const header = columns.map((col) => col.label).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = typeof col.key === 'function' ? col.key(row) : row[col.key];
        // Escape commas and quotes in CSV values
        const stringValue = String(value ?? '');
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      })
      .join(',')
  );

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
