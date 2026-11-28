"use client";
// Renders the invisible Pokédex grid and manages the selected Pokémon popup card


// ==============================
// Imports
// ==============================

import { useState } from "react";
import { PokemonDetailModal } from "./PokemonDetailModal";
import { PokemonSprite } from "./PokemonSprite";
import { type PokemonItem, getTypeStyle } from "./pokedexData";


// ==============================
// Subcomponents
// ==============================

// Build and return a type badge.
function TypeBadge({ typeName }: { typeName: string })
{
    const style = getTypeStyle(typeName);
    return (<span
        key={typeName}
        style={{ backgroundColor: style.badgeBg, color: style.badgeText }}
        className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
            {typeName}
    </span>);
}

// Build the card popup, return a button that enables it.
function PokemonCard({ item, onClick }: { item: PokemonItem; onClick: () => void })
{
    const primaryStyle = getTypeStyle(item.types[0]);

    return (<button
        type="button"
        onClick={onClick}
        style={{ backgroundColor: primaryStyle.cardBg }}
        className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl p-3 transition-transform duration-150 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2">

            // Give it a dex number
            <span className="text-xs font-semibold opacity-70">
                #{String(item.dexNumber).padStart(4, "0")}
            </span>

            // Give it a sprite
            <PokemonSprite src={item.imageUrl} alt={item.name} />

            // Give it a name
            <span className="text-sm font-medium capitalize">{item.name}</span>

            // Show all other props
            {item.types.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {item.types.map((typeName) => <TypeBadge key={typeName} typeName={typeName} />)}
                </div>
            )}
    </button>);
}

// Get one cell
function GridCell({ item, onSelect }: { item: PokemonItem | undefined; onSelect: (item: PokemonItem) => void }) {
    return (<td className="border-0 bg-transparent p-2 text-center align-top">
        {item && <PokemonCard item={item} onClick={() => onSelect(item)} />}
    </td>);
}

// Get one row
function GridRow({ pokemon, columns, rowIndex, onSelect }: {
    pokemon: PokemonItem[];
    columns: number;
    rowIndex: number;
    onSelect: (item: PokemonItem) => void;
}) {
    return (<tr className="border-0 bg-transparent">
        {Array.from({ length: columns }, (_, colIndex) => (
            <GridCell key={colIndex} item={pokemon[rowIndex * columns + colIndex]} onSelect={onSelect} />
        ))}
    </tr>);
}


// ==============================
// Component Definition
// ==============================

export function PokedexGrid({
    pokemon,
    columns,
    className,
}: {
    pokemon: PokemonItem[];
    columns: number;
    className: string;
}) {
    const [selected, setSelected] = useState<PokemonItem | null>(null);
    const rowCount = Math.ceil(pokemon.length / columns);

    return (
        // wrap everything in a Fragment (invisible wrapper)
        // Because we can only react one single dom element
        <>
            // This is the table that always shows in the body.
            <table className={`w-full table-fixed border-collapse border-0 bg-transparent ${className}`.trim()}>
                <tbody>
                    {Array.from({ length: rowCount }, (_, i) => (
                        <GridRow key={i} pokemon={pokemon} columns={columns} rowIndex={i} onSelect={setSelected} />
                    ))}
                </tbody>
            </table>

            // This is the detail modal that shows when we want it to.
            {selected && (
                <PokemonDetailModal
                    key={selected.id}
                    pokemon={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}
