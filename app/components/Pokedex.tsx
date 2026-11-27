"use client";
// Main Pokedex grid


// ==============================
// Imports
// ==============================

import { useEffect, useRef, useState } from "react";
import {
    IMAGE_SIZE_PX,
    type PokedexLoadResult,
    type PokemonItem,
    SKELETON_ROWS,
    getPokedexPromise,
    getTypeStyle,
} from "./pokedexData";


// ==============================
// Types
// ==============================

// Properties for the grid component (can be customzied at the bottom of this file)
export interface PokedexProps {
    columns?: number;
    className?: string;
}


// ==============================
// Subcomponents
// ==============================

// Renders a pokemon sprite with an animated pulse placeholder until loaded
function PokemonSprite({ src, alt }: { src: string; alt: string }) {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Handle images already cached in memory before React attached `onLoad`.
    useEffect(() => {
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth > 0) {
            setStatus("loaded");
        }
    }, [src]);

    return (
        <div
            style={{ width: IMAGE_SIZE_PX, height: IMAGE_SIZE_PX }}
            className="relative shrink-0 overflow-hidden">
            {status === "loading" && (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"
                />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                width={IMAGE_SIZE_PX}
                height={IMAGE_SIZE_PX}
                loading="lazy"
                onLoad={() => setStatus("loaded")}
                onError={() => setStatus("error")}
                style={{
                    width: IMAGE_SIZE_PX,
                    height: IMAGE_SIZE_PX,
                }}
                // text-transparent hides browser alt-text while the sprite is still downloading
                className={`block shrink-0 object-contain text-transparent transition-opacity duration-200 ${
                    status === "loaded" ? "opacity-100" : "opacity-0"
                }`}
            />
        </div>
    );
}

// Animated placeholder table shown by Suspense while the Pokédex API data loads
function PokedexSkeleton({ columns, className }: { columns: number; className: string }) {
    return (
        <table
            aria-busy="true"
            aria-label="Loading Pokédex"
            className={`w-full table-fixed border-collapse border-0 bg-transparent ${className}`.trim()}>
            <tbody>
                {Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                    <tr key={rowIndex} className="border-0 bg-transparent">
                        {Array.from({ length: columns }, (_, colIndex) => (
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

// Renders the full-width invisible grid table for loaded Pokédex entries
function PokedexTable({
    pokemon,
    columns,
    className,
}: {
    pokemon: PokemonItem[];
    columns: number;
    className: string;
}) {
    const rowCount = Math.ceil(pokemon.length / columns);

    return (
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
                                        <div
                                            style={{ backgroundColor: primaryStyle.cardBg }}
                                            className="flex flex-col items-center justify-center gap-1.5 rounded-xl p-3">
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
                                        </div>
                                    ) : null}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}


// ==============================
// Component Definition
// ==============================

// Displays the National Pokédex in an invisible table, fetching on the client
export function Pokedex({
    columns = 6,
    className = "",
}: PokedexProps) {
    const safeColumns = Math.max(1, Math.floor(columns));
    const [result, setResult] = useState<PokedexLoadResult | null>(null);

    // Fetch only in the browser so Next.js static prerendering never triggers uncached `fetch()`.
    useEffect(() => {
        let isCancelled = false;
        getPokedexPromise().then((data) => {
            if (!isCancelled) {
                setResult(data);
            }
        });
        return () => {
            isCancelled = true;
        };
    }, []);

    if (!result) {
        return <PokedexSkeleton columns={safeColumns} className={className} />;
    }

    if (result.error) {
        return <p className="p-4 text-center text-sm text-red-600">{result.error}</p>;
    }

    return <PokedexTable pokemon={result.items} columns={safeColumns} className={className} />;
}
