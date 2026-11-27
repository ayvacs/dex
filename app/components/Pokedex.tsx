"use client";


// ==============================
// Imports
// ==============================

import { Suspense, use, useEffect, useRef, useState } from "react";


// ==============================
// Constants
// ==============================

const POKEDEX_URL = "https://pokeapi.co/api/v2/pokedex/1/";
const TYPE_LIST_URL = "https://pokeapi.co/api/v2/type/";
const IMAGE_SIZE_PX = 96;
const SKELETON_ROWS = 4;


// ==============================
// Types
// ==============================

interface TypeStyle {
    badgeBg: string;
    badgeText: string;
    cardBg: string;
}

const TYPE_STYLES: Record<string, TypeStyle> = {
    normal: { badgeBg: "#6b6b56", badgeText: "#ffffff", cardBg: "rgba(107, 107, 86, 0.16)" },
    fire: { badgeBg: "#b8402e", badgeText: "#ffffff", cardBg: "rgba(184, 64, 46, 0.16)" },
    water: { badgeBg: "#3566b8", badgeText: "#ffffff", cardBg: "rgba(53, 102, 184, 0.16)" },
    electric: { badgeBg: "#a68216", badgeText: "#ffffff", cardBg: "rgba(166, 130, 22, 0.16)" },
    grass: { badgeBg: "#427d32", badgeText: "#ffffff", cardBg: "rgba(66, 125, 50, 0.16)" },
    ice: { badgeBg: "#4a8f96", badgeText: "#ffffff", cardBg: "rgba(74, 143, 150, 0.16)" },
    fighting: { badgeBg: "#8c2d23", badgeText: "#ffffff", cardBg: "rgba(140, 45, 35, 0.16)" },
    poison: { badgeBg: "#7a367c", badgeText: "#ffffff", cardBg: "rgba(122, 54, 124, 0.16)" },
    ground: { badgeBg: "#997736", badgeText: "#ffffff", cardBg: "rgba(153, 119, 54, 0.16)" },
    flying: { badgeBg: "#645ca8", badgeText: "#ffffff", cardBg: "rgba(100, 92, 168, 0.16)" },
    psychic: { badgeBg: "#b03a62", badgeText: "#ffffff", cardBg: "rgba(176, 58, 98, 0.16)" },
    bug: { badgeBg: "#6d7d22", badgeText: "#ffffff", cardBg: "rgba(109, 125, 34, 0.16)" },
    rock: { badgeBg: "#827136", badgeText: "#ffffff", cardBg: "rgba(130, 113, 54, 0.16)" },
    ghost: { badgeBg: "#503d70", badgeText: "#ffffff", cardBg: "rgba(80, 61, 112, 0.18)" },
    dragon: { badgeBg: "#4e32a8", badgeText: "#ffffff", cardBg: "rgba(78, 50, 168, 0.16)" },
    dark: { badgeBg: "#4d3e35", badgeText: "#ffffff", cardBg: "rgba(77, 62, 53, 0.2)" },
    steel: { badgeBg: "#646b7a", badgeText: "#ffffff", cardBg: "rgba(100, 107, 122, 0.16)" },
    fairy: { badgeBg: "#a3567a", badgeText: "#ffffff", cardBg: "rgba(163, 86, 122, 0.16)" },
};

interface TypeListResponse {
    results: Array<{
        name: string;
        url: string;
    }>;
}

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

interface TypePokemonEntry {
    slot: number;
    pokemon: {
        name: string;
        url: string;
    };
}

interface TypeApiResponse {
    name: string;
    pokemon: TypePokemonEntry[];
}

interface PokemonItem {
    dexNumber: number;
    name: string;
    imageUrl: string;
    types: string[];
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

function extractIdFromUrl(url: string): string | undefined {
    return url.split("/").filter(Boolean).pop();
}

function getSpriteUrl(speciesId: string): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
}

function hashString(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function getTypeStyle(typeName?: string): TypeStyle {
    if (!typeName) {
        return {
            badgeBg: "hsl(220 10% 38%)",
            badgeText: "#ffffff",
            cardBg: "hsl(220 10% 45% / 0.12)",
        };
    }

    const mapped = TYPE_STYLES[typeName.toLowerCase()];
    if (mapped) {
        return mapped;
    }

    const hue = hashString(typeName) % 360;
    return {
        badgeBg: `hsl(${hue} 45% 36%)`,
        badgeText: "#ffffff",
        cardBg: `hsl(${hue} 45% 45% / 0.16)`,
    };
}

async function fetchTypesByPokemonId(): Promise<Map<string, string[]>> {
    const listResponse = await fetch(TYPE_LIST_URL, { method: "GET" });
    if (!listResponse.ok) {
        throw new Error(`Failed to fetch type list (${listResponse.status})`);
    }
    const typeList: TypeListResponse = await listResponse.json();

    const typeResponses = await Promise.all(
        (typeList.results ?? []).map(async ({ name, url }) => {
            const response = await fetch(url, { method: "GET" });
            if (!response.ok) {
                throw new Error(`Failed to fetch type ${name} (${response.status})`);
            }
            return (await response.json()) as TypeApiResponse;
        })
    );

    const slotMap = new Map<string, Array<{ slot: number; type: string }>>();

    for (const typeData of typeResponses) {
        for (const entry of typeData.pokemon ?? []) {
            const id = extractIdFromUrl(entry.pokemon.url);
            if (!id) continue;
            const list = slotMap.get(id) ?? [];
            list.push({ slot: entry.slot, type: typeData.name });
            slotMap.set(id, list);
        }
    }

    const result = new Map<string, string[]>();
    for (const [id, entries] of slotMap) {
        entries.sort((a, b) => a.slot - b.slot);
        result.set(
            id,
            entries.map((e) => e.type)
        );
    }
    return result;
}

async function fetchPokedex(): Promise<PokedexLoadResult> {
    try {
        const [pokedexResponse, typesById] = await Promise.all([
            fetch(POKEDEX_URL, { method: "GET" }),
            fetchTypesByPokemonId(),
        ]);

        if (!pokedexResponse.ok) {
            throw new Error(`Failed to fetch Pokédex (${pokedexResponse.status})`);
        }

        const data: PokedexApiResponse = await pokedexResponse.json();
        const items: PokemonItem[] = (data.pokemon_entries ?? []).map((entry) => {
            const speciesId =
                extractIdFromUrl(entry.pokemon_species.url) ?? String(entry.entry_number);
            return {
                dexNumber: entry.entry_number,
                name: entry.pokemon_species.name,
                imageUrl: getSpriteUrl(speciesId),
                types: typesById.get(speciesId) ?? [],
            };
        });
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

function PokedexTable({ columns, className }: { columns: number; className: string }) {
    const { items: pokemon, error } = use(getPokedexPromise());

    if (error) {
        return <p className="p-4 text-center text-sm text-red-600">{error}</p>;
    }

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
