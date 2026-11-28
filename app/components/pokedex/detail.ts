// On-demand detail and species fetching with in-memory caching.


// ==============================
// Imports
// ==============================

import type { PokemonDetail } from "./types";


// ==============================
// Constants
// ==============================

// Convert internal labels to external user-facing labels for stats
const STAT_LABELS: Record<string, string> =
{
    hp:                 "HP",
    attack:             "Atk",
    defense:            "Def",
    "special-attack":   "SpA",
    "special-defense":  "SpD",
    speed:              "Spe",
};

const detailCache = new Map<string, Promise<PokemonDetail>>();


// ==============================
// Helpers
// ==============================

// Fetches and normalizes detail and species payloads for a single Pokémon.
async function loadPokemonDetail(id: string, fallbackSpriteUrl: string): Promise<PokemonDetail>
{
    const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`),
    ]);

    if (!pokemonRes.ok || !speciesRes.ok)
        throw new Error("Failed to load Pokémon details");

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
}

// Fetches useful and niche details for a single Pokémon on demand, with in-memory caching.
export function fetchPokemonDetail(id: string, fallbackSpriteUrl: string): Promise<PokemonDetail>
{
    const cached = detailCache.get(id);
    if (cached)
        return cached;

    const promise = loadPokemonDetail(id, fallbackSpriteUrl).catch((err) => {
        detailCache.delete(id);
        throw err;
    });

    detailCache.set(id, promise);
    return promise;
}
