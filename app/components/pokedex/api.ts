// PokeAPI fetch helpers and Pokédex/generation data loaders.


// ==============================
// Imports
// ==============================

import type {
    GenerationApiResponse,
    GenerationListResponse,
    GenerationSection,
    PokedexApiResponse,
    PokedexLoadResult,
    PokedexSectionsLoadResult,
    PokemonItem,
    PokemonSpeciesRef,
    TypeApiResponse,
    TypeListResponse,
} from "./types";


// ==============================
// Constants
// ==============================

export const POKEDEX_URL = "https://pokeapi.co/api/v2/pokedex/1/";
export const TYPE_LIST_URL = "https://pokeapi.co/api/v2/type/";
export const GENERATION_LIST_URL = "https://pokeapi.co/api/v2/generation/";
export const REVALIDATE_SECONDS = 86400;
export const IMAGE_SIZE_PX = 96;
export const SKELETON_ROWS = 4;


// ==============================
// Helpers
// ==============================

// Extracts the trailing numeric ID segment from a PokeAPI resource URL.
export function extractIdFromUrl(url: string): string | undefined
{
    return url.split("/").filter(Boolean).pop();
}

// Gets the PokeAPI sprite image URL for a given Pokémon species ID.
export function getSpriteUrl(speciesId: string): string
{
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
}

// Fetches JSON from a PokeAPI endpoint with Next.js revalidation caching.
async function fetchCachedJson<T>(url: string, label: string): Promise<T>
{
    const response = await fetch(url, {
        method: "GET",
        next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok)
        throw new Error(`Failed to fetch ${label} (${response.status})`);

    return (await response.json()) as T;
}

// Indexes each Pokémon's types by ID, sorted so primary type (slot 1) comes first.
function indexTypeSlots(typeResponses: TypeApiResponse[]): Map<string, string[]>
{
    const slotMap = new Map<string, Array<{ slot: number; type: string }>>();

    for (const typeData of typeResponses) {
        for (const entry of typeData.pokemon ?? []) {
            const id = extractIdFromUrl(entry.pokemon.url);
            if (!id)
                continue;

            const list = slotMap.get(id) ?? [];
            list.push({ slot: entry.slot, type: typeData.name });
            slotMap.set(id, list);
        }
    }

    const result = new Map<string, string[]>();
    for (const [id, entries] of slotMap) {
        entries.sort((a, b) => a.slot - b.slot);
        result.set(id, entries.map((e) => e.type));
    }

    return result;
}

// Fetches all Pokémon types from `/type` and indexes them by Pokémon ID.
// Fetching per-type (~20 requests) avoids making 1,000+ individual `/pokemon/{id}` requests.
export async function fetchTypesByPokemonId(): Promise<Map<string, string[]>>
{
    const typeList = await fetchCachedJson<TypeListResponse>(TYPE_LIST_URL, "type list");
    const typeResponses = await Promise.all(
        (typeList.results ?? []).map(({ name, url }) =>
            fetchCachedJson<TypeApiResponse>(url, `type ${name}`)
        )
    );

    return indexTypeSlots(typeResponses);
}

// Fetches the National Pokédex entries and merges them with their resolved types.
export async function fetchPokedex(): Promise<PokedexLoadResult>
{
    try {
        const [data, typesById] = await Promise.all([
            fetchCachedJson<PokedexApiResponse>(POKEDEX_URL, "Pokédex"),
            fetchTypesByPokemonId(),
        ]);

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
export function getPokedexPromise(): Promise<PokedexLoadResult>
{
    if (!pokedexPromise)
        pokedexPromise = fetchPokedex();
    return pokedexPromise;
}

// Formats a generation's English display name from its PokeAPI metadata.
function formatGenerationName(gen: GenerationApiResponse): string
{
    const english = (gen.names ?? []).find((entry) => entry.language.name === "en")?.name;
    if (english)
        return english;

    // Replace all dashes with spaces
    return gen.name.replace(/-/g, " ");
}

// Fetches all generations dynamically from PokeAPI, sorted by generation ID.
async function fetchGenerations(): Promise<GenerationApiResponse[]>
{
    const listData = await fetchCachedJson<GenerationListResponse>(
        GENERATION_LIST_URL,
        "generation list"
    );
    const generations = await Promise.all(
        (listData.results ?? []).map(({ name, url }) =>
            fetchCachedJson<GenerationApiResponse>(url, name)
        )
    );

    return generations.sort((a, b) => a.id - b.id);
}

// Resolves a generation species entry to a Pokédex item, falling back to species metadata if needed.
function resolveSpeciesItem(
    species: PokemonSpeciesRef,
    itemsById: Map<string, PokemonItem>,
    typesById: Map<string, string[]>
): PokemonItem | null
{
    const speciesId = extractIdFromUrl(species.url);
    if (!speciesId)
        return null;

    const existing = itemsById.get(speciesId);
    if (existing)
        return existing;

    const dexNumber = Number(speciesId);
    return {
        id: speciesId,
        dexNumber: Number.isFinite(dexNumber) ? dexNumber : 0,
        name: species.name,
        imageUrl: getSpriteUrl(speciesId),
        types: typesById.get(speciesId) ?? [],
    };
}

// Builds a sorted generation section from raw PokeAPI generation metadata.
function buildGenerationSection(
    gen: GenerationApiResponse,
    itemsById: Map<string, PokemonItem>,
    typesById: Map<string, string[]>
): GenerationSection
{
    const items = (gen.pokemon_species ?? [])
        .map((species) => resolveSpeciesItem(species, itemsById, typesById))
        .filter((item): item is PokemonItem => item !== null)
        .sort((a, b) => a.dexNumber - b.dexNumber);

    return {
        id: gen.id,
        name: formatGenerationName(gen),
        region: gen.main_region?.name ?? null,
        items,
    };
}

// Fetches the Pokédex grouped into sections for each generation released in PokeAPI.
export async function fetchPokedexByGeneration(): Promise<PokedexSectionsLoadResult>
{
    try {
        const [pokedexResult, generations, typesById] = await Promise.all([
            fetchPokedex(),
            fetchGenerations(),
            fetchTypesByPokemonId(),
        ]);

        if (pokedexResult.error)
            return { sections: [], error: pokedexResult.error };

        const itemsById = new Map(pokedexResult.items.map((item) => [item.id, item]));
        const sections = generations
            .map((gen) => buildGenerationSection(gen, itemsById, typesById))
            .filter((section) => section.items.length > 0);

        return { sections, error: null };
    } catch (err) {
        console.error(err);
        return {
            sections: [],
            error: err instanceof Error ? err.message : "Failed to load Pokédex generations",
        };
    }
}
