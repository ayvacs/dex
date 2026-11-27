"use client";


// ==============================
// Imports
// ==============================

import { useState } from "react";
import { PokemonDetailModal } from "./PokemonDetailModal";
import { PokemonSprite } from "./PokemonSprite";
import { type PokemonItem, getTypeStyle } from "./pokedexData";


// ==============================
// Component Definition
// ==============================

// Renders the invisible Pokédex grid and manages the selected Pokémon popup card
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
        <>
            <table
                className={`w-full table-fixed border-collapse border-0 bg-transparent ${className}`.trim()}>
                <tbody>
                    {Array.from({ length: rowCount }, (_, rowIndex) => (
                        <tr key={rowIndex} className="border-0 bg-transparent">
                            {Array.from({ length: columns }, (_, colIndex) => {
                                const item = pokemon[rowIndex * columns + colIndex];
                                const primaryStyle = item ? getTypeStyle(item.types[0]) : null;
                                return (
                                    <td
                                        key={colIndex}
                                        className="border-0 bg-transparent p-2 text-center align-top">
                                        {item && primaryStyle ? (
                                            <button
                                                type="button"
                                                onClick={() => setSelected(item)}
                                                style={{ backgroundColor: primaryStyle.cardBg }}
                                                className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl p-3 transition-transform duration-150 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2">
                                                <span className="text-xs font-semibold opacity-70">
                                                    #{String(item.dexNumber).padStart(4, "0")}
                                                </span>
                                                <PokemonSprite src={item.imageUrl} alt={item.name} />
                                                <span className="text-sm font-medium capitalize">
                                                    {item.name}
                                                </span>
                                                {item.types.length > 0 && (
                                                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                                                        {item.types.map((typeName) => {
                                                            const style = getTypeStyle(typeName);
                                                            return (
                                                                <span
                                                                    key={typeName}
                                                                    style={{
                                                                        backgroundColor: style.badgeBg,
                                                                        color: style.badgeText,
                                                                    }}
                                                                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
                                                                    {typeName}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </button>
                                        ) : null}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

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
