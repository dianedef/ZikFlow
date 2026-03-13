export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  frequency: number;
  isCore: boolean;
  size: number;
  trail: { x: number; y: number; z: number }[];
  color?: string;
  tempColor?: string;
  tempSize?: number;
}
