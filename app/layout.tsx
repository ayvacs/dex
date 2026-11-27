// Root application layout
// Defines fonts, css, and adds the topbar to every page


// ==============================
// Imports
// ==============================

import type { Metadata } from "next";
import { Merriweather_Sans } from 'next/font/google';
import { TopBar } from "./components/TopBar";
import "./globals.css";


// ==============================
// Fonts
// ==============================

const merriweatherSans = Merriweather_Sans({
    subsets: ['latin']
});


// ==============================
// Metadata
// ==============================

export const metadata: Metadata = {
    title: "Pokédex Online",
    description: "An informative Pokédex viewer",
};


// ==============================
// Root
// ==============================

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            className={`${merriweatherSans.className}
                h-full antialiased`}>
            <body
                className="min-h-full flex flex-col">
                <TopBar />
                {children}
            </body>
        </html>
    );
}
