import { router } from '@inertiajs/react';
import { Button } from '@/components/ui';

/**
 * Cursor pagination control for the API's `{ data, nextCursor }` lists.
 * Navigates by replacing the current page with the next cursor.
 */
export function Pager({ nextCursor, baseUrl }: { nextCursor: string | null; baseUrl: string }) {
    if (!nextCursor) {
        return null;
    }

    return (
        <div className="mt-4 flex justify-center">
            <Button
                variant="ghost"
                onClick={() =>
                    router.get(baseUrl, { cursor: nextCursor }, { preserveScroll: true, preserveState: true })
                }
            >
                Muat lebih banyak
            </Button>
        </div>
    );
}
