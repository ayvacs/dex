"use client";


// ==============================
// Imports
// ==============================

import { useEffect, useState } from "react";
import { PokemonSprite } from "./PokemonSprite";
import {
    IMAGE_SIZE_PX,
    type PokemonDetail,
    type PokemonItem,
    fetchPokemonDetail,
    getTypeStyle,
} from "./pokedexData";


// ==============================
// Helpers
// ==============================

/** Formats PokeAPI's 8-step `gender_rate` into a readable male/female split. */
function formatGenderRatio(genderRate: number): string
{
    if (genderRate < 0)
        return "Genderless";
    if (genderRate === 0)
        return "100% ♂";
    if (genderRate === 8)
        return "100% ♀";

    const femalePct = (genderRate / 8) * 100;
    const malePct = 100 - femalePct;

    return `${malePct}% ♂ / ${femalePct}% ♀`;
}


// ==============================
// Component Definition
// ==============================

/** Popup card displaying useful and cool PokeAPI details for the selected Pokémon. */
export function PokemonDetailModal({
    pokemon,
    onClose,
}: {
    pokemon: PokemonItem;
    onClose: () => void;
}) {
    const [detail, setDetail] = useState<PokemonDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isShiny, setIsShiny] = useState(false);
    const [fontsReady, setFontsReady] = useState(
        () =>
            typeof document === "undefined" ||
            !document.fonts ||
            document.fonts.status === "loaded"
    );

    // Wait for web fonts to finish loading before revealing the card.
    useEffect(() => {
        if (fontsReady) return;
        let isCancelled = false;
        document.fonts.ready.then(() => {
            if (!isCancelled)
                setFontsReady(true);
        });
        return () => {
            isCancelled = true;
        };
    }, [fontsReady]);

    // Effect for when the modal opens.
    useEffect(() => {
        let isCancelled = false;

        fetchPokemonDetail(pokemon.id, pokemon.imageUrl)
            .then((data) => {
                if (!isCancelled)
                    setDetail(data);
            })
            .catch((err) => {
                if (!isCancelled)
                    setError(err instanceof Error ? err.message : "Failed to load details");
            });

        return () => {
            isCancelled = true;
        };
    }, [pokemon.id, pokemon.imageUrl]);

    // Effect for when the modal closes.
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent)
        {
            if (event.key === "Escape")
                onClose();
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Build out the modal.
    const primaryStyle = getTypeStyle(pokemon.types[0]);
    const displayImage = detail
        ? isShiny && detail.shinyArtworkUrl
            ? detail.shinyArtworkUrl
            : detail.artworkUrl
        : null;
    const evYield = detail?.stats.filter((s) => s.effort > 0) ?? [];

    function playCry()
    {
        if (!detail?.cryUrl) return;
        const audio = new Audio(detail.cryUrl);
        audio.volume = 0.35;
        audio.play().catch(() => {});
    }

    if (!fontsReady)
        return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`${pokemon.name} details`}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: primaryStyle.badgeBg }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-white text-neutral-900 shadow-2xl dark:bg-neutral-950 dark:text-neutral-100">
                {/* Tinted top header */}
                <div
                    style={{ backgroundColor: primaryStyle.cardBg }}
                    className="relative px-5 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold opacity-75">
                            <span>
                                #{String(pokemon.dexNumber).padStart(4, "0")}
                                {detail?.genus ? `\u00A0\u00A0\u00A0·\u00A0\u00A0\u00A0${detail.genus}` : ""}
                            </span>
                            {!detail && !error && (
                                <span
                                    aria-hidden="true"
                                    className="inline-block h-3.5 w-24 animate-pulse rounded bg-black/15 dark:bg-white/15"
                                />
                            )}

                            // Add special badges for different purposes.
                            {detail?.isLegendary && (
                                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-600 dark:text-amber-300">
                                    Legendary
                                </span>
                            )}
                            {detail?.isMythical && (
                                <span className="rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-[10px] text-fuchsia-600 dark:text-fuchsia-300">
                                    Mythical
                                </span>
                            )}
                            {detail?.isBaby && (
                                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-600 dark:text-sky-300">
                                    Baby
                                </span>
                            )}
                        </div>

                        // Closing button.
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="rounded-lg px-2 py-0.5 text-lg leading-none opacity-70 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10">
                            ×
                        </button>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                        // Give it a container for the image.
                        <div
                            style={{ width: IMAGE_SIZE_PX, height: IMAGE_SIZE_PX }}
                            className="relative flex shrink-0 items-center justify-center">
                            {displayImage ? (
                                <PokemonSprite
                                    key={displayImage}
                                    src={displayImage}
                                    alt={pokemon.name}
                                />
                            ) : (
                                <div
                                    aria-hidden="true"
                                    className="h-full w-full animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-bold capitalize">{pokemon.name}</h2>
                            // Container for the types badges.
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {pokemon.types.map((typeName) => {
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

                            // These are buttons that toggle different behaviours.
                            {detail ? (
                                <div className="mt-2 flex gap-2">
                                    {detail.shinyArtworkUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setIsShiny((prev) => !prev)}
                                            className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${
                                                isShiny
                                                    ? "bg-amber-500/25 text-amber-700 dark:text-amber-300"
                                                    : "bg-black/10 hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15"
                                            }`}>
                                            ✨ {isShiny ? "Shiny" : "Normal"}
                                        </button>
                                    )}
                                    {detail.cryUrl && (
                                        <button
                                            type="button"
                                            onClick={playCry}
                                            className="rounded-md bg-black/10 px-2 py-0.5 text-xs font-medium transition hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15">
                                            🔊 Cry
                                        </button>
                                    )}
                                </div>
                            ) : (
                                !error && (
                                    <div aria-hidden="true" className="mt-2 flex animate-pulse gap-2">
                                        <div className="h-5 w-16 rounded-md bg-black/10 dark:bg-white/10" />
                                        <div className="h-5 w-12 rounded-md bg-black/10 dark:bg-white/10" />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-3 p-5 text-xs">
                    {error && <p className="text-red-500">{error}</p>}

                    {!detail && !error && (
                        <div aria-busy="true" aria-label="Loading details" className="animate-pulse space-y-3">
                            {/* Flavor text placeholder */}
                            <div className="space-y-1.5">
                                <div className="h-3.5 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                                <div className="h-3.5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
                            </div>

                            {/* Quick facts 2x3 grid placeholder */}
                            <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
                                {Array.from({ length: 6 }, (_, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                                        <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                                    </div>
                                ))}
                            </div>

                            {/* Abilities placeholder */}
                            <div>
                                <div className="mb-1 h-3.5 w-14 rounded bg-neutral-200 dark:bg-neutral-800" />
                                <div className="flex flex-wrap gap-1.5">
                                    <div className="h-6 w-20 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                                    <div className="h-6 w-28 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                                </div>
                            </div>

                            {/* Base stats 6-row placeholder */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <div className="h-3.5 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                                    <div className="h-3.5 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
                                </div>
                                <div className="space-y-1">
                                    {Array.from({ length: 6 }, (_, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="h-3.5 w-8 rounded bg-neutral-200 dark:bg-neutral-800" />
                                            <div className="h-3.5 w-7 rounded bg-neutral-200 dark:bg-neutral-800" />
                                            <div className="h-1.5 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {detail && (
                        // Wrap everything in a Fragment (invisible wrapper)
                        // because we can only react one single dom element
                        <>
                            {detail.flavorText && (
                                <p className="leading-relaxed opacity-85">{detail.flavorText}</p>
                            )}

                            {/* Quick useful & niche facts */}
                            <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
                                <div>
                                    <span className="block opacity-60">Size</span>
                                    <span className="font-semibold">
                                        {detail.heightMeters} m · {detail.weightKg} kg
                                    </span>
                                </div>
                                <div>
                                    <span className="block opacity-60">Catch Rate</span>
                                    <span className="font-semibold">
                                        {detail.catchRate} / 255
                                    </span>
                                </div>
                                <div>
                                    <span className="block opacity-60">Gender Ratio</span>
                                    <span className="font-semibold">
                                        {formatGenderRatio(detail.genderRate)}
                                    </span>
                                </div>
                                <div>
                                    <span className="block opacity-60">EV Yield</span>
                                    <span className="font-semibold">
                                        {evYield.length > 0
                                            ? evYield.map((s) => `+${s.effort} ${s.label}`).join(", ")
                                            : "None"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block opacity-60">Egg Groups</span>
                                    <span className="font-semibold capitalize">
                                        {detail.eggGroups.length > 0
                                            ? detail.eggGroups.join(", ")
                                            : "—"}
                                        {detail.hatchSteps ? ` (${detail.hatchSteps.toLocaleString()} steps)` : ""}
                                    </span>
                                </div>
                                <div>
                                    <span className="block opacity-60">Growth / Friendship</span>
                                    <span className="font-semibold capitalize">
                                        {detail.growthRate ?? "—"}
                                        {detail.baseHappiness !== null ? ` · ${detail.baseHappiness}♥` : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Abilities */}
                            <div>
                                <span className="mb-1 block font-semibold opacity-70">Abilities</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {detail.abilities.map((ability) => (
                                        <span
                                            key={ability.name}
                                            className="rounded-md bg-neutral-100 px-2 py-1 font-medium capitalize dark:bg-neutral-900">
                                            {ability.name}
                                            {ability.isHidden && (
                                                <span className="ml-1 text-[10px] opacity-60">
                                                    (Hidden)
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Base Stats */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between font-semibold opacity-70">
                                    <span>Base Stats</span>
                                    <span>BST {detail.baseStatTotal}</span>
                                </div>
                                <div className="space-y-1">
                                    {detail.stats.map((stat) => (
                                        <div key={stat.label} className="flex items-center gap-2">
                                            <span className="w-8 font-medium opacity-70">
                                                {stat.label}
                                            </span>
                                            <span className="w-7 text-right font-semibold tabular-nums">
                                                {stat.value}
                                            </span>
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                                <div
                                                    style={{
                                                        width: `${Math.min(100, (stat.value / 180) * 100)}%`,
                                                        backgroundColor: primaryStyle.badgeBg,
                                                    }}
                                                    className="h-full rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
