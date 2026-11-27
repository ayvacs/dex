// Main Pokédex index page


import { Suspense } from "react";
import { Pokedex, PokedexSkeleton } from "./components/Pokedex";

export default function Home() {
    return (
        <div id="main" className="w-full">
            <Suspense fallback={<PokedexSkeleton />}>
                <Pokedex />
            </Suspense>
        </div>
    );
}
