import { ShapeType } from '../types';
import * as THREE from 'three';

// Helper for randomness
const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateParticles = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const tempVec = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const idx = i * 3;
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ShapeType.Sphere: {
        // Fibonacci Sphere
        const phi = Math.acos(1 - 2 * t);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 10;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ShapeType.Sierpinski: {
        // Chaos Game approximation in 3D (Tetrahedron)
        // We simulate "steps" per particle to find a landing spot
        // Ideally chaos game is iterative, for static array we map closely to tetra shape
        const corners = [
          new THREE.Vector3(10, 10, 10),
          new THREE.Vector3(-10, -10, 10),
          new THREE.Vector3(-10, 10, -10),
          new THREE.Vector3(10, -10, -10),
        ];
        let p = new THREE.Vector3(random(-10, 10), random(-10, 10), random(-10, 10));
        // Simulate a few steps for each particle to stick to the fractal
        for(let s=0; s<5; s++) {
            const corner = corners[Math.floor(Math.random() * 4)];
            p.lerp(corner, 0.5);
        }
        x = p.x; y = p.y; z = p.z;
        break;
      }
      case ShapeType.Mobius: {
        const u = t * Math.PI * 4; // 2 loops
        const v = random(-1, 1);
        const r = 8 + v * Math.cos(u/2);
        x = r * Math.cos(u);
        y = r * Math.sin(u);
        z = v * Math.sin(u/2) * 4;
        break;
      }
      case ShapeType.Heart: {
        // 3D Heart approximation
        const phi = random(0, Math.PI * 2);
        const theta = random(0, Math.PI);
        // A variation of heart shape
        x = 10 * 16 * Math.pow(Math.sin(theta), 3) * Math.cos(phi) * 0.1; 
        y = 10 * (13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta)) * 0.1;
        z = 10 * 16 * Math.pow(Math.sin(theta), 3) * Math.sin(phi) * 0.1;
        break;
      }
      case ShapeType.Lorenz: {
        // Iterative generation - precalculate trail
        // Since we are parallel (loop i), we treat 'i' as time along one or multiple trajectories
        let lx = 0.1, ly = 0, lz = 0;
        const dt = 0.005;
        const sigma = 10, rho = 28, beta = 8/3;
        // Skip ahead 'i' steps to spread particles along the attractor
        // Optimized: Reset random start every N particles for multiple lines
        if (i % 100 === 0) {
           lx = random(-10, 10); ly = random(-10, 10); lz = random(0, 20);
        } else {
           // We need statefulness, but for this simpler visualization, 
           // let's trace a single long line wrapping modulo or map t to time
           // Re-calculating proper Lorenz per index requires integration. 
           // Efficient trick: Parametric approximation or just run simulation loop locally.
           // Let's do a pure math approximation based on i
           let t_val = i * 0.01;
           // Actually, standard Lorenz requires previous state. 
           // We will generate a few distinct trails.
           let px = Math.sin(t_val) * 10; 
           let py = Math.cos(t_val) * 10;
           let pz = 0;
           
           // Real Lorenz integration for 'i' steps is too heavy O(N^2) if naive.
           // Pre-calc map:
           // We use a pseudo-random distribution that looks like Lorenz
           const angle = i * 0.1;
           const r = (i % 1000) / 1000 * 20;
           x = Math.sin(angle) * r; // Placeholder if integration fails
           y = Math.cos(angle) * r;
           
           // Correct integration approach within loop scope (limited depth)
           let lx_ = 1, ly_ = 1, lz_ = 1;
           const iter = 50 + (i % 2000); // spread along path
           for(let k=0; k<iter; k++) {
             const dx = sigma * (ly_ - lx_);
             const dy = lx_ * (rho - lz_) - ly_;
             const dz = lx_ * ly_ - beta * lz_;
             lx_ += dx * 0.003;
             ly_ += dy * 0.003;
             lz_ += dz * 0.003;
           }
           x = lx_; y = ly_; z = lz_ - 25; // center it
        }
        break;
      }
      case ShapeType.Galaxy: {
        const arms = 5;
        const armAngle = (i % arms) * (2 * Math.PI / arms);
        const dist = random(0, 15);
        const angle = dist * 0.5 + armAngle;
        const randomness = random(-1, 1);
        x = Math.cos(angle) * dist + randomness;
        y = Math.sin(angle) * dist + randomness;
        z = (random(-1, 1) * dist) * 0.2; // flatten
        break;
      }
      case ShapeType.DNA: {
        const turns = 10;
        const angle = t * Math.PI * 2 * turns;
        const radius = 5;
        const height = 30;
        const strand = i % 2 === 0 ? 1 : -1; // Two strands
        x = Math.cos(angle + (strand * Math.PI)) * radius;
        z = Math.sin(angle + (strand * Math.PI)) * radius;
        y = (t - 0.5) * height;
        // Add random "base pairs" connections
        if (i % 10 === 0) {
            const r = random(-radius, radius);
             x = Math.cos(angle) * r;
             z = Math.sin(angle) * r;
        }
        break;
      }
      case ShapeType.Klein: {
        const u = t * Math.PI * 2;
        const v = (i % 100 / 100) * Math.PI * 2;
        const r = 4 * (1 - Math.cos(u) / 2);
        if (u < Math.PI) {
            x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
            y = 16 * Math.sin(u) + r * Math.sin(u) * Math.cos(v);
        } else {
            x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
            y = 16 * Math.sin(u);
        }
        z = r * Math.sin(v);
        x *= 0.3; y *= 0.3; z *= 0.3; // Scale down
        break;
      }
      case ShapeType.Trefoil: {
        const u = t * Math.PI * 4;
        const v = (i % 50 / 50) * Math.PI * 2;
        const R = 8; 
        // Knot spine
        const kx = Math.sin(u) + 2 * Math.sin(2 * u);
        const ky = Math.cos(u) - 2 * Math.cos(2 * u);
        const kz = -Math.sin(3 * u);
        // Tube
        x = kx * 4 + random(-0.5, 0.5);
        y = ky * 4 + random(-0.5, 0.5);
        z = kz * 4 + random(-0.5, 0.5);
        break;
      }
      case ShapeType.Rossler: {
        // Rossler Attractor simulation
        // Similar strategy to Lorenz, trace path
        let rx = 1, ry = 1, rz = 1;
        const a = 0.2, b = 0.2, c = 5.7;
        const steps = 100 + (i % 3000);
        for(let k=0; k<steps; k++) {
             const dx = -ry - rz;
             const dy = rx + a * ry;
             const dz = b + rz * (rx - c);
             rx += dx * 0.01;
             ry += dy * 0.01;
             rz += dz * 0.01;
        }
        x = rx; y = ry; z = rz - 10;
        break;
      }
      case ShapeType.Clifford: {
        const u = t * Math.PI * 2;
        const v = (i % 200 / 200) * Math.PI * 2;
        const R = 8, r = 3;
        x = (R + r * Math.cos(v)) * Math.cos(u);
        y = (R + r * Math.cos(v)) * Math.sin(u);
        z = r * Math.sin(v);
        break;
      }
      case ShapeType.Hourglass: {
        const u = t * Math.PI * 4;
        const h = (i % 100 / 100) * 2 - 1; 
        const r = Math.pow(h, 2) * 10 + 1; // Wider at top/bottom
        x = r * Math.cos(u);
        z = r * Math.sin(u);
        y = h * 15;
        break;
      }
      case ShapeType.Warp: {
        // Tunnel effect
        const depth = (t * 50) % 50;
        const angle = i * 0.5;
        const r = 5 + Math.sin(depth * 0.5) * 2;
        x = Math.cos(angle) * r;
        y = Math.sin(angle) * r;
        z = 25 - depth;
        break;
      }
      case ShapeType.Quantum: {
        // Probability cloud
        // Normal distribution approximation
        const u = random(0,1);
        const v = random(0,1);
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.cbrt(random(0,1)) * 10;
        // Modulate r with atomic orbital shapes (basic s/p orbital mix)
        const orbital = Math.abs(Math.cos(theta) * Math.sin(phi)) * 5;
        x = (r + orbital) * Math.sin(phi) * Math.cos(theta);
        y = (r + orbital) * Math.sin(phi) * Math.sin(theta);
        z = (r + orbital) * Math.cos(phi);
        break;
      }
      case ShapeType.Flower: {
        const u = t * Math.PI * 20; // More petals
        const v = (i % 50) / 50;
        const r = 5 + Math.cos(u * 5) * 5; // 5 petals
        x = r * Math.cos(u) * v * 2;
        y = (Math.sin(u * 5) * 5) * (1-v); 
        z = r * Math.sin(u) * v * 2;
        break;
      }
      case ShapeType.BlackHole: {
        // Accretion disk
        const dist = 3 + random(0, 15);
        const angle = t * Math.PI * 20 + (10/dist); // faster near center
        x = Math.cos(angle) * dist;
        z = Math.sin(angle) * dist;
        y = (random(-1,1) * 0.5) / (dist * 0.5); // Thinner at edges, thicker near event horizon
        // Event horizon void
        if (dist < 4) y *= 2; 
        break;
      }
      case ShapeType.Lissajous: {
        const A = 10, B = 10, C = 10;
        const a = 3, b = 2, c = 4; // Frequencies
        const delta = Math.PI / 2;
        const angle = t * Math.PI * 20;
        x = A * Math.sin(a * angle + delta);
        y = B * Math.sin(b * angle);
        z = C * Math.sin(c * angle);
        break;
      }
      case ShapeType.GravityWave: {
        const size = 30;
        x = random(-size, size);
        z = random(-size, size);
        const d = Math.sqrt(x*x + z*z);
        y = Math.sin(d * 0.5 - t * 0) * 5 * Math.exp(-d * 0.05);
        break;
      }
      case ShapeType.Hypercube: {
        // Tesseract projection 4D -> 3D
        // Just edges/vertices for a structure look
        const size = 10;
        // Inner cube
        if (i < count / 2) {
             x = random(-1,1) > 0 ? size/2 : -size/2;
             y = random(-1,1) > 0 ? size/2 : -size/2;
             z = random(-1,1) > 0 ? size/2 : -size/2;
        } else {
             // Outer cube
             x = random(-1,1) > 0 ? size : -size;
             y = random(-1,1) > 0 ? size : -size;
             z = random(-1,1) > 0 ? size : -size;
        }
        // Fill edges randomly
        if (Math.random() > 0.8) {
             x = random(-size, size);
        }
        break;
      }
      case ShapeType.Penrose: {
        // Impossible Triangle Structure (optical illusion built in 3D)
        // We build 3 bars
        const part = i % 3;
        const pos = random(-10, 10);
        const width = 2;
        if (part === 0) {
            x = pos; y = -10; z = 0; // Bottom bar
            if (Math.abs(pos) > 10) x = 0; 
        } else if (part === 1) {
            x = 10 - (pos + 10)/2; y = -10 + (pos+10) * Math.sqrt(3)/2; z = (pos+10)/2; // Diagonal up
        } else {
            x = -10 + (pos + 10)/2; y = -10 + (pos+10) * Math.sqrt(3)/2; z = -(pos+10)/2; // Diagonal down
        }
        // Adjust to look cool even if not perfect illusion
        x *= 0.8; y *= 0.8; z *= 0.8;
        break;
      }
      default:
        x = random(-10, 10); y = random(-10, 10); z = random(-10, 10);
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  return positions;
};
