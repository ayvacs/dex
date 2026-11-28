// Colour palette and fallback theme generation for Pokémon types.


// ==============================
// Imports
// ==============================

import type { TypeStyle } from "./types";


// ==============================
// Data
// ==============================

export const TYPE_STYLES: Record<string, TypeStyle> =
{
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

// Computes an unsigned 32-bit FNV-1a hash for fallback colour generation.
export function hashString(value: string): number
{
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

// Returns the badge and card background colours for a type name, with a fallback.
export function getTypeStyle(typeName?: string): TypeStyle
{
    if (!typeName)
        return {
            badgeBg: "hsl(220 10% 38%)",
            badgeText: "#ffffff",
            cardBg: "hsl(220 10% 45% / 0.12)",
        };

    const mapped = TYPE_STYLES[typeName.toLowerCase()];
    if (mapped)
        return mapped;

    const hue = hashString(typeName) % 360;
    return {
        badgeBg: `hsl(${hue} 45% 36%)`,
        badgeText: "#ffffff",
        cardBg: `hsl(${hue} 45% 45% / 0.16)`,
    };
}
