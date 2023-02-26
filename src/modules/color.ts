export type Color = {
    r: number;
    g: number;
    b: number;
}




export function newColor(r: number, g: number, b: number): Color {
    return { r, g, b };
}

export function convert(color: Color): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function darken(color: Color, amount: number): Color {
    return {
        r: Math.max(0, color.r - amount),
        g: Math.max(0, color.g - amount),
        b: Math.max(0, color.b - amount)
    }
}




