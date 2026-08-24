"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
    image: "/projects/temp.jpg",
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
    // image: "/projects/3d-tailor-space.png",
        image: "/projects/magichands.jpg",

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

const PROJECTS = Array.from(
  { length: 20 },
  (_, index) => {
    const project =
      BASE_PROJECTS[index % BASE_PROJECTS.length];

    return {
      ...project,
      id: index + 1,
    };
  }
);

/* ================================================================
   PHYSICS
================================================================ */

const PHYSICS = {
  idleMovementStrength: 0.028,
  idleSpeed: 0.7,

  interactionRadius: 3.0,
  interactionForce: 14,

  mouseVelocityMultiplier: 0.055,
  fastMovementBoost: 1.8,

  springStrength: 8.5,
  damping: 0.86,

  collisionStrength: 18,
  collisionRadiusMultiplier: 0.84,

  maxVelocity: 5,

  rotationFromVelocity: 0.035,
  maxRotationSpeed: 0.18,

  entranceDuration: 1.25,
  entranceStagger: 0.035,

  maxDeltaTime: 1 / 30,

  /* ============================================================
     CLICK ANIMATION
  ============================================================ */

  selectedPushRadius: 5.5,
  selectedPushStrength: 10,

  selectedBubbleScale: 1.25,

  explosionVelocity: 1.8,

  selectedHoldTime: 0.75,

  selectedCenterStrength: 5.5,

  escapeStrength: 18,
  escapeFalloffDistance: 6.5,
  escapeTravelDistance: 8,
};

/* ================================================================
   IMAGE ATLAS
================================================================ */

function useAtlasTexture(projects, cellSize = 512) {
  const [texture, setTexture] =
    useState(null);

  const [atlasMeta, setAtlasMeta] =
    useState(null);

  useEffect(() => {
    let cancelled = false;

    const cols = Math.ceil(
      Math.sqrt(projects.length)
    );

    const rows = Math.ceil(
      projects.length / cols
    );

    const canvas =
      document.createElement("canvas");

    canvas.width =
      cols * cellSize;

    canvas.height =
      rows * cellSize;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const loadImage = (src) =>
      new Promise((resolve) => {
        const img =
          new Image();

        img.crossOrigin =
          "anonymous";

        img.onload = () =>
          resolve(img);

        img.onerror = () =>
          resolve(null);

        img.src = src;
      });

    (async () => {
      const images =
        await Promise.all(
          projects.map((project) =>
            loadImage(project.image)
          )
        );

      if (cancelled) {
        return;
      }

      images.forEach(
        (img, index) => {
          if (!img) {
            return;
          }

          const col =
            index % cols;

          const row =
            Math.floor(
              index / cols
            );

          const x =
            col * cellSize;

          const y =
            row * cellSize;

          /*
           * Cover image into atlas cell.
           */

          const scale =
            Math.max(
              cellSize / img.width,
              cellSize / img.height
            );

          const width =
            img.width * scale;

          const height =
            img.height * scale;

          const dx =
            x +
            (cellSize - width) /
              2;

          const dy =
            y +
            (cellSize - height) /
              2;

          ctx.save();

          ctx.beginPath();

          ctx.rect(
            x,
            y,
            cellSize,
            cellSize
          );

          ctx.clip();

          ctx.drawImage(
            img,
            dx,
            dy,
            width,
            height
          );

          ctx.restore();
        }
      );

      const atlas =
        new THREE.CanvasTexture(
          canvas
        );

      atlas.colorSpace =
        THREE.SRGBColorSpace;

      atlas.minFilter =
        THREE.LinearMipmapLinearFilter;

      atlas.magFilter =
        THREE.LinearFilter;

      atlas.generateMipmaps =
        true;

      atlas.anisotropy = 4;

      atlas.wrapS =
        THREE.ClampToEdgeWrapping;

      atlas.wrapT =
        THREE.ClampToEdgeWrapping;

      atlas.needsUpdate =
        true;

      setTexture(atlas);

      setAtlasMeta({
        cols,
        rows,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [projects, cellSize]);

  return {
    texture,
    atlasMeta,
  };
}

/* ================================================================
   CLUSTER LAYOUT
================================================================ */

function useClusterLayout(
  count,
  targetRadius = 2.05
) {
  return useMemo(() => {
    const radius =
      new Float32Array(count);

    const home =
      new Float32Array(
        count * 3
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const random =
        Math.random();

      if (random < 0.12) {
        radius[i] =
          0.20 +
          Math.random() *
            0.06;
      } else if (
        random < 0.85
      ) {
        radius[i] =
          0.28 +
          Math.random() *
            0.12;
      } else {
        radius[i] =
          0.43 +
          Math.random() *
            0.12;
      }
    }

    const goldenAngle =
      Math.PI *
      (3 - Math.sqrt(5));

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const normalized =
        i /
        Math.max(
          1,
          count - 1
        );

      const y =
        1 -
        normalized * 2;

      const ring =
        Math.sqrt(
          Math.max(
            0,
            1 - y * y
          )
        );

      const angle =
        goldenAngle * i;

      const jitter =
        0.78 +
        Math.random() *
          0.35;

      home[i * 3] =
        Math.cos(angle) *
        ring *
        targetRadius *
        jitter;

      home[i * 3 + 1] =
        y *
          targetRadius *
          jitter +
        2.7;

      home[i * 3 + 2] =
        Math.sin(angle) *
        ring *
        targetRadius *
        0.42 *
        jitter;
    }

    /*
     * Resolve initial overlaps.
     */

    for (
      let iteration = 0;
      iteration < 250;
      iteration++
    ) {
      for (
        let i = 0;
        i < count;
        i++
      ) {
        home[i * 3] *= 0.994;

        home[i * 3 + 1] *=
          0.994;

        home[i * 3 + 2] *=
          0.994;
      }

      for (
        let i = 0;
        i < count;
        i++
      ) {
        for (
          let j = i + 1;
          j < count;
          j++
        ) {
          const i3 =
            i * 3;

          const j3 =
            j * 3;

          const dx =
            home[j3] -
            home[i3];

          const dy =
            home[j3 + 1] -
            home[i3 + 1];

          const dz =
            home[j3 + 2] -
            home[i3 + 2];

          const distance =
            Math.sqrt(
              dx * dx +
                dy * dy +
                dz * dz
            ) || 0.0001;

          const minimumDistance =
            radius[i] +
            radius[j] -
            0.04;

          if (
            distance <
            minimumDistance
          ) {
            const overlap =
              (minimumDistance -
                distance) /
              2;

            const nx =
              dx / distance;

            const ny =
              dy / distance;

            const nz =
              dz / distance;

            home[i3] -=
              nx * overlap;

            home[i3 + 1] -=
              ny * overlap;

            home[i3 + 2] -=
              nz * overlap;

            home[j3] +=
              nx * overlap;

            home[j3 + 1] +=
              ny * overlap;

            home[j3 + 2] +=
              nz * overlap;
          }
        }
      }
    }

    return {
      home,
      radius,
    };
  }, [
    count,
    targetRadius,
  ]);
}

/* ================================================================
   BUBBLE PARAMETERS
================================================================ */

function useBubbleParameters(
  count
) {
  return useMemo(() => {
    return Array.from(
      {
        length: count,
      },
      () => ({
        phaseX:
          Math.random() *
          Math.PI *
          2,

        phaseY:
          Math.random() *
          Math.PI *
          2,

        phaseZ:
          Math.random() *
          Math.PI *
          2,

        speedX:
          0.45 +
          Math.random() *
            0.35,

        speedY:
          0.4 +
          Math.random() *
            0.3,

        speedZ:
          0.35 +
          Math.random() *
            0.25,

        rotation:
          (Math.random() -
            0.5) *
          0.02,

        depth:
          0.88 +
          Math.random() *
            0.24,
      })
    );
  }, [count]);
}

/* ================================================================
   BUBBLE FIELD
================================================================ */

function BubbleField({
  projects,
  onSelect,
  pointerActiveRef,
  onLoadingChange,
}) {
  const count =
    projects.length;

  const meshRef =
    useRef(null);

  // Separate transparent shell gives every image sphere a real glossy
  // "bubble" surface while keeping the project image fully visible.
  const shellMeshRef =
    useRef(null);

  const {
    home,
    radius,
  } = useClusterLayout(
    count
  );

  const bubbleParams =
    useBubbleParameters(
      count
    );

  const {
    texture,
    atlasMeta,
  } = useAtlasTexture(
    projects
  );

  /* ============================================================
     SELECTED
  ============================================================ */

  const selectedIndexRef =
    useRef(null);

  const selectedTimerRef =
    useRef(null);

  /* ============================================================
     POSITION
  ============================================================ */

  const posX =
    useRef(null);

  const posY =
    useRef(null);

  const posZ =
    useRef(null);

  const velX =
    useRef(null);

  const velY =
    useRef(null);

  const velZ =
    useRef(null);

  const initialized =
    useRef(false);

  const entranceStart =
    useRef(null);

  /* ============================================================
     MOUSE
  ============================================================ */

  const mouseWorld =
    useRef(
      new THREE.Vector3(
        9999,
        9999,
        0
      )
    );

  const mouseVelocity =
    useRef(
      new THREE.Vector2(
        0,
        0
      )
    );

  const previousMouse =
    useRef(
      new THREE.Vector2(
        0,
        0
      )
    );

  const currentMouse =
    useRef(
      new THREE.Vector2(
        0,
        0
      )
    );

  const mouseHasMoved =
    useRef(false);

  /* ============================================================
     THREE HELPERS
  ============================================================ */

  const raycaster =
    useMemo(
      () =>
        new THREE.Raycaster(),
      []
    );

  const plane =
    useMemo(
      () =>
        new THREE.Plane(
          new THREE.Vector3(
            0,
            0,
            1
          ),
          0
        ),
      []
    );

  const hitPoint =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      []
    );

  /* ============================================================
     POINTER CLICK
  ============================================================ */

  const pointerDownRef =
    useRef(null);

  /* ============================================================
     LOADING
  ============================================================ */

  useEffect(() => {
    onLoadingChange?.(
      !texture ||
        !atlasMeta
    );
  }, [
    texture,
    atlasMeta,
    onLoadingChange,
  ]);

  /* ============================================================
     INITIALIZE
  ============================================================ */

  useEffect(() => {
    posX.current =
      new Float32Array(
        count
      );

    posY.current =
      new Float32Array(
        count
      );

    posZ.current =
      new Float32Array(
        count
      );

    velX.current =
      new Float32Array(
        count
      );

    velY.current =
      new Float32Array(
        count
      );

    velZ.current =
      new Float32Array(
        count
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const startOffset =
        0.45 +
        Math.random() *
          0.55;

      posX.current[i] =
        home[i * 3] +
        (Math.random() -
          0.5) *
          startOffset;

      posY.current[i] =
        home[i * 3 + 1] +
        (Math.random() -
          0.5) *
          startOffset;

      posZ.current[i] =
        home[i * 3 + 2] +
        (Math.random() -
          0.5) *
          startOffset;

      velX.current[i] =
        0;

      velY.current[i] =
        0;

      velZ.current[i] =
        0;
    }

    selectedIndexRef.current =
      null;

    entranceStart.current =
      null;

    initialized.current =
      true;
  }, [
    count,
    home,
  ]);

  /* ============================================================
     GEOMETRY
  ============================================================ */

  const geometry =
    useMemo(() => {
      /*
       * High segment count gives each project a genuinely round
       * 3D bubble instead of a flat circular image.
       */
      const geo =
        new THREE.SphereGeometry(
          1,
          64,
          64
        );

      if (!atlasMeta) {
        return geo;
      }

      const {
        cols,
        rows,
      } = atlasMeta;

      const offset =
        new Float32Array(
          count * 2
        );

      const uvScale =
        new Float32Array(
          count * 2
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const col =
          i % cols;

        const row =
          Math.floor(
            i / cols
          );

        offset[i * 2] =
          col / cols;

        /*
         * Canvas atlas has its origin at top-left.
         */

        offset[i * 2 + 1] =
          1 -
          (row + 1) /
            rows;

        uvScale[i * 2] =
          1 / cols;

        uvScale[i * 2 + 1] =
          1 / rows;
      }

      geo.setAttribute(
        "aUvOffset",
        new THREE.InstancedBufferAttribute(
          offset,
          2
        )
      );

      geo.setAttribute(
        "aUvScale",
        new THREE.InstancedBufferAttribute(
          uvScale,
          2
        )
      );

      return geo;
    }, [
      atlasMeta,
      count,
    ]);

  /* ============================================================
     MATERIAL
  ============================================================ */

  const material =
    useMemo(() => {
      if (!texture) {
        return null;
      }

      const mat =
        new THREE.MeshPhysicalMaterial(
          {
            map: texture,

            /*
             * Physical material settings.
             *
             * The important part here is that the texture is still
             * opaque, while the surface itself gets glass-like
             * reflections and highlights.
             */

            roughness: 0.16,

            metalness: 0,

            clearcoat: 1,

            clearcoatRoughness: 0.055,

            envMapIntensity: 2.7,

            sheen: 0.12,

            sheenRoughness: 0.2,

            ior: 1.33,

            transmission: 0.04,

            thickness: 0.18,

            transparent: false,

            side: THREE.FrontSide,
          }
        );

      mat.onBeforeCompile =
        (shader) => {
          /*
           * ======================================================
           * VERTEX SHADER
           * ======================================================
           *
           * The original implementation calculated atlas UVs
           * from normal.xy. That makes the image appear like a
           * flat projection.
           *
           * Here we use the actual SphereGeometry UV coordinates.
           * This means the project image is wrapped around the
           * sphere.
           */

          shader.vertexShader =
            shader.vertexShader
              .replace(
                "#include <common>",
                `
#include <common>

attribute vec2 aUvOffset;
attribute vec2 aUvScale;

varying vec2 vBubbleUv;
`
              )
              .replace(
                "#include <uv_vertex>",
                `
#include <uv_vertex>

vBubbleUv =
  uv *
  aUvScale +
  aUvOffset;
`
              );

          /*
           * ======================================================
           * FRAGMENT SHADER
           * ======================================================
           */

          shader.fragmentShader =
            shader.fragmentShader
              .replace(
                "#include <common>",
                `
#include <common>

varying vec2 vBubbleUv;
`
              );

          /*
           * Replace the standard map sampling with atlas
           * sampling.
           */

          shader.fragmentShader =
            shader.fragmentShader
              .replace(
                "#include <map_fragment>",
                `
#ifdef USE_MAP

vec4 bubbleTexture =
  texture2D(
    map,
    vBubbleUv
  );

diffuseColor *=
  bubbleTexture;

#endif
`
              );

          /*
           * Add the bubble lighting after the normal has been
           * calculated.
           */

          shader.fragmentShader =
            shader.fragmentShader.replace(
              "#include <dithering_fragment>",
              `

/* ============================================================
   BUBBLE NORMAL
============================================================ */

vec3 bubbleNormal =
  normalize(normal);

/* ============================================================
   VIEW DIRECTION
============================================================ */

vec3 bubbleViewDir =
  normalize(vViewPosition);

/* ============================================================
   FRESNEL
============================================================ */

float bubbleFacing =
  clamp(
    dot(
      bubbleNormal,
      bubbleViewDir
    ),
    0.0,
    1.0
  );

float fresnel =
  pow(
    1.0 -
      bubbleFacing,
    3.6
  );

/* ============================================================
   DARK EDGE / OUTLINE
============================================================

   This is the subtle outline around every sphere.

   It becomes strongest near the silhouette, but is deliberately
   soft so the bubbles do not look like cartoon circles.
*/

float outline =
  smoothstep(
    0.46,
    0.92,
    fresnel
  );

vec3 outlineColor =
  vec3(
    0.025,
    0.022,
    0.035
  );

gl_FragColor.rgb =
  mix(
    gl_FragColor.rgb,
    outlineColor,
    outline * 0.38
  );

/* ============================================================
   WHITE GLASS RIM
============================================================ */

float rim =
  smoothstep(
    0.54,
    0.96,
    fresnel
  );

vec3 rimColor =
  vec3(
    1.0,
    1.0,
    1.0
  );

gl_FragColor.rgb =
  mix(
    gl_FragColor.rgb,
    rimColor,
    rim * 0.20
  );

/* ============================================================
   TOP-LEFT SPECULAR HOTSPOT
============================================================ */

vec3 highlightDirection =
  normalize(
    vec3(
      -0.45,
      0.62,
      1.0
    )
  );

vec3 halfDirection =
  normalize(
    highlightDirection +
      bubbleViewDir
  );

float specular =
  pow(
    max(
      dot(
        bubbleNormal,
        halfDirection
      ),
      0.0
    ),
    72.0
  );

gl_FragColor.rgb +=
  vec3(
    1.0
  ) *
  specular *
  0.82;

/* ============================================================
   SECONDARY SOFT HIGHLIGHT
============================================================ */

float softHighlight =
  pow(
    max(
      dot(
        bubbleNormal,
        highlightDirection
      ),
      0.0
    ),
    3.2
  );

gl_FragColor.rgb +=
  vec3(
    0.10,
    0.095,
    0.12
  ) *
  softHighlight;

/* ============================================================
   SPHERICAL EDGE DARKENING
============================================================

   Adds a little extra curvature to the project image itself.
*/

float sphericalShade =
  smoothstep(
    0.0,
    0.92,
    fresnel
  );

gl_FragColor.rgb *=
  1.0 -
  sphericalShade *
    0.18;

/* ============================================================
   BOTTOM AMBIENT SHADOW
============================================================ */

float bottomShade =
  smoothstep(
    -0.15,
    -0.85,
    bubbleNormal.y
  );

gl_FragColor.rgb *=
  1.0 -
  bottomShade *
    0.10;

/* ============================================================
   SMALL INNER GLOW
============================================================ */

float innerGlow =
  pow(
    max(
      dot(
        bubbleNormal,
        highlightDirection
      ),
      0.0
    ),
    7.0
  );

gl_FragColor.rgb +=
  vec3(
    0.035,
    0.032,
    0.045
  ) *
  innerGlow;

#include <dithering_fragment>
`
            );
        };

      return mat;
    }, [texture]);

  /*
   * Transparent outer shell.
   *
   * The project image remains on the inner sphere. This second,
   * slightly larger physical sphere supplies the glossy transparent
   * bubble coating without changing the click/navigation behavior.
   */
  const bubbleShellMaterial =
    useMemo(() => {
      const mat =
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.035,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.025,
          envMapIntensity: 3.2,
          transmission: 0.12,
          thickness: 0.08,
          ior: 1.33,
          transparent: true,
          opacity: 0.13,
          depthWrite: false,
          side: THREE.FrontSide,
        });

      return mat;
    }, []);

  /* ============================================================
     SELECT PROJECT
  ============================================================ */

  const triggerExplosion =
    (selectedIndex) => {
      if (
        selectedIndexRef.current !==
        null
      ) {
        return;
      }

      if (
        !posX.current ||
        !posY.current ||
        !posZ.current ||
        !velX.current ||
        !velY.current ||
        !velZ.current
      ) {
        return;
      }

      selectedIndexRef.current =
        selectedIndex;

      const pX =
        posX.current;

      const pY =
        posY.current;

      const pZ =
        posZ.current;

      const vX =
        velX.current;

      const vY =
        velY.current;

      const vZ =
        velZ.current;

      const selectedX =
        pX[selectedIndex];

      const selectedY =
        pY[selectedIndex];

      const selectedZ =
        pZ[selectedIndex];

      /*
       * Push all other bubbles away from selected bubble.
       */

      for (
        let i = 0;
        i < count;
        i++
      ) {
        if (
          i === selectedIndex
        ) {
          continue;
        }

        const dx =
          pX[i] -
          selectedX;

        const dy =
          pY[i] -
          selectedY;

        const dz =
          pZ[i] -
          selectedZ;

        const distance =
          Math.sqrt(
            dx * dx +
              dy * dy +
              dz * dz
          ) || 0.001;

        const normalized =
          THREE.MathUtils.clamp(
            1 -
              distance /
                PHYSICS.selectedPushRadius,
            0,
            1
          );

        const falloff =
          normalized *
          normalized;

        const nx =
          dx / distance;

        const ny =
          dy / distance;

        const nz =
          dz / distance;

        const force =
          PHYSICS.selectedPushStrength *
          falloff;

        vX[i] +=
          nx *
          force *
          0.85;

        vY[i] +=
          ny *
          force *
          0.85;

        vZ[i] +=
          nz *
          force *
          0.2;
      }

      /*
       * Pull selected bubble toward center.
       */

      vX[selectedIndex] +=
        -selectedX *
        PHYSICS.selectedCenterStrength *
        0.12;

      vY[selectedIndex] +=
        -selectedY *
        PHYSICS.selectedCenterStrength *
        0.12;

      vZ[selectedIndex] +=
        (0.15 -
          selectedZ) *
        PHYSICS.selectedCenterStrength *
        0.08;

      vZ[selectedIndex] +=
        0.7;

      /*
       * Navigate after the bubble has moved.
       */

      if (
        selectedTimerRef.current
      ) {
        clearTimeout(
          selectedTimerRef.current
        );
      }

      selectedTimerRef.current =
        setTimeout(() => {
          const project =
            projects[
              selectedIndex
            ];

          if (project) {
            onSelect?.(
              project
            );
          }
        }, 650);
    };

  /* ============================================================
     FRAME LOOP
  ============================================================ */

  useFrame(
    (
      state,
      rawDelta
    ) => {
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

      const time =
        state.clock.elapsedTime;

      const dt =
        Math.min(
          rawDelta,
          PHYSICS.maxDeltaTime
        );

      if (
        entranceStart.current ===
        null
      ) {
        entranceStart.current =
          time;
      }

      const entranceElapsed =
        time -
        entranceStart.current;

      /* ========================================================
         MOUSE WORLD POSITION
      ======================================================== */

      if (
        pointerActiveRef.current
      ) {
        raycaster.setFromCamera(
          state.pointer,
          state.camera
        );

        const hit =
          raycaster.ray.intersectPlane(
            plane,
            hitPoint
          );

        if (hit) {
          mouseWorld.current.copy(
            hitPoint
          );
        }
      }

      /* ========================================================
         MOUSE VELOCITY
      ======================================================== */

      if (
        pointerActiveRef.current &&
        mouseHasMoved.current
      ) {
        const dx =
          currentMouse.current.x -
          previousMouse.current.x;

        const dy =
          currentMouse.current.y -
          previousMouse.current.y;

        mouseVelocity.current.x =
          mouseVelocity.current.x *
            0.35 +
          dx * 0.65;

        mouseVelocity.current.y =
          mouseVelocity.current.y *
            0.35 +
          dy * 0.65;
      } else {
        mouseVelocity.current.x *=
          0.82;

        mouseVelocity.current.y *=
          0.82;
      }

      previousMouse.current.copy(
        currentMouse.current
      );

      const pX =
        posX.current;

      const pY =
        posY.current;

      const pZ =
        posZ.current;

      const vX =
        velX.current;

      const vY =
        velY.current;

      const vZ =
        velZ.current;

      const mouseX =
        mouseWorld.current.x;

      const mouseY =
        mouseWorld.current.y;

      const mouseZ =
        mouseWorld.current.z;

      const selectedIndex =
        selectedIndexRef.current;

      /* ========================================================
         EACH BUBBLE
      ======================================================== */

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const i3 =
          i * 3;

        const params =
          bubbleParams[i];

        /* ======================================================
           IDLE FLOAT
        ====================================================== */

        const idleX =
          Math.sin(
            time *
              params.speedX *
              PHYSICS.idleSpeed +
              params.phaseX
          ) *
          PHYSICS.idleMovementStrength;

        const idleY =
          Math.cos(
            time *
              params.speedY *
              PHYSICS.idleSpeed +
              params.phaseY
          ) *
          PHYSICS.idleMovementStrength;

        const idleZ =
          Math.sin(
            time *
              params.speedZ *
              PHYSICS.idleSpeed +
              params.phaseZ
          ) *
          PHYSICS.idleMovementStrength *
          0.65;

        let targetX =
          home[i3] +
          idleX;

        let targetY =
          home[i3 + 1] +
          idleY;

        let targetZ =
          home[i3 + 2] +
          idleZ;

        /* ======================================================
           SELECTED ANIMATION
        ====================================================== */

        if (
          selectedIndex !==
            null &&
          selectedIndex !==
            undefined
        ) {
          if (
            i ===
            selectedIndex
          ) {
            targetX = 0;
            targetY = 0;
            targetZ = 0.15;

            const centerForce =
              PHYSICS.selectedCenterStrength;

            vX[i] +=
              (targetX -
                pX[i]) *
              centerForce *
              dt;

            vY[i] +=
              (targetY -
                pY[i]) *
              centerForce *
              dt;

            vZ[i] +=
              (targetZ -
                pZ[i]) *
              centerForce *
              dt;
          } else {
            const dx =
              pX[i] -
              pX[selectedIndex];

            const dy =
              pY[i] -
              pY[selectedIndex];

            const dz =
              pZ[i] -
              pZ[selectedIndex];

            const distance =
              Math.sqrt(
                dx * dx +
                  dy * dy +
                  dz * dz
              ) || 0.001;

            const nx =
              dx / distance;

            const ny =
              dy / distance;

            const nz =
              dz / distance;

            const pushAmount =
              THREE.MathUtils.clamp(
                1 -
                  distance /
                    PHYSICS.escapeFalloffDistance,
                0,
                1
              );

            vX[i] +=
              nx *
              PHYSICS.escapeStrength *
              pushAmount *
              dt;

            vY[i] +=
              ny *
              PHYSICS.escapeStrength *
              pushAmount *
              dt;

            vZ[i] +=
              nz *
              PHYSICS.escapeStrength *
              0.4 *
              pushAmount *
              dt;

            targetX =
              home[i3] +
              nx *
                PHYSICS.escapeTravelDistance;

            targetY =
              home[i3 + 1] +
              ny *
                PHYSICS.escapeTravelDistance;

            targetZ =
              home[i3 + 2] +
              nz *
                (PHYSICS.escapeTravelDistance *
                  0.32);
          }
        }

        /* ======================================================
           SPRING
        ====================================================== */

        let forceX =
          (targetX -
            pX[i]) *
          PHYSICS.springStrength;

        let forceY =
          (targetY -
            pY[i]) *
          PHYSICS.springStrength;

        let forceZ =
          (targetZ -
            pZ[i]) *
          PHYSICS.springStrength;

        /* ======================================================
           MOUSE INTERACTION
        ====================================================== */

        if (
          pointerActiveRef.current &&
          selectedIndex === null
        ) {
          const dx =
            pX[i] -
            mouseX;

          const dy =
            pY[i] -
            mouseY;

          const dz =
            pZ[i] -
            mouseZ;

          const distance =
            Math.sqrt(
              dx * dx +
                dy * dy +
                dz * dz
            ) || 0.0001;

          if (
            distance <
            PHYSICS.interactionRadius
          ) {
            const normalizedDistance =
              1 -
              distance /
                PHYSICS.interactionRadius;

            const falloff =
              normalizedDistance *
              normalizedDistance;

            const mouseSpeed =
              Math.sqrt(
                mouseVelocity.current.x *
                  mouseVelocity.current.x +
                  mouseVelocity.current.y *
                    mouseVelocity.current.y
              );

            const velocityInfluence =
              1 +
              mouseSpeed *
                PHYSICS.mouseVelocityMultiplier;

            const fastBoost =
              Math.min(
                velocityInfluence,
                PHYSICS.fastMovementBoost
              );

            const strength =
              (PHYSICS.interactionForce *
                falloff *
                fastBoost) /
              Math.max(
                radius[i],
                0.1
              );

            forceX +=
              (dx / distance) *
              strength;

            forceY +=
              (dy / distance) *
              strength;

            forceZ +=
              (dz / distance) *
              strength *
              0.35;
          }
        }

        /* ======================================================
           APPLY FORCE
        ====================================================== */

        vX[i] +=
          forceX * dt;

        vY[i] +=
          forceY * dt;

        vZ[i] +=
          forceZ * dt;
      }

      /* ========================================================
         COLLISIONS
      ======================================================== */

      if (
        selectedIndex === null
      ) {
        for (
          let i = 0;
          i < count;
          i++
        ) {
          for (
            let j = i + 1;
            j < count;
            j++
          ) {
            const dx =
              pX[j] -
              pX[i];

            const dy =
              pY[j] -
              pY[i];

            const dz =
              pZ[j] -
              pZ[i];

            const distance =
              Math.sqrt(
                dx * dx +
                  dy * dy +
                  dz * dz
              ) || 0.0001;

            const minimumDistance =
              (radius[i] +
                radius[j]) *
              PHYSICS.collisionRadiusMultiplier;

            if (
              distance <
              minimumDistance
            ) {
              const overlap =
                (minimumDistance -
                  distance) /
                minimumDistance;

              const nx =
                dx / distance;

              const ny =
                dy / distance;

              const nz =
                dz / distance;

              const push =
                overlap *
                PHYSICS.collisionStrength;

              const massA =
                radius[i] *
                radius[i];

              const massB =
                radius[j] *
                radius[j];

              const totalMass =
                massA +
                massB;

              const shareA =
                massB /
                totalMass;

              const shareB =
                massA /
                totalMass;

              vX[i] -=
                nx *
                push *
                shareA *
                dt;

              vY[i] -=
                ny *
                push *
                shareA *
                dt;

              vZ[i] -=
                nz *
                push *
                shareA *
                dt;

              vX[j] +=
                nx *
                push *
                shareB *
                dt;

              vY[j] +=
                ny *
                push *
                shareB *
                dt;

              vZ[j] +=
                nz *
                push *
                shareB *
                dt;
            }
          }
        }
      }

      /* ========================================================
         DAMPING + POSITION
      ======================================================== */

      const damping =
        Math.pow(
          PHYSICS.damping,
          dt * 60
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        vX[i] *= damping;
        vY[i] *= damping;
        vZ[i] *= damping;

        const speed =
          Math.sqrt(
            vX[i] *
                vX[i] +
              vY[i] *
                vY[i] +
              vZ[i] *
                vZ[i]
          );

        if (
          speed >
          PHYSICS.maxVelocity
        ) {
          const scale =
            PHYSICS.maxVelocity /
            speed;

          vX[i] *= scale;
          vY[i] *= scale;
          vZ[i] *= scale;
        }

        pX[i] +=
          vX[i] * dt;

        pY[i] +=
          vY[i] * dt;

        pZ[i] +=
          vZ[i] * dt;

        /* ======================================================
           SELECTED BUBBLE STAYS VISIBLE
        ====================================================== */

        if (
          selectedIndex ===
          i
        ) {
          pX[i] =
            THREE.MathUtils.clamp(
              pX[i],
              -2.3,
              2.3
            );

          pY[i] =
            THREE.MathUtils.clamp(
              pY[i],
              -1.9,
              1.9
            );

          pZ[i] =
            THREE.MathUtils.clamp(
              pZ[i],
              -0.8,
              1.2
            );
        }

        /* ======================================================
           ENTRANCE
        ====================================================== */

        const delay =
          i *
          PHYSICS.entranceStagger;

        const entranceProgress =
          THREE.MathUtils.clamp(
            (entranceElapsed -
              delay) /
              PHYSICS.entranceDuration,
            0,
            1
          );

        const eased =
          1 -
          Math.pow(
            1 -
              entranceProgress,
            3
          );

        let scale =
          radius[i];

        if (
          entranceProgress < 1
        ) {
          scale =
            radius[i] *
            (0.72 +
              eased * 0.28);
        }

        /* ======================================================
           SELECTED SCALE
        ====================================================== */

        if (
          selectedIndex ===
          i
        ) {
          scale *=
            THREE.MathUtils.lerp(
              1,
              PHYSICS.selectedBubbleScale,
              0.9
            );
        }

        /* ======================================================
           OTHER BUBBLES
        ====================================================== */

        if (
          selectedIndex !==
            null &&
          selectedIndex !==
            i
        ) {
          const distanceFromCenter =
            Math.sqrt(
              pX[i] *
                  pX[i] +
                pY[i] *
                  pY[i]
            );

          const fadeScale =
            THREE.MathUtils.clamp(
              1 -
                Math.max(
                  0,
                  distanceFromCenter -
                    2.2
                ) *
                  0.12,
              0.18,
              1
            );

          scale *=
            fadeScale;
        }

        /* ======================================================
           ROTATION
        ====================================================== */

        const velocityRotation =
          vX[i] *
          PHYSICS.rotationFromVelocity;

        const rotation =
          THREE.MathUtils.clamp(
            velocityRotation,
            -PHYSICS.maxRotationSpeed,
            PHYSICS.maxRotationSpeed
          );

        dummy.position.set(
          pX[i],
          pY[i],
          pZ[i]
        );

        dummy.scale.set(
          scale,
          scale,
          scale
        );

        dummy.rotation.x =
          time *
            bubbleParams[i]
              .rotation +
          rotation *
            0.45;

        dummy.rotation.y =
          time *
            bubbleParams[i]
              .rotation *
            1.3 +
          rotation;

        dummy.rotation.z =
          rotation * 0.25;

        dummy.updateMatrix();

        meshRef.current.setMatrixAt(
          i,
          dummy.matrix
        );

        if (shellMeshRef.current) {
          const shellScale = scale * 1.025;

          dummy.scale.set(
            shellScale,
            shellScale,
            shellScale
          );

          dummy.updateMatrix();

          shellMeshRef.current.setMatrixAt(
            i,
            dummy.matrix
          );
        }
      }

      meshRef.current.instanceMatrix.needsUpdate =
        true;

      if (shellMeshRef.current) {
        shellMeshRef.current.instanceMatrix.needsUpdate =
          true;
      }
    }
  );

  /* ============================================================
     CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      if (
        selectedTimerRef.current
      ) {
        clearTimeout(
          selectedTimerRef.current
        );
      }
    };
  }, []);

  /* ============================================================
     RENDER
  ============================================================ */

  if (
    !material ||
    !atlasMeta
  ) {
    return null;
  }

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[
          geometry,
          material,
          count,
        ]}
        frustumCulled={false}
        renderOrder={1}
        onPointerMove={(e) => {
        e.stopPropagation();

        currentMouse.current.set(
          e.clientX,
          e.clientY
        );

        mouseHasMoved.current =
          true;
      }}
      onPointerDown={(e) => {
        e.stopPropagation();

        pointerDownRef.current = {
          x: e.clientX,
          y: e.clientY,
          instanceId:
            e.instanceId,
        };
      }}
      onPointerUp={(e) => {
        e.stopPropagation();

        const down =
          pointerDownRef.current;

        pointerDownRef.current =
          null;

        if (
          !down ||
          down.instanceId ==
            null
        ) {
          return;
        }

        const dx =
          e.clientX -
          down.x;

        const dy =
          e.clientY -
          down.y;

        const moved =
          Math.sqrt(
            dx * dx +
              dy * dy
          );

        if (
          moved < 8 &&
          e.instanceId ===
            down.instanceId
        ) {
          triggerExplosion(
            down.instanceId
          );
        }
        }}
      />

      <instancedMesh
        ref={shellMeshRef}
        args={[
          geometry,
          bubbleShellMaterial,
          count,
        ]}
        frustumCulled={false}
        renderOrder={2}
        raycast={() => null}
      />
    </>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function ProjectBubbles({
  projects,
}) {
  const list =
    useMemo(
      () =>
        projects ??
        PROJECTS,
      [projects]
    );

  const router =
    useRouter();

  const pointerActiveRef =
    useRef(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const handlePointerMove =
    () => {
      pointerActiveRef.current =
        true;
    };

  const handleSelect =
    (project) => {
      if (!project?.slug) {
        return;
      }

      router.push(
        `/projects/${project.slug}`
      );
    };

  return (
    <section
      className={
        styles.wrapper
      }
      onPointerEnter={() => {
        pointerActiveRef.current =
          true;
      }}
      onPointerMove={
        handlePointerMove
      }
      onPointerDown={() => {
        pointerActiveRef.current =
          true;
      }}
      onPointerLeave={() => {
        pointerActiveRef.current =
          false;

        mouseHasMovedReset();
      }}
      onPointerCancel={() => {
        pointerActiveRef.current =
          false;
      }}
    >
      {isLoading && (
        <div
          className={
            styles.loader
          }
        >
          <div
            className={
              styles.spinner
            }
          />
        </div>
      )}

      <Canvas
        className={
          styles.canvas
        }
        dpr={[1, 1.5]}
        camera={{
          position: [
            0,
            0,
            7,
          ],
          fov: 42,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference:
            "high-performance",
        }}
      >
        {/* =====================================================
            BASE LIGHT
        ===================================================== */}

        <ambientLight
          intensity={0.65}
        />

        {/* Main upper-left light */}
        <directionalLight
          position={[
            -4,
            6,
            7,
          ]}
          intensity={4.0}
        />

        {/* Front fill */}
        <directionalLight
          position={[
            5,
            1,
            6,
          ]}
          intensity={2.0}
        />

        {/* Lower soft light */}
        <pointLight
          position={[
            3,
            -4,
            4,
          ]}
          intensity={1.5}
          distance={14}
        />

        {/* Small edge light */}
        <pointLight
          position={[
            -5,
            2,
            3,
          ]}
          intensity={2.0}
          distance={14}
        />

        {/* =====================================================
            STUDIO ENVIRONMENT
        ===================================================== */}

        <Environment
          preset="studio"
          resolution={256}
        />

        <BubbleField
          projects={list}
          onSelect={
            handleSelect
          }
          pointerActiveRef={
            pointerActiveRef
          }
          onLoadingChange={
            setIsLoading
          }
        />
      </Canvas>
    </section>
  );
}

/* ================================================================
   SMALL HELPER
================================================================ */

function mouseHasMovedReset() {
  /*
   * Pointer state is controlled by the canvas component.
   */
}
