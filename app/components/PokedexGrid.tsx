"use client";
// Renders the invisible Pokédex grid and manages the selected Pokémon popup card


// ==============================
// Imports
// ==============================

import { useState } from "react";
import { PokemonDetailModal } from "./PokemonDetailModal";
import { PokemonSprite } from "./PokemonSprite";
import { type GenerationSection, type PokemonItem, getTypeStyle } from "./pokedexData";


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

            {/* Give it a dex number */}
            <span className="text-xs font-semibold opacity-70">
                #{String(item.dexNumber).padStart(4, "0")}
            </span>

            {/* Give it a sprite */}
            <PokemonSprite src={item.imageUrl} alt={item.name} />

            {/* Give it a name */}
            <span className="text-sm font-medium capitalize">{item.name}</span>

            {/* Show all other props */}
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


// Renders a single generation heading and its Pokédex grid table.
function GenerationTable({
    section,
    columns,
    className,
    onSelect,
}: {
    section: GenerationSection;
    columns: number;
    className: string;
    onSelect: (item: PokemonItem) => void;
})
{
    const rowCount = Math.ceil(section.items.length / columns);

    return (
        <section>
            <div className="mb-2 flex items-baseline justify-between gap-2 px-2">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-lg font-bold">{section.name}</h2>
                    {section.region && (
                        <span className="text-xs font-semibold capitalize opacity-60">
                            {section.region}
                        </span>
                    )}
                </div>
                <span className="text-xs opacity-60">
                    {section.items.length} Pokémon
                </span>
            </div>

            {/* This is the table that always shows in the body. */}
            <table className={`w-full table-fixed border-collapse border-0 bg-transparent ${className}`.trim()}>
                <tbody>
                    {Array.from({ length: rowCount }, (_, i) => (
                        <GridRow
                            key={i}
                            pokemon={section.items}
                            columns={columns}
                            rowIndex={i}
                            onSelect={onSelect}
                        />
                    ))}
                </tbody>
            </table>
        </section>
    );
}


// ==============================
// Component Definition
// ==============================

// Renders Pokédex sections grouped by generation and manages the selected Pokémon popup card.
export function PokedexGrid({
    sections,
    columns,
    className,
}: {
    sections: GenerationSection[];
    columns: number;
    className: string;
})
{
    const [selected, setSelected] = useState<PokemonItem | null>(null);

    return (
        // wrap everything in a Fragment (invisible wrapper)
        // Because we can only react one single dom element
        <>
            {sections.map((section, index) => (
                <div key={section.id}>
                    {index > 0 && (
                        <div
                            aria-hidden="true"
                            className="my-8 border-t border-neutral-200 dark:border-neutral-800"
                        />
                    )}
                    <GenerationTable
                        section={section}
                        columns={columns}
                        className={className}
                        onSelect={setSelected}
                    />
                </div>
            ))}

            {/* This is the detail modal that shows when we want it to. */}
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
