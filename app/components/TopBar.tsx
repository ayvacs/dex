"use client";
// Top bar with navigation links


// ==============================
// Imports
// ==============================

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./TopBar.css";


// ==============================
// Constants
// ==============================

const NAV_ITEMS = [
    { label: "Pokédex", href: "/" },
    { label: "Source Code", href: "https://github.com/ayvacs/dex", newTab: true },
    { label: "PokéAPI", href: "https://pokeapi.co/v2#", newTab: true }
] as const;


// ==============================
// Component Definition
// ==============================

export function TopBar() {
    const pathname = usePathname();

    return (
        <header className="relative w-full text-center">
            {/* Topbar Band 1 (Red) */}
            <div className="topbar-band topbar-band-red">
                <Link href="/" className="topbar-title">Pokédex Online</Link>
            </div>

            {/* Topbar Band 2 (Black) */}
            <div className="h-2.5 w-full bg-black" />
            <div aria-hidden="true" className="pokeball-emblem" />

            {/* Topbar Band 3 (White) */}
            <nav aria-label="Primary" className="topbar-band topbar-band-light gap-2.5">
                {NAV_ITEMS.map(({ label, href, newTab }) => (
                    <Link
                        target={newTab ? "_blank" : undefined}
                        key={href}
                        href={href}
                        className={`topbar-link ${pathname === href ? "underline" : "no-underline hover:underline"}`}>
                            {label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
