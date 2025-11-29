export enum ShapeType {
  Sierpinski = 'Sierpinski Triangle',
  Mobius = 'Mobius Strip',
  Heart = 'Cartesian Heart',
  Penrose = 'Penrose Structure',
  Lorenz = 'Lorenz Attractor',
  Galaxy = 'Spiral Galaxy',
  DNA = 'DNA Double Helix',
  Sphere = 'Fibonacci Sphere',
  Klein = 'Klein Bottle',
  Trefoil = 'Trefoil Knot',
  Rossler = 'Rossler Attractor',
  Clifford = 'Clifford Torus',
  Hourglass = 'Spacetime Hourglass',
  Warp = 'Warp Tunnel',
  Quantum = 'Quantum Cloud',
  Flower = 'Exotic Flower',
  BlackHole = 'Black Hole Accretion',
  Lissajous = 'Lissajous Curve',
  GravityWave = 'Gravity Wave',
  Hypercube = 'Hypercube Projection'
}

export interface ColorTheme {
  name: string;
  primary: string;   // Main particle color
  secondary: string; // Bloom/Core color
  bg: string;
}

export const THEMES: ColorTheme[] = [
  { name: 'Deep Space', primary: '#4f85ff', secondary: '#a855f7', bg: '#000000' },
  { name: 'Nebula', primary: '#f97316', secondary: '#ef4444', bg: '#050202' },
  { name: 'Sci-Fi', primary: '#06b6d4', secondary: '#facc15', bg: '#000f0f' },
  { name: 'Matrix', primary: '#22c55e', secondary: '#86efac', bg: '#000500' },
  { name: 'Ethereal', primary: '#f472b6', secondary: '#60a5fa', bg: '#050005' },
];

export interface AppState {
  currentShape: ShapeType;
  theme: ColorTheme;
  zoom: number;
  particleCount: number;
  brightness: number;
}