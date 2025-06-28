type Swatch = {
  rgb: [number, number, number];
  population: number;
  hex: string;
  hsl: [number, number, number];
  titleTextColor: string;
  bodyTextColor: string;
};

export interface Palette {
  Vibrant: Swatch | null;
  Muted: Swatch | null;
  DarkVibrant: Swatch | null;
  DarkMuted: Swatch | null;
  LightVibrant: Swatch | null;
  LightMuted: Swatch | null;
  [name: string]: Swatch | null;
}
