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

interface NavItem {
    label: string;
    href: string;
    newTab?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Pokédex",     href: "/"                                           },
    { label: "Source Code", href: "https://github.com/ayvacs/dex", newTab: true },
    { label: "PokéAPI",     href: "https://pokeapi.co/v2#",        newTab: true }
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
                {NAV_ITEMS.map((item) => (
                    <Link
                        target={item.newTab ? "_blank" : undefined}
                        key={item.href}
                        href={item.href}
                        className={`topbar-link ${pathname === item.href ? "underline" : "no-underline hover:underline"}`}>
                            {item.label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
