// Shared TypeScript interfaces for PokeAPI responses and normalized Pokédex models.


// ==============================
// Styling Types
// ==============================

// Visual theme colours for a Pokémon type badge and its card background
export interface TypeStyle
{
    badgeBg: string;
    badgeText: string;
    cardBg: string;
}


// ==============================
// PokeAPI Response Types
// ==============================

// Response shape from the PokeAPI `/type` index endpoint
export interface TypeListResponse
{
    results: Array<{
        name: string;
        url: string;
    }>;
}

// Minimal species reference returned inside a Pokédex entry.
export interface PokemonSpeciesRef
{
    name: string;
    url: string;
}

// Single entry in the National Pokédex list.
export interface PokedexEntry
{
    entry_number: number;
    pokemon_species: PokemonSpeciesRef;
}

// Response shape from the PokeAPI `/pokedex/1` endpoint.
export interface PokedexApiResponse
{
    pokemon_entries: PokedexEntry[];
}

// Mapping of a Pokémon to a specific type slot (1 = primary, 2 = secondary).
export interface TypePokemonEntry
{
    slot: number;
    pokemon: {
        name: string;
        url: string;
    };
}

// Response shape from an individual PokeAPI `/type/{name}` endpoint.
export interface TypeApiResponse
{
    name: string;
    pokemon: TypePokemonEntry[];
}

// Response shape from the PokeAPI `/generation` index endpoint.
export interface GenerationListResponse
{
    results: Array<{
        name: string;
        url: string;
    }>;
}

// Response shape from an individual PokeAPI `/generation/{id}` endpoint.
export interface GenerationApiResponse
{
    id: number;
    name: string;
    names: Array<{
        name: string;
        language: {
            name: string;
        };
    }>;
    main_region: {
        name: string;
    } | null;
    pokemon_species: PokemonSpeciesRef[];
}


// ==============================
// App View Models
// ==============================

// Normalized Pokémon data rendered in each Pokédex cell.
export interface PokemonItem
{
    id: string;
    dexNumber: number;
    name: string;
    imageUrl: string;
    types: string[];
}

// Detailed useful & niche Pokémon data fetched on demand for the popup card.
export interface PokemonDetail
{
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
export interface PokedexLoadResult
{
    items: PokemonItem[];
    error: string | null;
}

// A single generation section with its Pokémon sorted by National Dex number.
export interface GenerationSection
{
    id: number;
    name: string;
    region: string | null;
    items: PokemonItem[];
}

// Result wrapper returned by `fetchPokedexByGeneration`.
export interface PokedexSectionsLoadResult
{
    sections: GenerationSection[];
    error: string | null;
}
