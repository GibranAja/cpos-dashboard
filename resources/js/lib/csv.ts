/**
 * Minimal CSV parser for the product bulk-import wizard. Handles quoted fields
 * and commas inside quotes. Returns an array of row objects keyed by header.
 */
export function parseCsv(text: string): Record<string, string>[] {
    const rows = splitRows(text.trim());

    if (rows.length < 2) {
        return [];
    }

    const headers = rows[0].map((h) => h.trim());

    return rows.slice(1).map((cells) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
            obj[h] = (cells[i] ?? '').trim();
        });

        return obj;
    });
}

function splitRows(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];

        if (inQuotes) {
            if (c === '"' && text[i + 1] === '"') {
                field += '"';
                i++;
            } else if (c === '"') {
                inQuotes = false;
            } else {
                field += c;
            }

            continue;
        }

        if (c === '"') {
            inQuotes = true;
        } else if (c === ',') {
            row.push(field);
            field = '';
        } else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') {
                i++;
            }

            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else {
            field += c;
        }
    }

    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}
