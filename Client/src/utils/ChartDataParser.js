
/**
 * Utility to parse chart data from HTML tables or selection
 */

export const ChartDataParser = {
    /**
     * Parses the current selection to find a table and extract data.
     * Returns null if no suitable table is found.
     */
    parseSelection: () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode;

        // Find closest table
        const table = container.closest('table');
        if (table) {
            return ChartDataParser.parseHTMLTable(table);
        }

        return null;
    },

    /**
     * Parses an HTML table element into ChartData structure.
     * Assumes:
     * - First row contains Category Labels (X-Axis)
     * - First column contains Series Names (Legend)
     * - Rest are numeric values
     * 
     * @param {HTMLTableElement} table 
     * @returns {Object} { categories: [], series: [{name, data: []}] }
     */
    parseHTMLTable: (table) => {
        if (!table) return null;

        const rows = Array.from(table.rows);
        if (rows.length < 2) return null; // Need header + at least 1 data row

        // Extract Categories from Header Row (Skip 1st cell if it's empty or label)
        const headerCells = Array.from(rows[0].cells);
        const categories = headerCells.slice(1).map(cell => cell.innerText.trim());

        // Extract Series from Data Rows
        const series = [];
        // Default colors to cycle through
        const colors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47', '#264478', '#9E480E'];

        for (let i = 1; i < rows.length; i++) {
            const cells = Array.from(rows[i].cells);
            if (cells.length < 2) continue;

            const seriesName = cells[0].innerText.trim();
            const seriesData = [];

            for (let j = 1; j < cells.length; j++) {
                const val = parseFloat(cells[j].innerText.trim());
                seriesData.push(isNaN(val) ? 0 : val);
            }

            series.push({
                name: seriesName,
                data: seriesData,
                color: colors[(i - 1) % colors.length]
            });
        }

        return {
            categories,
            series
        };
    },

    /**
     * Returns default mock data for when no table is selected
     */
    getDefaultData: () => {
        return {
            categories: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
            series: [
                { name: 'Series 1', data: [4.3, 2.4, 2, 4.5], color: '#4472C4' },
                { name: 'Series 2', data: [2.4, 4.4, 1.8, 2.8], color: '#ED7D31' },
                { name: 'Series 3', data: [2, 2, 3, 5], color: '#A5A5A5' }
            ]
        };
    }
};
