"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Projectbubbles.module.css";

/* ------------------------------------------------------------------ */
/* 1. Project data                                                     */
/* ------------------------------------------------------------------ */
const PROJECTS = [
  { id: 1, title: "Cilicosys", category: "Software Development", image: "/projects/cilicosys.png", slug: "cilicosys" },
  { id: 2, title: "Magichands Physiotherapy", category: "Web Development", image: "/projects/magichands.jpg", slug: "magichands-physiotherapy" },
  { id: 3, title: "Inayit", category: "Software Development", image: "/projects/inayit.png", slug: "inayit" },
  { id: 4, title: "Epyrocxx", category: "Web Development", image: "/projects/epyrocxx.jpg", slug: "epyrocxx" },
  { id: 5, title: "Cartlane", category: "E-Commerce", image: "/projects/cartlane.png", slug: "cartlane" },
  { id: 6, title: "3D Tailor Space", category: "3D / Web App", image: "/projects/3d-tailor-space.png", slug: "3d-tailor-space" },
  { id: 7, title: "SandTGlobal", category: "Web Development", image: "/projects/sandtglobal.jpg", slug: "sandtglobal" },
  { id: 8, title: "Collins", category: "Web Development", image: "/projects/collins.jpg", slug: "collins" },
  { id: 9, title: "DentalBay", category: "Healthcare", image: "/projects/dentalbay.jpg", slug: "dentalbay" },
  { id: 10, title: "Amal Al-Sham", category: "Food", image: "/projects/amal.jpg", slug: "amal-al-sham" },
  { id: 11, title: "Cilicosys", category: "Software Development", image: "/projects/cilicosys.png", slug: "cilicosys" },
  { id: 12, title: "Magichands Physiotherapy", category: "Web Development", image: "/projects/magichands.jpg", slug: "magichands-physiotherapy" },
  { id: 13, title: "Inayit", category: "Software Development", image: "/projects/inayit.png", slug: "inayit" },
  { id: 14, title: "Epyrocxx", category: "Web Development", image: "/projects/epyrocxx.jpg", slug: "epyrocxx" },
  { id: 15, title: "Cartlane", category: "E-Commerce", image: "/projects/cartlane.png", slug: "cartlane" },
  { id: 16, title: "3D Tailor Space", category: "3D / Web App", image: "/projects/3d-tailor-space.png", slug: "3d-tailor-space" },
  { id: 17, title: "SandTGlobal", category: "Web Development", image: "/projects/sandtglobal.jpg", slug: "sandtglobal" },
  { id: 18, title: "Collins", category: "Web Development", image: "/projects/collins.jpg", slug: "collins" },
  { id: 19, title: "DentalBay", category: "Healthcare", image: "/projects/dentalbay.jpg", slug: "dentalbay" },
  { id: 20, title: "Amal Al-Sham", category: "Food", image: "/projects/amal.jpg", slug: "amal-al-sham" },
];

/* ------------------------------------------------------------------ */
/* 2. Texture atlas — draws every project image into ONE canvas/texture */
/* ------------------------------------------------------------------ */
function useAtlasTexture(projects, cellSize = 160) {
  const [texture, setTexture] = useState(null);
  const [atlasMeta, setAtlasMeta] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const cols = Math.ceil(Math.sqrt(projects.length));
    const rows = Math.ceil(projects.length / cols);

    const canvas = document.createElement("canvas");
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;
    const ctx = canvas.getContext("2d");

    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    (async () => {
      const images = await Promise.all(projects.map((p) => loadImage(p.image)));
      if (cancelled) return;

      images.forEach((img, i) => {
        if (!img) return;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * cellSize;
        const y = row * cellSize;

        const scale = Math.max(cellSize / img.width, cellSize / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const dx = x + (cellSize - w) / 2;
        const dy = y + (cellSize - h) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellSize, cellSize);
        ctx.clip();
        ctx.drawImage(img, dx, dy, w, h);
        ctx.restore();
      });

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;

      setTexture(tex);
      setAtlasMeta({ cols, rows });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, cellSize]);

  return { texture, atlasMeta };
}

/* ------------------------------------------------------------------ */
/* 3. Cluster ("bouquet") layout — packed, uneven sphere of bubbles     */
/* ------------------------------------------------------------------ */
function useClusterLayout(count, targetRadius = 1.6) {
  return useMemo(() => {
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      scale[i] = 0.34 + Math.random() * 0.22;
    }

    const home = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const seedR = targetRadius * 0.6;
      home[i * 3] = Math.cos(theta) * r * seedR;
      home[i * 3 + 1] = y * seedR;
      home[i * 3 + 2] = Math.sin(theta) * r * seedR * 0.5;
    }

    const PAD = 0.02;
    for (let iter = 0; iter < 400; iter++) {
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        home[i3] *= 0.995;
        home[i3 + 1] *= 0.995;
        home[i3 + 2] *= 0.995;
      }
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const i3 = i * 3,
            j3 = j * 3;
          const dx = home[j3] - home[i3];
          const dy = home[j3 + 1] - home[i3 + 1];
          const dz = home[j3 + 2] - home[i3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
          const minDist = scale[i] + scale[j] + PAD;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist,
              ny = dy / dist,
              nz = dz / dist;
            home[i3] -= nx * overlap;
            home[i3 + 1] -= ny * overlap;
            home[i3 + 2] -= nz * overlap;
            home[j3] += nx * overlap;
            home[j3 + 1] += ny * overlap;
            home[j3 + 2] += nz * overlap;
          }
        }
      }
    }

    return { home, scale };
  }, [count, targetRadius]);
}

/* ------------------------------------------------------------------ */
/* 4. The instanced bubble field: 1 draw call, static cluster + idle float */
/*    No pointer repulsion — bubbles hold their formation on hover.     */
/* ------------------------------------------------------------------ */
function BubbleField({ projects, onSelect }) {
  const count = projects.length;
  const meshRef = useRef(null);
  const { home, scale } = useClusterLayout(count);
  const { texture, atlasMeta } = useAtlasTexture(projects);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pointerDownRef = useRef(null); // { x, y, instanceId }

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 24, 24);
    if (!atlasMeta) return geo;
    const { cols, rows } = atlasMeta;
    const offset = new Float32Array(count * 2);
    const uvScale = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      offset[i * 2] = col / cols;
      offset[i * 2 + 1] = 1 - (row + 1) / rows;
      uvScale[i * 2] = 1 / cols;
      uvScale[i * 2 + 1] = 1 / rows;
    }
    geo.setAttribute("aUvOffset", new THREE.InstancedBufferAttribute(offset, 2));
    geo.setAttribute("aUvScale", new THREE.InstancedBufferAttribute(uvScale, 2));
    return geo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atlasMeta, count]);

  const material = useMemo(() => {
    if (!texture) return null;
    const mat = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.4,
    });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
         attribute vec2 aUvOffset;
         attribute vec2 aUvScale;`,
        )
        .replace(
          "#include <uv_vertex>",
          `#include <uv_vertex>
         vec2 sphereUv = normal.xy * 0.5 + 0.5;
         vMapUv = sphereUv * aUvScale + aUvOffset;`,
        );
    };
    return mat;
  }, [texture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // tiny idle float only — no reaction to pointer position at all
      const wobbleX = Math.sin(t * 0.4 + i) * 0.02;
      const wobbleY = Math.cos(t * 0.33 + i * 1.3) * 0.02;

      dummy.position.set(home[i3] + wobbleX, home[i3 + 1] + wobbleY, home[i3 + 2]);
      dummy.rotation.set(t * 0.03 + i, t * 0.025 + i, 0);
      dummy.scale.setScalar(scale[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!material || !atlasMeta) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
      onPointerDown={(e) => {
        e.stopPropagation();
        pointerDownRef.current = {
          x: e.clientX,
          y: e.clientY,
          instanceId: e.instanceId,
        };
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const down = pointerDownRef.current;
        pointerDownRef.current = null;
        if (!down || down.instanceId == null) return;

        const dx = e.clientX - down.x;
        const dy = e.clientY - down.y;
        const moved = Math.sqrt(dx * dx + dy * dy);

        if (moved < 8 && e.instanceId === down.instanceId) {
          onSelect?.(projects[down.instanceId]);
        }
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 5. Public component                                                 */
/* ------------------------------------------------------------------ */
export default function ProjectBubbles({ projects }) {
  const list = useMemo(() => projects ?? PROJECTS, [projects]);
  const router = useRouter();

  const handleSelect = (project) => {
    router.push(`/projects/${project.slug}`);
  };

  return (
    <div className={styles.wrapper}>
      <Canvas
        className={styles.canvas}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[5, 5, 5]} intensity={2.2} />
        <pointLight position={[-5, 2, 4]} intensity={2} distance={15} />
        <Environment preset="apartment" resolution={64} />
        <BubbleField projects={list} onSelect={handleSelect} />
      </Canvas>
    </div>
  );
}
