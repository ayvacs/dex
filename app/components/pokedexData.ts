// ==============================
// Constants
// ==============================

export const POKEDEX_URL = "https://pokeapi.co/api/v2/pokedex/1/";
export const TYPE_LIST_URL = "https://pokeapi.co/api/v2/type/";
export const IMAGE_SIZE_PX = 96;
export const SKELETON_ROWS = 4;


// ==============================
// Types
// ==============================

// Visual theme colours for a Pokémon type badge and its card background
export interface TypeStyle {
    badgeBg: string;
    badgeText: string;
    cardBg: string;
}

// Response shape from the PokeAPI `/type` index endpoint
export interface TypeListResponse {
    results: Array<{
        name: string;
        url: string;
    }>;
}

// Minimal species reference returned inside a Pokédex entry.
export interface PokemonSpeciesRef {
    name: string;
    url: string;
}

// Single entry in the National Pokédex list.
export interface PokedexEntry {
    entry_number: number;
    pokemon_species: PokemonSpeciesRef;
}

// Response shape from the PokeAPI `/pokedex/1` endpoint.
export interface PokedexApiResponse {
    pokemon_entries: PokedexEntry[];
}

// Mapping of a Pokémon to a specific type slot (1 = primary, 2 = secondary).
export interface TypePokemonEntry {
    slot: number;
    pokemon: {
        name: string;
        url: string;
    };
}

// Response shape from an individual PokeAPI `/type/{name}` endpoint.
export interface TypeApiResponse {
    name: string;
    pokemon: TypePokemonEntry[];
}

// Normalized Pokémon data rendered in each Pokédex cell.
export interface PokemonItem {
    id: string;
    dexNumber: number;
    name: string;
    imageUrl: string;
    types: string[];
}

// Detailed useful & niche Pokémon data fetched on demand for the popup card.
export interface PokemonDetail {
    artworkUrl: string;
    shinyArtworkUrl: string | null;
    cryUrl: string | null;
    genus: string | null;
    flavorText: string | null;
    heightMeters: number;
    weightKg: number;
    abilities: Array<{ name: string; isHidden: boolean }>;
    stats: Array<{ label: string; value: number; effort: number }>;
    baseStatTotal: number;
    catchRate: number;
    baseHappiness: number | null;
    genderRate: number;
    eggGroups: string[];
    hatchSteps: number | null;
    growthRate: string | null;
    isLegendary: boolean;
    isMythical: boolean;
    isBaby: boolean;
}

// Result wrapper returned by `fetchPokedex` so Suspense never receives an unhandled rejection.
export interface PokedexLoadResult {
    items: PokemonItem[];
    error: string | null;
}


// ==============================
// Data
// ==============================

export const TYPE_STYLES: Record<string, TypeStyle> = {
    normal:     { badgeBg: "#6b6b56", badgeText: "#ffffff", cardBg: "rgba(107, 107, 86, 0.16)"  },
    fire:       { badgeBg: "#b8402e", badgeText: "#ffffff", cardBg: "rgba(184, 64, 46, 0.16)"   },
    water:      { badgeBg: "#3566b8", badgeText: "#ffffff", cardBg: "rgba(53, 102, 184, 0.16)"  },
    electric:   { badgeBg: "#a68216", badgeText: "#ffffff", cardBg: "rgba(166, 130, 22, 0.16)"  },
    grass:      { badgeBg: "#427d32", badgeText: "#ffffff", cardBg: "rgba(66, 125, 50, 0.16)"   },
    ice:        { badgeBg: "#4a8f96", badgeText: "#ffffff", cardBg: "rgba(74, 143, 150, 0.16)"  },
    fighting:   { badgeBg: "#8c2d23", badgeText: "#ffffff", cardBg: "rgba(140, 45, 35, 0.16)"   },
    poison:     { badgeBg: "#7a367c", badgeText: "#ffffff", cardBg: "rgba(122, 54, 124, 0.16)"  },
    ground:     { badgeBg: "#997736", badgeText: "#ffffff", cardBg: "rgba(153, 119, 54, 0.16)"  },
    flying:     { badgeBg: "#645ca8", badgeText: "#ffffff", cardBg: "rgba(100, 92, 168, 0.16)"  },
    psychic:    { badgeBg: "#b03a62", badgeText: "#ffffff", cardBg: "rgba(176, 58, 98, 0.16)"   },
    bug:        { badgeBg: "#6d7d22", badgeText: "#ffffff", cardBg: "rgba(109, 125, 34, 0.16)"  },
    rock:       { badgeBg: "#827136", badgeText: "#ffffff", cardBg: "rgba(130, 113, 54, 0.16)"  },
    ghost:      { badgeBg: "#503d70", badgeText: "#ffffff", cardBg: "rgba(80, 61, 112, 0.18)"   },
    dragon:     { badgeBg: "#4e32a8", badgeText: "#ffffff", cardBg: "rgba(78, 50, 168, 0.16)"   },
    dark:       { badgeBg: "#4d3e35", badgeText: "#ffffff", cardBg: "rgba(77, 62, 53, 0.2)"     },
    steel:      { badgeBg: "#646b7a", badgeText: "#ffffff", cardBg: "rgba(100, 107, 122, 0.16)" },
    fairy:      { badgeBg: "#a3567a", badgeText: "#ffffff", cardBg: "rgba(163, 86, 122, 0.16)"  },
};


// ==============================
// Helpers
// ==============================

// Extracts the trailing numeric ID segment from a PokeAPI resource URL.
export function extractIdFromUrl(url: string): string | undefined {
    return url.split("/").filter(Boolean).pop();
}

// Builds the PokeAPI sprite image URL for a given Pokémon species ID.
export function getSpriteUrl(speciesId: string): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
}

// Computes an unsigned 32-bit FNV-1a hash for deterministic fallback colour generation.
export function hashString(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

// Returns the badge and card background colours for a type name, with a deterministic fallback.
export function getTypeStyle(typeName?: string): TypeStyle {
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

/**
 * Fetches all Pokémon types from the `/type` endpoint and indexes them by Pokémon ID.
 * Fetching per-type (~20 requests) avoids making 1,000+ individual `/pokemon/{id}` requests.
 */
export async function fetchTypesByPokemonId(): Promise<Map<string, string[]>> {
    const listResponse = await fetch(TYPE_LIST_URL, { method: "GET", cache: "force-cache" });
    if (!listResponse.ok) {
        throw new Error(`Failed to fetch type list (${listResponse.status})`);
    }
    const typeList: TypeListResponse = await listResponse.json();

    const typeResponses = await Promise.all(
        (typeList.results ?? []).map(async ({ name, url }) => {
            const response = await fetch(url, { method: "GET", cache: "force-cache" });
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

    // Sort each Pokémon's types by slot so primary type (slot 1) always comes first.
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

// Fetches the National Pokédex entries and merges them with their resolved types.
export async function fetchPokedex(): Promise<PokedexLoadResult> {
    try {
        const [pokedexResponse, typesById] = await Promise.all([
            fetch(POKEDEX_URL, { method: "GET", cache: "force-cache" }),
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
                id: speciesId,
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

// Module-level promise cache so React `use()` does not re-trigger fetches across re-renders.
let pokedexPromise: Promise<PokedexLoadResult> | null = null;

// Returns the cached Pokédex fetch promise, initializing it on first call.
export function getPokedexPromise(): Promise<PokedexLoadResult> {
    if (!pokedexPromise) {
        pokedexPromise = fetchPokedex();
    }
    return pokedexPromise;
}

const STAT_LABELS: Record<string, string> = {
    hp: "HP",
    attack: "Atk",
    defense: "Def",
    "special-attack": "SpA",
    "special-defense": "SpD",
    speed: "Spe",
};

const detailCache = new Map<string, Promise<PokemonDetail>>();

// Fetches useful and niche details for a single Pokémon on demand, with in-memory caching.
export function fetchPokemonDetail(id: string, fallbackSpriteUrl: string): Promise<PokemonDetail> {
    const cached = detailCache.get(id);
    if (cached) return cached;

    const promise = (async () => {
        const [pokemonRes, speciesRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`),
        ]);

        if (!pokemonRes.ok || !speciesRes.ok) {
            throw new Error("Failed to load Pokémon details");
        }

        const [pokemonData, speciesData] = await Promise.all([
            pokemonRes.json(),
            speciesRes.json(),
        ]);

        const officialArt = pokemonData.sprites?.other?.["official-artwork"];
        const stats: PokemonDetail["stats"] = (pokemonData.stats ?? []).map(
            (s: { base_stat: number; effort: number; stat: { name: string } }) => ({
                label: STAT_LABELS[s.stat.name] ?? s.stat.name,
                value: s.base_stat,
                effort: s.effort,
            })
        );

        const englishGenus =
            (speciesData.genera ?? []).find(
                (g: { language: { name: string }; genus: string }) => g.language.name === "en"
            )?.genus ?? null;

        // Grab the latest English Pokédex flavor text and normalize whitespace/form-feeds.
        const englishFlavorEntry = [...(speciesData.flavor_text_entries ?? [])]
            .reverse()
            .find((f: { language: { name: string } }) => f.language.name === "en");
        const flavorText = englishFlavorEntry
            ? String(englishFlavorEntry.flavor_text).replace(/[\f\n\r]+/g, " ").trim()
            : null;

        return {
            artworkUrl: officialArt?.front_default ?? fallbackSpriteUrl,
            shinyArtworkUrl: officialArt?.front_shiny ?? pokemonData.sprites?.front_shiny ?? null,
            cryUrl: pokemonData.cries?.latest ?? null,
            genus: englishGenus,
            flavorText,
            heightMeters: (pokemonData.height ?? 0) / 10,
            weightKg: (pokemonData.weight ?? 0) / 10,
            abilities: (pokemonData.abilities ?? []).map(
                (a: { is_hidden: boolean; ability: { name: string } }) => ({
                    name: a.ability.name.replace(/-/g, " "),
                    isHidden: a.is_hidden,
                })
            ),
            stats,
            baseStatTotal: stats.reduce((sum, s) => sum + s.value, 0),
            catchRate: speciesData.capture_rate ?? 0,
            baseHappiness: speciesData.base_happiness ?? null,
            genderRate: speciesData.gender_rate ?? -1,
            eggGroups: (speciesData.egg_groups ?? []).map(
                (g: { name: string }) => g.name.replace(/-/g, " ")
            ),
            hatchSteps:
                typeof speciesData.hatch_counter === "number"
                    ? speciesData.hatch_counter * 255
                    : null,
            growthRate: speciesData.growth_rate?.name?.replace(/-/g, " ") ?? null,
            isLegendary: Boolean(speciesData.is_legendary),
            isMythical: Boolean(speciesData.is_mythical),
            isBaby: Boolean(speciesData.is_baby),
        };
    })().catch((err) => {
        detailCache.delete(id);
        throw err;
    });

    detailCache.set(id, promise);
    return promise;
}
