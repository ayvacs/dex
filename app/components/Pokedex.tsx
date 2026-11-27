"use client";


// ==============================
// Imports
// ==============================

import { Suspense, use, useEffect, useRef, useState } from "react";


// ==============================
// Constants
// ==============================

const POKEDEX_URL = "https://pokeapi.co/api/v2/pokedex/1/";
const IMAGE_SIZE_PX = 96;
const SKELETON_ROWS = 4;


// ==============================
// Types
// ==============================

interface PokemonSpeciesRef {
    name: string;
    url: string;
}

interface PokedexEntry {
    entry_number: number;
    pokemon_species: PokemonSpeciesRef;
}

interface PokedexApiResponse {
    pokemon_entries: PokedexEntry[];
}

interface PokemonItem {
    name: string;
    imageUrl: string;
}

interface PokedexLoadResult {
    items: PokemonItem[];
    error: string | null;
}

export interface PokedexProps {
    columns?: number;
    className?: string;
}


// ==============================
// Helpers
// ==============================

function getSpriteUrl(speciesUrl: string, fallbackId: number): string {
    const id = speciesUrl.split("/").filter(Boolean).pop() ?? String(fallbackId);
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

async function fetchPokedex(): Promise<PokedexLoadResult> {
    const options = { method: "GET" };

    try {
        const response = await fetch(POKEDEX_URL, options);
        if (!response.ok) {
            throw new Error(`Failed to fetch Pokédex (${response.status})`);
        }
        const data: PokedexApiResponse = await response.json();
        const items: PokemonItem[] = (data.pokemon_entries ?? []).map((entry) => ({
            name: entry.pokemon_species.name,
            imageUrl: getSpriteUrl(entry.pokemon_species.url, entry.entry_number),
        }));
        return { items, error: null };
    } catch (err) {
        console.error(err);
        return {
            items: [],
            error: err instanceof Error ? err.message : "Failed to load Pokédex",
        };
    }
}

let pokedexPromise: Promise<PokedexLoadResult> | null = null;

function getPokedexPromise(): Promise<PokedexLoadResult> {
    if (!pokedexPromise) {
        pokedexPromise = fetchPokedex();
    }
    return pokedexPromise;
}


// ==============================
// Subcomponents
// ==============================

function PokemonSprite({ src, alt }: { src: string; alt: string }) {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
    const imgRef = useRef<HTMLImageElement | null>(null);

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
                className={`block shrink-0 object-contain text-transparent transition-opacity duration-200 ${
                    status === "loaded" ? "opacity-100" : "opacity-0"
                }`}
            />
        </div>
    );
}

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
                                className="border-0 bg-transparent p-3 text-center align-top">
                                <div className="flex animate-pulse flex-col items-center justify-center gap-1">
                                    <div
                                        style={{ width: IMAGE_SIZE_PX, height: IMAGE_SIZE_PX }}
                                        className="shrink-0 rounded-md bg-neutral-200 dark:bg-neutral-800"
                                    />
                                    <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function PokedexTable({ columns, className }: { columns: number; className: string }) {
    const { items: pokemon, error } = use(getPokedexPromise());

    if (error)
        return <p className="p-4 text-center text-sm text-red-600">{error}</p>;

    const rowCount = Math.ceil(pokemon.length / columns);

    return (
        <table
            className={`w-full table-fixed border-collapse border-0 bg-transparent ${className}`.trim()}>
            <tbody>
                {Array.from({ length: rowCount }, (_, rowIndex) => (
                    <tr key={rowIndex} className="border-0 bg-transparent">
                        {Array.from({ length: columns }, (_, colIndex) => {
                            const item = pokemon[rowIndex * columns + colIndex];
                            return (
                                <td
                                    key={colIndex}
                                    className="border-0 bg-transparent p-3 text-center align-top">
                                    {item ? (
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <PokemonSprite src={item.imageUrl} alt={item.name} />
                                            <span className="text-sm font-medium capitalize">
                                                {item.name}
                                            </span>
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

export function Pokedex({
    columns = 6,
    className = "",
}: PokedexProps) {
    const safeColumns = Math.max(1, Math.floor(columns));

    return (
        <Suspense fallback={<PokedexSkeleton columns={safeColumns} className={className} />}>
            <PokedexTable columns={safeColumns} className={className} />
        </Suspense>
    );
}
