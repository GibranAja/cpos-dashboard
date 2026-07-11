import { useCallback, useMemo, useState } from 'react';

/**
 * Client-side multi-row selection for bulk actions (FEAT-DASH-1). Tracks a Set of
 * ids and prunes any selection whose id disappeared after a reload, so the count
 * and "select all" state stay correct.
 */
export function useRowSelection(ids: string[]) {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const valid = useMemo(() => {
        const idSet = new Set(ids);
        const next = new Set<string>();
        selected.forEach((id) => idSet.has(id) && next.add(id));
        return next;
    }, [ids, selected]);

    const toggle = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const allSelected = ids.length > 0 && ids.every((id) => valid.has(id));

    const toggleAll = useCallback(() => {
        setSelected(() => (ids.length > 0 && ids.every((id) => valid.has(id)) ? new Set() : new Set(ids)));
    }, [ids, valid]);

    const clear = useCallback(() => setSelected(new Set()), []);

    return {
        selectedIds: [...valid],
        isSelected: (id: string) => valid.has(id),
        toggle,
        toggleAll,
        clear,
        allSelected,
        someSelected: valid.size > 0 && !allSelected,
        count: valid.size,
    };
}
