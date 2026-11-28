// Animated placeholder table shown by Suspense while the Pokédex is streaming/rendering



// ==============================
// Imports
// ==============================

import { PokedexGrid } from "./PokedexGrid";
import { IMAGE_SIZE_PX, SKELETON_ROWS, fetchPokedexByGeneration } from "./pokedexData";


// ==============================
// Types
// ==============================

// Properties for the `Pokedex` grid component
export interface PokedexProps
{
    columns?: number;
    className?: string;
}


// ==============================
// Subcomponents
// ==============================

// Get one cell
function SkeletonCell()
{
    return (<td className="border-0 bg-transparent p-2 text-center align-top">
        {/* Give it the pulse animation. */}
        <div className="flex animate-pulse flex-col items-center justify-center gap-1.5 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
            {/* Give it a container for a pokedex number. */}
            <div className="h-3.5 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />

            {/* Give it a container for an image. */}
            <div
                style={{ width: IMAGE_SIZE_PX, height: IMAGE_SIZE_PX }}
                className="shrink-0 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            
            {/* Give it a container for a name. */}
            <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />

            {/* Give a container for type badges. */}
            <div className="flex gap-1.5">
                <div className="h-5 w-14 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
        </div>
    </td>);
}

// Get one row
function SkeletonRow({ columns }: { columns: number })
{
    return (<tr className="border-0 bg-transparent">
        {/* Build each cell. */}
        {Array.from({ length: columns }, (_, i) =>
            <SkeletonCell key={i} />
        )}
    </tr>);
}

// Get the whole thing
export function PokedexSkeleton({
    columns = 6,
    className = "",
}: PokedexProps)
{
    columns = Math.max(1, Math.floor(columns));

    return (
        <table
            aria-busy="true"
            aria-label="Loading Pokédex"
            className={`w-full table-fixed border-collapse border-0 bg-transparent ${className}`.trim()}>
            <tbody>
                {Array.from({ length: SKELETON_ROWS }, (_, i) => <SkeletonRow key={i} columns={columns} />)}
            </tbody>
        </table>
    );
}


// ==============================
// Component Definition
// ==============================

// Server Component that fetches the Pokédex grouped by generation and renders the interactive grid
// Server Component that fetches the Pokédex grouped by generation and renders the interactive grid
export async function Pokedex({
    columns = 6,
    className = "",
}: PokedexProps)
{
    columns = Math.max(1, Math.floor(columns));
    const { sections, error } = await fetchPokedexByGeneration();

    if (error)
        return <p className="p-4 text-center text-sm text-red-600">{error}</p>;

    return <PokedexGrid
        sections={sections}
        columns={columns}
        className={className}/>;
}
