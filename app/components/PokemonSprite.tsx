"use client";


// ==============================
// Imports
// ==============================

import { useEffect, useRef, useState } from "react";
import { IMAGE_SIZE_PX } from "./pokedexData";


// ==============================
// Component Definition
// ==============================

// Renders a strictly sized Pokémon sprite with an animated pulse placeholder until loaded
export function PokemonSprite({ src, alt }: { src: string; alt: string })
{
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
                // `text-transparent` hides browser alt-text while the sprite is still downloading.
                className={`block shrink-0 object-contain text-transparent transition-opacity duration-200 ${
                    status === "loaded" ? "opacity-100" : "opacity-0"
                }`}
            />
        </div>
    );
}
