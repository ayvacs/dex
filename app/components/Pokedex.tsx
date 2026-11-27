// ==============================
// Imports
// ==============================

import type { ReactNode } from "react";


// ==============================
// Types
// ==============================

export interface PokedexProbs {
    rows?: number;
    columns?: number;
    renderCell?: (row: number, col: number, index: number) => ReactNode;
    className?: string;
}


// ==============================
// Component Definition
// ==============================

export function Pokedex({
    rows = 5,
    columns = 3,
    renderCell,
    className = "",
}: PokedexProps) {
    const safeRows = Math.max(0, Math.floor(rows));
    const safeColumns = Math.max(1, Math.floor(columns));

    return (
        <table
            className={`w-full table-fixed border-collapse border-0 bg-transparent ${className}`.trim()}>
            <tbody>
                {Array.from({ length: safeRows }, (_, rowIndex) => (
                    <tr key={rowIndex} className="border-0 bg-transparent">
                        {Array.from({ length: safeColumns }, (_, colIndex) => {
                            const cellIndex = rowIndex * safeColumns + colIndex;
                            return (
                                <td
                                    key={colIndex}
                                    className="border-0 bg-transparent p-0 align-top">
                                    {renderCell ? renderCell(rowIndex, colIndex, cellIndex) : null}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
