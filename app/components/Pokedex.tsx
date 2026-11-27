// ==============================
// Imports
// ==============================

import { PokedexGrid } from "./PokedexGrid";
import { IMAGE_SIZE_PX, SKELETON_ROWS, fetchPokedex } from "./pokedexData";


// ==============================
// Types
// ==============================

// Properties for the `Pokedex` grid component
export interface PokedexProps {
    columns?: number;
    className?: string;
}


// ==============================
// Subcomponents
// ==============================

// Animated placeholder table shown by Suspense while the Pokédex is streaming/rendering
export function PokedexSkeleton({
    columns = 6,
    className = "",
}: PokedexProps) {
    const safeColumns = Math.max(1, Math.floor(columns));

    return (
        <table
            aria-busy="true"
            aria-label="Loading Pokédex"
            className={`w-full table-fixed border-collapse border-0 bg-transparent ${className}`.trim()}>
            <tbody>
                {Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                    <tr key={rowIndex} className="border-0 bg-transparent">
                        {Array.from({ length: safeColumns }, (_, colIndex) => (
                            <td
                                key={colIndex}
                                className="border-0 bg-transparent p-2 text-center align-top">
                                <div className="flex animate-pulse flex-col items-center justify-center gap-1.5 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
                                    <div className="h-3.5 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
                                    <div
                                        style={{ width: IMAGE_SIZE_PX, height: IMAGE_SIZE_PX }}
                                        className="shrink-0 rounded-md bg-neutral-200 dark:bg-neutral-800"
                                    />
                                    <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                                    <div className="flex gap-1.5">
                                        <div className="h-5 w-14 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                    </div>
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}


// ==============================
// Component Definition
// ==============================

// Server Component that fetches the National Pokédex at build time and renders the interactive grid
export async function Pokedex({
    columns = 6,
    className = "",
}: PokedexProps) {
    const safeColumns = Math.max(1, Math.floor(columns));
    const { items: pokemon, error } = await fetchPokedex();

    if (error) {
        return <p className="p-4 text-center text-sm text-red-600">{error}</p>;
    }

    return <PokedexGrid pokemon={pokemon} columns={safeColumns} className={className} />;
}
