import { Pokedex } from "./components/Pokedex";

export default function Home() {
    return (
        <div id="main" className="w-full">
            <Pokedex rows={5} />
        </div>
    );
}