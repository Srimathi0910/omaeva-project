"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Projectbubbles.module.css";

/* ================================================================
   PROJECT DATA
   ================================================================ */

const BASE_PROJECTS = [
  {
    id: 1,
    title: "Cilicosys",
    category: "Software Development",
    image: "/projects/cilicosys.png",
    slug: "cilicosys",
  },
  {
    id: 2,
    title: "Magichands Physiotherapy",
    category: "Web Development",
    image: "/projects/magichands.jpg",
    slug: "magichands-physiotherapy",
  },
  {
    id: 3,
    title: "Inayit",
    category: "Software Development",
    image: "/projects/inayit.png",
    slug: "inayit",
  },
  {
    id: 4,
    title: "Epyrocxx",
    category: "Web Development",
    image: "/projects/epyrocxx.jpg",
    slug: "epyrocxx",
  },
  {
    id: 5,
    title: "Cartlane",
    category: "E-Commerce",
    image: "/projects/cartlane.png",
    slug: "cartlane",
  },
  {
    id: 6,
    title: "3D Tailor Space",
    category: "3D / Web App",
    image: "/projects/3d-tailor-space.png",
    slug: "3d-tailor-space",
  },
  {
    id: 7,
    title: "SandTGlobal",
    category: "Web Development",
    image: "/projects/sandtglobal.jpg",
    slug: "sandtglobal",
  },
  {
    id: 8,
    title: "Collins",
    category: "Web Development",
    image: "/projects/collins.jpg",
    slug: "collins",
  },
  {
    id: 9,
    title: "DentalBay",
    category: "Healthcare",
    image: "/projects/dentalbay.jpg",
    slug: "dentalbay",
  },
  {
    id: 10,
    title: "Amal Al-Sham",
    category: "Food",
    image: "/projects/amal.jpg",
    slug: "amal-al-sham",
  },
];

const PROJECTS = Array.from({ length: 30 }, (_, index) => {
  const project = BASE_PROJECTS[index % BASE_PROJECTS.length];
  return {
    ...project,
    id: index + 1,
  };
});

/* ================================================================
   TUNABLE PHYSICS SETTINGS
   ================================================================ */

const PHYSICS = {
  idleMovementStrength: 0.025,
  idleSpeed: 0.7,
  interactionRadius: 3.0,
  interactionForce: 14,
  mouseVelocityMultiplier: 0.055,
  fastMovementBoost: 1.8,
  springStrength: 8.5,
  damping: 0.86,
  collisionStrength: 18,
  collisionRadiusMultiplier: 0.84,
  maxVelocity: 9,
  rotationFromVelocity: 0.035,
  maxRotationSpeed: 0.18,
  entranceDuration: 1.25,
  entranceStagger: 0.035,
  maxDeltaTime: 1 / 30,
};

/* ================================================================
   IMAGE ATLAS
   ================================================================ */

function useAtlasTexture(projects, cellSize = 256) {
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

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    (async () => {
      const images = await Promise.all(
        projects.map((project) => loadImage(project.image))
      );

      if (cancelled) return;

      images.forEach((img, index) => {
        if (!img) return;

        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * cellSize;
        const y = row * cellSize;

        const scale = Math.max(
          cellSize / img.width,
          cellSize / img.height
        );

        const width = img.width * scale;
        const height = img.height * scale;

        const dx = x + (cellSize - width) / 2;
        const dy = y + (cellSize - height) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellSize, cellSize);
        ctx.clip();
        ctx.drawImage(img, dx, dy, width, height);
        ctx.restore();
      });

      const atlas = new THREE.CanvasTexture(canvas);
      atlas.colorSpace = THREE.SRGBColorSpace;
      atlas.minFilter = THREE.LinearFilter;
      atlas.magFilter = THREE.LinearFilter;
      atlas.generateMipmaps = false;
      atlas.needsUpdate = true;

      setTexture(atlas);
      setAtlasMeta({ cols, rows });
    })();

    return () => {
      cancelled = true;
    };
  }, [projects]);

  return { texture, atlasMeta };
}

/* ================================================================
   ORGANIC CLUSTER
   ================================================================ */

function useClusterLayout(count, targetRadius = 2.05) {
  return useMemo(() => {
    const radius = new Float32Array(count);
    const home = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const random = Math.random();
      if (random < 0.12) {
        radius[i] = 0.27 + Math.random() * 0.08;
      } else if (random < 0.85) {
        radius[i] = 0.38 + Math.random() * 0.16;
      } else {
        radius[i] = 0.58 + Math.random() * 0.16;
      }
    }

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const normalized = i / Math.max(1, count - 1);
      const y = 1 - normalized * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = goldenAngle * i;
      const jitter = 0.78 + Math.random() * 0.35;

      home[i * 3] = Math.cos(angle) * ring * targetRadius * jitter;
      home[i * 3 + 1] = y * targetRadius * jitter;
      home[i * 3 + 2] = Math.sin(angle) * ring * targetRadius * 0.42 * jitter;
    }

    for (let iteration = 0; iteration < 250; iteration++) {
      for (let i = 0; i < count; i++) {
        home[i * 3] *= 0.994;
        home[i * 3 + 1] *= 0.994;
        home[i * 3 + 2] *= 0.994;
      }

      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const i3 = i * 3;
          const j3 = j * 3;

          const dx = home[j3] - home[i3];
          const dy = home[j3 + 1] - home[i3 + 1];
          const dz = home[j3 + 2] - home[i3 + 2];

          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
          const minimumDistance = radius[i] + radius[j] - 0.04;

          if (distance < minimumDistance) {
            const overlap = (minimumDistance - distance) / 2;
            const nx = dx / distance;
            const ny = dy / distance;
            const nz = dz / distance;

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

    return { home, radius };
  }, [count, targetRadius]);
}

/* ================================================================
   PER BUBBLE PARAMETERS
   ================================================================ */

function useBubbleParameters(count) {
  return useMemo(() => {
    return Array.from({ length: count }, () => ({
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      speedX: 0.45 + Math.random() * 0.35,
      speedY: 0.4 + Math.random() * 0.3,
      speedZ: 0.35 + Math.random() * 0.25,
      rotation: (Math.random() - 0.5) * 0.02,
      depth: 0.88 + Math.random() * 0.24,
    }));
  }, [count]);
}

/* ================================================================
   BUBBLE FIELD
   ================================================================ */

function BubbleField({ projects, onSelect, pointerActiveRef }) {
  const count = projects.length;
  const meshRef = useRef(null);

  const { home, radius } = useClusterLayout(count);
  const bubbleParams = useBubbleParameters(count);
  const { texture, atlasMeta } = useAtlasTexture(projects);

  const posX = useRef(null);
  const posY = useRef(null);
  const posZ = useRef(null);
  const velX = useRef(null);
  const velY = useRef(null);
  const velZ = useRef(null);
  const initialized = useRef(false);

  const entranceStart = useRef(null);

  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 0));
  const mouseVelocity = useRef(new THREE.Vector2(0, 0));
  const previousMouse = useRef(new THREE.Vector2(0, 0));
  const currentMouse = useRef(new THREE.Vector2(0, 0));
  const mouseHasMoved = useRef(false);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  );
  const hitPoint = useMemo(() => new THREE.Vector3(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const pointerDownRef = useRef(null);

  useEffect(() => {
    posX.current = new Float32Array(count);
    posY.current = new Float32Array(count);
    posZ.current = new Float32Array(count);
    velX.current = new Float32Array(count);
    velY.current = new Float32Array(count);
    velZ.current = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const startOffset = 0.45 + Math.random() * 0.55;
      posX.current[i] = home[i * 3] + (Math.random() - 0.5) * startOffset;
      posY.current[i] = home[i * 3 + 1] + (Math.random() - 0.5) * startOffset;
      posZ.current[i] = home[i * 3 + 2] + (Math.random() - 0.5) * startOffset;

      velX.current[i] = 0;
      velY.current[i] = 0;
      velZ.current[i] = 0;
    }

    entranceStart.current = null;
    initialized.current = true;
  }, [count, home]);

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 24, 24);

    if (!atlasMeta) {
      return geo;
    }

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

    geo.setAttribute(
      "aUvOffset",
      new THREE.InstancedBufferAttribute(offset, 2)
    );
    geo.setAttribute(
      "aUvScale",
      new THREE.InstancedBufferAttribute(uvScale, 2)
    );

    return geo;
  }, [atlasMeta, count]);

  const material = useMemo(() => {
    if (!texture) return null;

    const mat = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.2,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      transparent: false,
      envMapIntensity: 1.7,
    });

    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `
#include <common>
attribute vec2 aUvOffset;
attribute vec2 aUvScale;
varying vec2 vAtlasUv;
`
        )
        .replace(
          "#include <normal_vertex>",
          `
#include <normal_vertex>
vec2 sphereUv = vNormal.xy * 0.5 + 0.5;
vAtlasUv = sphereUv * aUvScale + aUvOffset;
`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `
#include <common>
varying vec2 vAtlasUv;
`
        )
        .replace(
          "#include <map_fragment>",
          `
#ifdef USE_MAP
vec4 sampledDiffuseColor = texture2D(map, vAtlasUv);
diffuseColor *= sampledDiffuseColor;
#endif
`
        );
    };

    return mat;
  }, [texture]);

  useFrame((state, rawDelta) => {
    if (
      !meshRef.current ||
      !initialized.current ||
      !posX.current ||
      !posY.current ||
      !posZ.current ||
      !velX.current ||
      !velY.current ||
      !velZ.current
    ) {
      return;
    }

    const time = state.clock.elapsedTime;
    const dt = Math.min(rawDelta, PHYSICS.maxDeltaTime);

    if (entranceStart.current === null) {
      entranceStart.current = time;
    }

    const entranceElapsed = time - entranceStart.current;

    if (pointerActiveRef.current) {
      raycaster.setFromCamera(state.pointer, state.camera);
      const hit = raycaster.ray.intersectPlane(plane, hitPoint);
      if (hit) {
        mouseWorld.current.copy(hitPoint);
      }
    }

    if (pointerActiveRef.current && mouseHasMoved.current) {
      const dx = currentMouse.current.x - previousMouse.current.x;
      const dy = currentMouse.current.y - previousMouse.current.y;

      mouseVelocity.current.x = mouseVelocity.current.x * 0.35 + dx * 0.65;
      mouseVelocity.current.y = mouseVelocity.current.y * 0.35 + dy * 0.65;
    } else {
      mouseVelocity.current.x *= 0.82;
      mouseVelocity.current.y *= 0.82;
    }

    previousMouse.current.copy(currentMouse.current);

    const pX = posX.current;
    const pY = posY.current;
    const pZ = posZ.current;
    const vX = velX.current;
    const vY = velY.current;
    const vZ = velZ.current;

    const mouseX = mouseWorld.current.x;
    const mouseY = mouseWorld.current.y;
    const mouseZ = mouseWorld.current.z;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const params = bubbleParams[i];

      const idleX =
        Math.sin(
          time * params.speedX * PHYSICS.idleSpeed + params.phaseX
        ) * PHYSICS.idleMovementStrength;

      const idleY =
        Math.cos(
          time * params.speedY * PHYSICS.idleSpeed + params.phaseY
        ) * PHYSICS.idleMovementStrength;

      const idleZ =
        Math.sin(
          time * params.speedZ * PHYSICS.idleSpeed + params.phaseZ
        ) * PHYSICS.idleMovementStrength * 0.65;

      const targetX = home[i3] + idleX;
      const targetY = home[i3 + 1] + idleY;
      const targetZ = home[i3 + 2] + idleZ;

      let forceX = (targetX - pX[i]) * PHYSICS.springStrength;
      let forceY = (targetY - pY[i]) * PHYSICS.springStrength;
      let forceZ = (targetZ - pZ[i]) * PHYSICS.springStrength;

      if (pointerActiveRef.current) {
        const dx = pX[i] - mouseX;
        const dy = pY[i] - mouseY;
        const dz = pZ[i] - mouseZ;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;

        if (distance < PHYSICS.interactionRadius) {
          const normalizedDistance = 1 - distance / PHYSICS.interactionRadius;
          const falloff = normalizedDistance * normalizedDistance;

          const mouseSpeed = Math.sqrt(
            mouseVelocity.current.x * mouseVelocity.current.x +
              mouseVelocity.current.y * mouseVelocity.current.y
          );

          const velocityInfluence =
            1 + mouseSpeed * PHYSICS.mouseVelocityMultiplier;

          const fastBoost = Math.min(
            velocityInfluence,
            PHYSICS.fastMovementBoost
          );

          const strength =
            (PHYSICS.interactionForce * falloff * fastBoost) /
            Math.max(radius[i], 0.1);

          forceX += (dx / distance) * strength;
          forceY += (dy / distance) * strength;
          forceZ += (dz / distance) * strength * 0.35;
        }
      }

      vX[i] += forceX * dt;
      vY[i] += forceY * dt;
      vZ[i] += forceZ * dt;
    }

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pX[j] - pX[i];
        const dy = pY[j] - pY[i];
        const dz = pZ[j] - pZ[i];

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
        const minimumDistance =
          (radius[i] + radius[j]) * PHYSICS.collisionRadiusMultiplier;

        if (distance < minimumDistance) {
          const overlap = (minimumDistance - distance) / minimumDistance;
          const nx = dx / distance;
          const ny = dy / distance;
          const nz = dz / distance;

          const push = overlap * PHYSICS.collisionStrength;

          const massA = radius[i] * radius[i];
          const massB = radius[j] * radius[j];
          const totalMass = massA + massB;

          const shareA = massB / totalMass;
          const shareB = massA / totalMass;

          vX[i] -= nx * push * shareA * dt;
          vY[i] -= ny * push * shareA * dt;
          vZ[i] -= nz * push * shareA * dt;

          vX[j] += nx * push * shareB * dt;
          vY[j] += ny * push * shareB * dt;
          vZ[j] += nz * push * shareB * dt;
        }
      }
    }

    const damping = Math.pow(PHYSICS.damping, dt * 60);

    for (let i = 0; i < count; i++) {
      vX[i] *= damping;
      vY[i] *= damping;
      vZ[i] *= damping;

      const speed = Math.sqrt(vX[i] * vX[i] + vY[i] * vY[i] + vZ[i] * vZ[i]);

      if (speed > PHYSICS.maxVelocity) {
        const scale = PHYSICS.maxVelocity / speed;
        vX[i] *= scale;
        vY[i] *= scale;
        vZ[i] *= scale;
      }

      pX[i] += vX[i] * dt;
      pY[i] += vY[i] * dt;
      pZ[i] += vZ[i] * dt;

      const delay = i * PHYSICS.entranceStagger;
      const entranceProgress = THREE.MathUtils.clamp(
        (entranceElapsed - delay) / PHYSICS.entranceDuration,
        0,
        1
      );

      const eased = 1 - Math.pow(1 - entranceProgress, 3);

      if (entranceProgress < 1) {
        const startScale = 0.72 + eased * 0.28;
        dummy.scale.set(
          radius[i] * startScale,
          radius[i] * startScale,
          radius[i] * startScale
        );
      } else {
        dummy.scale.set(radius[i], radius[i], radius[i]);
      }

      const velocityRotation = vX[i] * PHYSICS.rotationFromVelocity;
      const rotation = THREE.MathUtils.clamp(
        velocityRotation,
        -PHYSICS.maxRotationSpeed,
        PHYSICS.maxRotationSpeed
      );

      dummy.position.set(pX[i], pY[i], pZ[i]);

      dummy.rotation.x = time * bubbleParams[i].rotation + rotation * 0.45;
      dummy.rotation.y = time * bubbleParams[i].rotation * 1.3 + rotation;
      dummy.rotation.z = rotation * 0.25;

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!material || !atlasMeta) {
    return null;
  }

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

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function ProjectBubbles({ projects }) {
  const list = useMemo(() => projects ?? PROJECTS, [projects]);
  const router = useRouter();
  const pointerActiveRef = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    lastPointer.current = { x, y };
    pointerActiveRef.current = true;
  };

  const handleSelect = (project) => {
    router.push(`/projects/${project.slug}`);
  };

  return (
    <section
      className={styles.wrapper}
      onPointerEnter={() => {
        pointerActiveRef.current = true;
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={() => {
        pointerActiveRef.current = true;
      }}
      onPointerLeave={() => {
        pointerActiveRef.current = false;
      }}
      onPointerCancel={() => {
        pointerActiveRef.current = false;
      }}
    >

      <Canvas
        className={styles.canvas}
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 7],
          fov: 42,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[4, 5, 6]} intensity={2.4} />
        <pointLight position={[-4, 2, 4]} intensity={2} distance={15} />
        <Environment preset="studio" resolution={64} />

        <BubbleField
          projects={list}
          onSelect={handleSelect}
          pointerActiveRef={pointerActiveRef}
        />
      </Canvas>
    </section>
  );
}
