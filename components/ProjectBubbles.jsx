"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

const PROJECTS = [
  { image: "/projects/inayit.png", slug: "inayit", title: "Inayit" },
  { image: "/projects/cilicosys.png", slug: "cilicosys", title: "Cilicosys" },
  {
    image: "/projects/magichands.jpg",
    slug: "magichands-physiotherapy",
    title: "Magichands Physiotherapy",
  },
  {
    image: "/projects/3d-tailor-space.png",
    slug: "3d-tailor-space",
    title: "3D Tailor Space",
  },
  { image: "/projects/cartlane.png", slug: "cartlane", title: "Cartlane" },
  {
    image: "/projects/sandtglobal.jpg",
    slug: "sandtglobal",
    title: "SandTGlobal",
  },
  { image: "/projects/collins.jpg", slug: "collins", title: "Collins" },
  { image: "/projects/dentalbay.jpg", slug: "dentalbay", title: "DentalBay" },
  { image: "/projects/amal.jpg", slug: "amal-al-sham", title: "Amal Al-Sham" },
  { image: "/projects/epyrocxx.jpg", slug: "epyrocxx", title: "Epyrocxx" },
];

const PHYSICS = {
  bubbleCount: 20,

  // How wide the cluster/wander fans out, in radians.
  // Math.PI * 2 = full 360° circle, Math.PI = 180° (half), Math.PI / 2 = 90°.
  spreadAngle: Math.PI,

  // Normal floating motion
  springStrength: 2.4,
  damping: 0.9,
  maxVelocity: 6,

  wanderStep: 0.18,
  wanderChangeInterval: [2.2, 4.5],

  // Mouse interaction
  // Mouse interaction
hoverRadius: 20.2,
hoverForce: 90,

  // Bubble collision
  collisionStrength: 10,
  collisionRadiusMultiplier: 0.94,
  collisionSolverIterations: 3,

  // Cluster
  cohesionStrength: 3.8,
  cohesionRadius: 2.1,

  // CLICK EXPLOSION
  explosionRadius: 5.8,
  explosionStrength: 30,
  explosionOutwardVelocity: 11,
  explosionMaxVelocity: 42,
  explosionVelocityDamping: 0.998,

  // Selected bubble
  selectedScale: 1.7,
  selectedForward: 4.0,
  selectedCenterStrength: 11,
  selectedAttraction: 8,

  // Animation
  explosionDamping: 0.965,
  selectedLerp: 0.1,
  explosionLerp: 0.075,

  navigateDelay: 850,

  maxDeltaTime: 1 / 30,
};

function createHighlightMesh(size) {
  const geometry = new THREE.CircleGeometry(size, 24);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,

    fragmentShader: `
      varying vec2 vUv;

      void main() {
        float d = distance(vUv, vec2(0.5)) * 2.0;
        float alpha = smoothstep(1.0, 0.0, d);

        gl_FragColor = vec4(
          1.0,
          1.0,
          1.0,
          alpha * 0.85
        );
      }
    `,

    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);
      }
    `,
  });

  return new THREE.Mesh(geometry, material);
}

function domeSurfacePoint(
  radius,
  bulgeRatio,
  normalizedRadius,
  theta,
  liftFactor = 1.015,
) {
  const bulgeHeight = radius * bulgeRatio;

  const sphereRadius =
    (radius * radius + bulgeHeight * bulgeHeight) /
    (2 * bulgeHeight);

  const radialDistance = normalizedRadius * radius;

  const z =
    Math.sqrt(
      Math.max(
        sphereRadius * sphereRadius -
          radialDistance * radialDistance,
        0,
      ),
    ) -
    (sphereRadius - bulgeHeight);

  return [
    radialDistance * Math.cos(theta) * liftFactor,
    radialDistance * Math.sin(theta) * liftFactor,
    z * liftFactor + radius * 0.01,
  ];
}

function createFallbackTexture() {
  const canvas = document.createElement("canvas");

  canvas.width = 8;
  canvas.height = 8;

  const context = canvas.getContext("2d");

  if (context) {
    const gradient = context.createLinearGradient(0, 0, 8, 8);

    gradient.addColorStop(0, "#999");
    gradient.addColorStop(1, "#333");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 8, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

export default function GlassBubbles() {
  const mountRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100,
    );

    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2),
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mount.appendChild(renderer.domElement);

    /*
     * --------------------------------------------------
     * LIGHTING
     * --------------------------------------------------
     */

    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff,
      0x17051f,
      1.4,
    );

    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      1.7,
    );

    keyLight.position.set(6, 9, 10);

    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      0x9fc0ff,
      1.0,
    );

    rimLight.position.set(-8, -3, -5);

    scene.add(rimLight);

    const fillLight = new THREE.PointLight(
      0xffffff,
      1.0,
      60,
    );

    fillLight.position.set(-3, 3, 9);

    scene.add(fillLight);

    /*
     * --------------------------------------------------
     * BUBBLES
     * --------------------------------------------------
     */

    const textureLoader = new THREE.TextureLoader();

    textureLoader.crossOrigin = "anonymous";

    const bubbles = [];

    const domeMeshes = [];

    const count = PHYSICS.bubbleCount;

    const bulge = 0.92;

    for (let i = 0; i < count; i++) {
      const project = PROJECTS[i % PROJECTS.length];

      const radius =
        1.35 + Math.random() * 0.40;

      const group = new THREE.Group();

      /*
       * Glass material
       */

      const material =
        new THREE.MeshPhysicalMaterial({
          roughness: 0.28,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          reflectivity: 0.8,
          ior: 1.42,

          transparent: true,
          opacity: 0.98,
        });

      /*
       * Shader enhancement
       */

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = {
          value: 0,
        };

        shader.uniforms.uHover = {
          value: 0,
        };

        shader.vertexShader = `
          varying vec3 vWorldPosition;
          varying vec3 vNormalWorld;
          varying vec2 vBubbleUv;

          uniform float uTime;
          uniform float uHover;

        ` + shader.vertexShader;

        shader.vertexShader =
          shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
              #include <begin_vertex>

              vBubbleUv = uv;

              vec4 worldPosition =
                modelMatrix *
                vec4(transformed, 1.0);

              vWorldPosition = worldPosition.xyz;

              vNormalWorld =
                normalize(
                  mat3(modelMatrix) *
                  transformedNormal
                );
            `,
          );

        shader.fragmentShader = `
          varying vec3 vWorldPosition;
          varying vec3 vNormalWorld;
          varying vec2 vBubbleUv;

          uniform float uTime;
          uniform float uHover;

        ` + shader.fragmentShader;

        shader.fragmentShader =
          shader.fragmentShader.replace(
            "#include <dithering_fragment>",
            `
              #include <dithering_fragment>

              float fresnel =
                pow(
                  1.0 -
                  abs(
                    dot(
                      normalize(vNormalWorld),
                      normalize(
                        cameraPosition -
                        vWorldPosition
                      )
                    )
                  ),
                  3.0
                );

              float shimmer =
                sin(
                  vBubbleUv.x * 12.0 +
                  vBubbleUv.y * 10.0 +
                  uTime * 1.5
                ) * 0.5 + 0.5;

              vec3 glassGlow =
                vec3(1.0);

              float glowStrength =
                fresnel * 0.38 +
                shimmer * uHover * 0.18;

              gl_FragColor.rgb +=
                glassGlow *
                glowStrength;
            `,
          );

        material.userData.shader = shader;
      };

      /*
       * Texture
       */

      let texture = textureLoader.load(
        project.image,
        (loadedTexture) => {
          loadedTexture.colorSpace =
            THREE.SRGBColorSpace;

          material.map = loadedTexture;

          material.needsUpdate = true;
        },
        undefined,
        () => {
          texture = createFallbackTexture();

          material.map = texture;

          material.needsUpdate = true;
        },
      );

      texture.colorSpace =
        THREE.SRGBColorSpace;

      material.map = texture;

      /*
       * Sphere
       */

      const geometry =
        new THREE.SphereGeometry(
          radius,
          48,
          48,
        );

      const dome = new THREE.Mesh(
        geometry,
        material,
      );

      dome.userData.bubbleIndex = i;

      group.add(dome);

      domeMeshes.push(dome);

      /*
       * Glass highlights
       */

      const dotCount =
        2 + Math.floor(Math.random() * 2);

      for (
        let dotIndex = 0;
        dotIndex < dotCount;
        dotIndex++
      ) {
        const normalizedRadius =
          dotIndex === 0
            ? 0.32
            : 0.5 + Math.random() * 0.25;

        const theta =
          dotIndex === 0
            ? 2.35
            : 2.1 +
              (Math.random() - 0.5) *
                0.9;

        const [
          highlightX,
          highlightY,
          highlightZ,
        ] = domeSurfacePoint(
          radius,
          bulge,
          normalizedRadius,
          theta,
        );

        const dotSize =
          (dotIndex === 0
            ? 0.16
            : 0.07) * radius;

        const highlight =
          createHighlightMesh(dotSize);

        highlight.position.set(
          highlightX,
          highlightY,
          highlightZ,
        );

        group.add(highlight);
      }

      /*
       * ------------------------------------------------
       * INITIAL CLUSTER
       *
       * Important:
       * Keep the initial cluster tight like the video.
       * ------------------------------------------------
       */

      const angle =
  (Math.random() - 0.5) *
  PHYSICS.spreadAngle;

const distance =
  Math.pow(Math.random(), 1.7) *
  2.0;

// sin -> full left/right width, cos -> upper 180° dome only
const x =
  Math.sin(angle) *
  distance;

const y =
  Math.cos(angle) *
  distance *
  0.78 -
  0.6;

      const z =
        (Math.random() - 0.5) *
        2.0;

      group.position.set(
        x,
        y,
        z,
      );

      /*
       * Physics state
       */

      group.userData = {
        material,

        wanderX: x,
        wanderY: y,
        wanderZ: z,

        wanderChangeAt: 0,

        wanderDirX: 0,
        wanderDirY: 0,
        wanderDirZ: 0,

        floatSpeed:
          0.25 +
          Math.random() * 0.35,

        floatAmp:
          0.25 +
          Math.random() * 0.35,

        phase:
          Math.random() *
          Math.PI *
          2,

        drift:
          Math.random() *
          Math.PI *
          2,

        texture,

        radius,

        vx: 0,
        vy: 0,
        vz: 0,

        baseScale: 1,
        targetScale: 1,

        project,

        index: i,

        exploded: false,

        explosionLife: 0,

        /*
         * Direction assigned when clicked.
         */

        explosionDirX: 0,
        explosionDirY: 0,
        explosionDirZ: 0,

        explosionDistance: 0,
      };

      scene.add(group);

      bubbles.push(group);
    }

    /*
     * --------------------------------------------------
     * POINTER
     * --------------------------------------------------
     */

    mount.style.touchAction = "none";

    const mouse = {
      x: 0,
      y: 0,
    };

    const ndc =
      new THREE.Vector2(
        9999,
        9999,
      );

    const raycaster =
      new THREE.Raycaster();

    /*
     * Plane used for mouse physics.
     */

    const groundPlane =
      new THREE.Plane(
        new THREE.Vector3(0, 0, 1),
        0,
      );

    const mouseWorld =
      new THREE.Vector3(
        9999,
        9999,
        0,
      );

    const planeHit =
      new THREE.Vector3();

    let pointerActive = false;

    let pointerDown = null;

    let selectedIndex = null;

    let navigateTimer = null;

    /*
     * --------------------------------------------------
     * POINTER HELPERS
     * --------------------------------------------------
     */

    function updatePointer(event) {
      const rect =
        mount.getBoundingClientRect();

      mouse.x =
        ((event.clientX -
          rect.left) /
          rect.width -
          0.5) *
        2;

      mouse.y =
        ((event.clientY -
          rect.top) /
          rect.height -
          0.5) *
        2;

      ndc.x =
        ((event.clientX -
          rect.left) /
          rect.width) *
          2 -
        1;

      ndc.y =
        -(
          ((event.clientY -
            rect.top) /
            rect.height) *
            2 -
          1
        );
    }

    function pointerMove(event) {
      updatePointer(event);

      pointerActive = true;
    }

    function pointerEnter(event) {
      updatePointer(event);

      pointerActive = true;
    }

    function pointerLeave() {
      pointerActive = false;

      mouseWorld.set(
        9999,
        9999,
        0,
      );
    }

    /*
     * --------------------------------------------------
     * POINTER DOWN
     * --------------------------------------------------
     */

    function pointerDownHandler(event) {
      updatePointer(event);

      pointerActive = true;

      raycaster.setFromCamera(
        ndc,
        camera,
      );

      const hits =
        raycaster.intersectObjects(
          domeMeshes,
          false,
        );

      pointerDown = {
        x: event.clientX,
        y: event.clientY,

        index:
          hits.length > 0
            ? hits[0].object.userData
                .bubbleIndex
            : null,
      };
    }

    /*
     * --------------------------------------------------
     * EXPLOSION
     *
     * This is the important part.
     *
     * Every other bubble gets a radial direction
     * away from the selected bubble.
     * --------------------------------------------------
     */

    function explodeBubble(selected) {
      if (
        selectedIndex !== null
      ) {
        return;
      }

      selectedIndex = selected;

      const selectedBubble =
        bubbles[selected];

      const selectedPosition =
        selectedBubble.position.clone();

      /*
       * Selected bubble:
       *
       * - becomes bigger
       * - moves to center
       * - moves slightly toward camera
       */

      selectedBubble.userData.targetScale =
        PHYSICS.selectedScale;

      selectedBubble.userData.vx +=
        -selectedBubble.position.x *
        PHYSICS.selectedCenterStrength;

      selectedBubble.userData.vy +=
        -selectedBubble.position.y *
        PHYSICS.selectedCenterStrength;

      selectedBubble.userData.vz +=
        PHYSICS.selectedForward;

      /*
       * Push every other bubble away.
       */

      for (
        let i = 0;
        i < bubbles.length;
        i++
      ) {
        if (i === selected) {
          continue;
        }

        const bubble = bubbles[i];

        const data =
          bubble.userData;

        const direction =
          bubble.position
            .clone()
            .sub(selectedPosition);

        let distance =
          direction.length();

        /*
         * Prevent zero-length direction.
         */

        if (distance < 0.001) {
          direction.set(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5,
          );

          distance =
            direction.length();
        }

        direction.normalize();

        /*
         * Close bubbles receive much
         * stronger force.
         */

        const proximity =
          THREE.MathUtils.clamp(
            1 -
              distance /
                PHYSICS.explosionRadius,
            0,
            1,
          );

        /*
         * Strong near center,
         * softer farther away.
         */

        const falloff =
          0.35 +
          proximity *
            proximity *
            2.2;

        const strength =
          PHYSICS.explosionStrength *
          falloff;

        /*
         * Store the direction so the
         * explosion continues visually.
         */

        data.explosionDirX =
          direction.x;

        data.explosionDirY =
          direction.y;

        data.explosionDirZ =
          direction.z;

        data.explosionDistance =
          distance;

        data.exploded = true;

        data.explosionLife = 0;

        /*
         * Initial velocity.
         */

        data.vx +=
          direction.x *
          PHYSICS.explosionOutwardVelocity *
          falloff;

        data.vy +=
          direction.y *
          PHYSICS.explosionOutwardVelocity *
          falloff;

        data.vz +=
          direction.z *
          PHYSICS.explosionOutwardVelocity *
          falloff;

        /*
         * Small random variation makes the
         * explosion organic instead of perfect.
         */

        data.vx +=
          (Math.random() - 0.5) *
          0.7;

        data.vy +=
          (Math.random() - 0.5) *
          0.7;

        data.vz +=
          (Math.random() - 0.5) *
          0.4;

        /*
         * Extra immediate push.
         */

        data.vx +=
          direction.x *
          strength *
          0.18;

        data.vy +=
          direction.y *
          strength *
          0.18;

        data.vz +=
          direction.z *
          strength *
          0.18;
      }

      /*
       * Navigate after the animation.
       */

      if (navigateTimer) {
        clearTimeout(
          navigateTimer,
        );
      }

      navigateTimer =
        setTimeout(() => {
          const project =
            selectedBubble.userData
              .project;

          if (
            project &&
            project.slug
          ) {
            router.push(
              `/projects/${project.slug}`,
            );
          }
        }, PHYSICS.navigateDelay);
    }

    /*
     * --------------------------------------------------
     * POINTER UP
     * --------------------------------------------------
     */

    function pointerUpHandler(event) {
      const down =
        pointerDown;

      pointerDown = null;

      if (
        !down ||
        down.index === null
      ) {
        return;
      }

      const deltaX =
        event.clientX -
        down.x;

      const deltaY =
        event.clientY -
        down.y;

      const distance =
        Math.sqrt(
          deltaX * deltaX +
            deltaY * deltaY,
        );

      /*
       * Small movement = click/tap.
       */

      if (distance < 14) {
        explodeBubble(
          down.index,
        );
      }
    }

    mount.addEventListener(
      "pointermove",
      pointerMove,
    );

    mount.addEventListener(
      "pointerenter",
      pointerEnter,
    );

    mount.addEventListener(
      "pointerleave",
      pointerLeave,
    );

    mount.addEventListener(
      "pointerdown",
      pointerDownHandler,
    );

    window.addEventListener(
      "pointerup",
      pointerUpHandler,
    );

    window.addEventListener(
      "pointercancel",
      pointerUpHandler,
    );

    /*
     * --------------------------------------------------
     * ANIMATION
     * --------------------------------------------------
     */

    const clock =
      new THREE.Clock();

    let frameId = 0;

    function animate() {
      frameId =
        requestAnimationFrame(
          animate,
        );

      const deltaTime =
        Math.min(
          clock.getDelta(),
          PHYSICS.maxDeltaTime,
        );

      const elapsed =
        clock.elapsedTime;

      /*
       * Update mouse world position.
       */

      if (pointerActive) {
        raycaster.setFromCamera(
          ndc,
          camera,
        );

        const hit =
          raycaster.ray.intersectPlane(
            groundPlane,
            planeHit,
          );

        if (hit) {
          mouseWorld.copy(
            planeHit,
          );
        }
      }

      /*
       * ------------------------------------------------
       * BUBBLE FORCES
       * ------------------------------------------------
       */

      for (
        let i = 0;
        i < bubbles.length;
        i++
      ) {
        const bubble =
          bubbles[i];

        const data =
          bubble.userData;

        const {
          radius,
          floatSpeed,
          floatAmp,
          phase,
          drift,
          texture,
          material,
        } = data;

        /*
         * Shader animation.
         */

        if (
          material?.userData
            ?.shader
        ) {
          material.userData
            .shader.uniforms
            .uTime.value =
            elapsed;
        }

        /*
         * Texture movement.
         */

        texture.offset.set(
          Math.sin(
            elapsed * 0.15 +
              drift,
          ) * 0.01,

          Math.cos(
            elapsed * 0.12 +
              drift,
          ) * 0.01,
        );

        /*
         * ------------------------------------------------
         * SELECTED BUBBLE
         * ------------------------------------------------
         */

        if (
          selectedIndex === i
        ) {
          /*
           * Smoothly pull selected bubble
           * toward exact center.
           */

          data.vx +=
            -bubble.position.x *
            PHYSICS.selectedAttraction *
            deltaTime;

          data.vy +=
            -bubble.position.y *
            PHYSICS.selectedAttraction *
            deltaTime;

          /*
           * Bring it toward camera.
           */

          data.vz +=
            (PHYSICS.selectedForward -
              bubble.position.z) *
            5 *
            deltaTime;

          data.targetScale =
            PHYSICS.selectedScale;

          continue;
        }

        /*
         * ------------------------------------------------
         * EXPLODING BUBBLES
         * ------------------------------------------------
         */

        if (data.exploded) {
          data.explosionLife +=
            deltaTime;

          /*
           * Continue pushing outward.
           *
           * This makes the movement match the
           * video much better than a single impulse.
           */

          const time =
            data.explosionLife;

          /*
           * Strong initial push,
           * quickly decreasing.
           */

          const pushFade =
            Math.exp(
              -time * 1.15,
            );

          const distanceFade =
            THREE.MathUtils.clamp(
              1 -
                data.explosionDistance /
                  7,
              0.2,
              1,
            );

          const push =
            PHYSICS.explosionStrength *
            pushFade *
            distanceFade;

          data.vx +=
            data.explosionDirX *
            push *
            deltaTime;

          data.vy +=
            data.explosionDirY *
            push *
            deltaTime;

          data.vz +=
            data.explosionDirZ *
            push *
            deltaTime;

          /*
           * Explosion damping.
           */

          const explosionDamping =
            Math.pow(
              PHYSICS.explosionDamping,
              deltaTime * 60,
            );

          data.vx *=
            explosionDamping;

          data.vy *=
            explosionDamping;

          data.vz *=
            explosionDamping;

          /*
           * Smaller during explosion.
           */

          data.targetScale =
            0.92;

          /*
           * Slight rotation.
           */

          bubble.rotation.z +=
            0.12 *
            deltaTime;

          /*
           * Don't let normal wandering
           * pull these bubbles back into
           * the cluster.
           */

          continue;
        }

        /*
         * ------------------------------------------------
         * NORMAL WANDER
         * ------------------------------------------------
         */

        if (
          elapsed >=
          data.wanderChangeAt
        ) {
          const angle =
  (Math.random() - 0.5) *
  PHYSICS.spreadAngle;

const zAngle =
  (Math.random() -
    0.5) *
  Math.PI;

data.wanderDirX =
  Math.sin(angle) *
  Math.cos(zAngle);

data.wanderDirY =
  Math.cos(angle) *
  Math.cos(zAngle) -
  0.15;

          data.wanderDirZ =
            Math.sin(zAngle);

          const [
            minimumTime,
            maximumTime,
          ] =
            PHYSICS.wanderChangeInterval;

          data.wanderChangeAt =
            elapsed +
            minimumTime +
            Math.random() *
              (maximumTime -
                minimumTime);
        }

        data.wanderX +=
          data.wanderDirX *
          PHYSICS.wanderStep *
          deltaTime;

        data.wanderY +=
          data.wanderDirY *
          PHYSICS.wanderStep *
          deltaTime;

        data.wanderZ +=
          data.wanderDirZ *
          PHYSICS.wanderStep *
          deltaTime;

        /*
         * Floating target.
         */

        const targetX =
          data.wanderX +
          Math.cos(
            elapsed *
              floatSpeed *
              0.6 +
              phase,
          ) *
            0.18;

        const targetY =
          data.wanderY +
          Math.sin(
            elapsed *
              floatSpeed +
              phase,
          ) *
            floatAmp *
            0.55;

        const targetZ =
          data.wanderZ;

        let forceX =
          (targetX -
            bubble.position.x) *
          PHYSICS.springStrength;

        let forceY =
          (targetY -
            bubble.position.y) *
          PHYSICS.springStrength;

        let forceZ =
          (targetZ -
            bubble.position.z) *
          PHYSICS.springStrength;

        /*
         * ------------------------------------------------
         * CLUSTER COHESION
         * ------------------------------------------------
         */

        const distanceFromCenter =
          Math.sqrt(
            bubble.position.x *
              bubble.position.x +
              bubble.position.y *
                bubble.position.y +
              bubble.position.z *
                bubble.position.z,
          );

        if (
          distanceFromCenter >
          PHYSICS.cohesionRadius
        ) {
          const pull =
            (distanceFromCenter -
              PHYSICS.cohesionRadius) *
            PHYSICS.cohesionStrength;

          forceX +=
            (-bubble.position.x /
              distanceFromCenter) *
            pull;

          forceY +=
            (-bubble.position.y /
              distanceFromCenter) *
            pull;

          forceZ +=
            (-bubble.position.z /
              distanceFromCenter) *
            pull;
        }

        /*
         * ------------------------------------------------
         * MOUSE REPULSION
         * ------------------------------------------------
         */

        if (pointerActive) {
          const dx =
            bubble.position.x -
            mouseWorld.x;

          const dy =
            bubble.position.y -
            mouseWorld.y;

          const distance =
            Math.sqrt(
              dx * dx +
                dy * dy,
            );

          if (
            distance <
            PHYSICS.hoverRadius
          ) {
            const normalized =
              THREE.MathUtils.clamp(
                1 -
                  distance /
                    PHYSICS.hoverRadius,
                0,
                1,
              );

            /*
             * Hover glow.
             */

            if (
              material.userData
                .shader
            ) {
              material.userData
                .shader.uniforms
                .uHover.value =
                THREE.MathUtils.lerp(
                  material.userData
                    .shader.uniforms
                    .uHover.value,
                  normalized,
                  0.15,
                );
            }

            const falloff =
              normalized *
              normalized;

           const strength =
  (PHYSICS.hoverForce *
    falloff) /
  Math.sqrt(
    Math.max(radius, 0.3),
              );

            let dirX =
              dx /
              Math.max(
                distance,
                0.001,
              );

            let dirY =
              dy /
              Math.max(
                distance,
                0.001,
              );

            if (
              distance <
              0.05
            ) {
              dirX =
                Math.random() -
                0.5;

              dirY =
                Math.random() -
                0.5;

              const length =
                Math.sqrt(
                  dirX * dirX +
                    dirY * dirY,
                ) || 1;

              dirX /= length;
              dirY /= length;
            }

            forceX +=
              dirX * strength;

            forceY +=
              dirY * strength;
          }
        }

        /*
         * Apply forces.
         */

        data.vx +=
          forceX *
          deltaTime;

        data.vy +=
          forceY *
          deltaTime;

        data.vz +=
          forceZ *
          deltaTime;

        data.targetScale = 1;
      }

      /*
       * --------------------------------------------------
       * VELOCITY / POSITION
       * --------------------------------------------------
       */

      const damping =
        Math.pow(
          PHYSICS.damping,
          deltaTime * 60,
        );

      for (
        let i = 0;
        i < bubbles.length;
        i++
      ) {
        const bubble =
          bubbles[i];

        const data =
          bubble.userData;

        /*
         * Don't damp the selected bubble
         * too aggressively. Exploded bubbles get
         * a much lighter damping so they keep
         * flying off screen instead of settling
         * back down near the cluster.
         */

        if (selectedIndex !== i) {
          if (data.exploded) {
            const explosionVelocityDamping =
              Math.pow(
                PHYSICS.explosionVelocityDamping,
                deltaTime * 60,
              );

            data.vx *= explosionVelocityDamping;
            data.vy *= explosionVelocityDamping;
            data.vz *= explosionVelocityDamping;
          } else {
            data.vx *= damping;
            data.vy *= damping;
            data.vz *= damping;
          }
        }

        const speed =
          Math.sqrt(
            data.vx *
                data.vx +
              data.vy *
                data.vy +
              data.vz *
                data.vz,
          );

        const maximumSpeed =
          data.exploded
            ? PHYSICS.explosionMaxVelocity
            : PHYSICS.maxVelocity;

        if (
          speed >
          maximumSpeed
        ) {
          const scale =
            maximumSpeed /
            speed;

          data.vx *= scale;
          data.vy *= scale;
          data.vz *= scale;
        }

               bubble.position.x +=
          data.vx *
          deltaTime;

        bubble.position.y +=
          data.vy *
          deltaTime;

        bubble.position.z +=
          data.vz *
          deltaTime;

        /*
         * Keep normal bubbles inside the visible frustum
         * so bigger radii can't push them off-screen.
         */
        if (selectedIndex !== i && !data.exploded) {
          const fovRadians =
            (camera.fov * Math.PI) / 180;

          const distanceFromCamera =
            camera.position.z -
            bubble.position.z;

          const visibleHeight =
            2 *
            Math.tan(fovRadians / 2) *
            distanceFromCamera;

          const visibleWidth =
            visibleHeight * camera.aspect;

          const effectiveRadius =
            data.radius * data.baseScale;

          const maxY =
            visibleHeight / 2 -
            effectiveRadius -
            0.2;

          const maxX =
            visibleWidth / 2 -
            effectiveRadius -
            0.2;

          bubble.position.y =
            THREE.MathUtils.clamp(
              bubble.position.y,
              -maxY,
              maxY,
            );

          bubble.position.x =
            THREE.MathUtils.clamp(
              bubble.position.x,
              -maxX,
              maxX,
            );
        }

      }

      /*
       * --------------------------------------------------
       * COLLISIONS
       *
       * Disable collisions once clicked.
       * Otherwise the bubbles can fight the explosion.
       * --------------------------------------------------
       */

      if (
        selectedIndex === null
      ) {
        /*
         * Velocity collision force.
         */

        for (
          let i = 0;
          i < bubbles.length;
          i++
        ) {
          for (
            let j = i + 1;
            j < bubbles.length;
            j++
          ) {
            const bubbleA =
              bubbles[i];

            const bubbleB =
              bubbles[j];

            const dx =
              bubbleB.position.x -
              bubbleA.position.x;

            const dy =
              bubbleB.position.y -
              bubbleA.position.y;

            const dz =
              bubbleB.position.z -
              bubbleA.position.z;

            let distance =
              Math.sqrt(
                dx * dx +
                  dy * dy +
                  dz * dz,
              );

            if (
              distance <
              0.0001
            ) {
              distance = 0.0001;
            }

            const minimumDistance =
              (bubbleA.userData
                .radius +
                bubbleB.userData
                  .radius) *
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
                bubbleA.userData
                  .radius *
                bubbleA.userData
                  .radius;

              const massB =
                bubbleB.userData
                  .radius *
                bubbleB.userData
                  .radius;

              const totalMass =
                massA + massB;

              const shareA =
                massB /
                totalMass;

              const shareB =
                massA /
                totalMass;

              bubbleA.userData.vx -=
                nx *
                push *
                shareA *
                deltaTime;

              bubbleA.userData.vy -=
                ny *
                push *
                shareA *
                deltaTime;

              bubbleA.userData.vz -=
                nz *
                push *
                shareA *
                deltaTime;

              bubbleB.userData.vx +=
                nx *
                push *
                shareB *
                deltaTime;

              bubbleB.userData.vy +=
                ny *
                push *
                shareB *
                deltaTime;

              bubbleB.userData.vz +=
                nz *
                push *
                shareB *
                deltaTime;
            }
          }
        }

        /*
         * Position solver.
         */

        for (
          let iteration = 0;
          iteration <
          PHYSICS.collisionSolverIterations;
          iteration++
        ) {
          let overlapFound =
            false;

          for (
            let i = 0;
            i < bubbles.length;
            i++
          ) {
            for (
              let j = i + 1;
              j < bubbles.length;
              j++
            ) {
              const bubbleA =
                bubbles[i];

              const bubbleB =
                bubbles[j];

              const dx =
                bubbleB.position.x -
                bubbleA.position.x;

              const dy =
                bubbleB.position.y -
                bubbleA.position.y;

              const dz =
                bubbleB.position.z -
                bubbleA.position.z;

              let distance =
                Math.sqrt(
                  dx * dx +
                    dy * dy +
                    dz * dz,
                );

              const minimumDistance =
                (bubbleA.userData
                  .radius +
                  bubbleB.userData
                    .radius) *
                PHYSICS.collisionRadiusMultiplier;

              if (
                distance <
                minimumDistance
              ) {
                overlapFound =
                  true;

                if (
                  distance <
                  0.0001
                ) {
                  distance =
                    0.0001;
                }

                const nx =
                  dx / distance;

                const ny =
                  dy / distance;

                const nz =
                  dz / distance;

                const correction =
                  minimumDistance -
                  distance;

                const massA =
                  bubbleA.userData
                    .radius *
                  bubbleA.userData
                    .radius;

                const massB =
                  bubbleB.userData
                    .radius *
                  bubbleB.userData
                    .radius;

                const totalMass =
                  massA + massB;

                const shareA =
                  massB /
                  totalMass;

                const shareB =
                  massA /
                  totalMass;

                bubbleA.position.x -=
                  nx *
                  correction *
                  shareA;

                bubbleA.position.y -=
                  ny *
                  correction *
                  shareA;

                bubbleA.position.z -=
                  nz *
                  correction *
                  shareA;

                bubbleB.position.x +=
                  nx *
                  correction *
                  shareB;

                bubbleB.position.y +=
                  ny *
                  correction *
                  shareB;

                bubbleB.position.z +=
                  nz *
                  correction *
                  shareB;
              }
            }
          }

          if (!overlapFound) {
            break;
          }
        }
      }

      /*
       * --------------------------------------------------
       * SCALE + BILLBOARD
       * --------------------------------------------------
       */

      for (
        let i = 0;
        i < bubbles.length;
        i++
      ) {
        const bubble =
          bubbles[i];

        const data =
          bubble.userData;

        data.baseScale =
          THREE.MathUtils.lerp(
            data.baseScale,
            data.targetScale,
            selectedIndex === i
              ? PHYSICS.selectedLerp
              : PHYSICS.explosionLerp,
          );

        bubble.scale.setScalar(
          data.baseScale,
        );

        /*
         * Face camera.
         */

        bubble.quaternion.copy(
          camera.quaternion,
        );
      }

      /*
       * --------------------------------------------------
       * CAMERA MOVEMENT
       * --------------------------------------------------
       */

      camera.position.x +=
        (mouse.x * 1.8 -
          camera.position.x) *
        0.045;

      camera.position.y +=
        (-mouse.y * 1.3 -
          camera.position.y) *
        0.045;

      camera.lookAt(
        0,
        0,
        0,
      );

      renderer.render(
        scene,
        camera,
      );
    }

    animate();

    /*
     * --------------------------------------------------
     * RESIZE
     * --------------------------------------------------
     */

    function handleResize() {
      width =
        mount.clientWidth;

      height =
        mount.clientHeight;

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height,
      );
    }

    window.addEventListener(
      "resize",
      handleResize,
    );

    /*
     * --------------------------------------------------
     * CLEANUP
     * --------------------------------------------------
     */

    return () => {
      cancelAnimationFrame(
        frameId,
      );

      if (navigateTimer) {
        clearTimeout(
          navigateTimer,
        );
      }

      window.removeEventListener(
        "resize",
        handleResize,
      );

      window.removeEventListener(
        "pointerup",
        pointerUpHandler,
      );

      window.removeEventListener(
        "pointercancel",
        pointerUpHandler,
      );

      mount.removeEventListener(
        "pointermove",
        pointerMove,
      );

      mount.removeEventListener(
        "pointerenter",
        pointerEnter,
      );

      mount.removeEventListener(
        "pointerleave",
        pointerLeave,
      );

      mount.removeEventListener(
        "pointerdown",
        pointerDownHandler,
      );

      /*
       * Dispose everything.
       */

      bubbles.forEach(
        (bubble) => {
          bubble.traverse(
            (child) => {
              if (!child.isMesh) {
                return;
              }

              if (child.geometry) {
                child.geometry.dispose();
              }

              if (child.material) {
                const materials =
                  Array.isArray(
                    child.material,
                  )
                    ? child.material
                    : [child.material];

                materials.forEach(
                  (material) => {
                    if (
                      material.map
                    ) {
                      material.map.dispose();
                    }

                    material.dispose();
                  },
                );
              }
            },
          );

          scene.remove(
            bubble,
          );
        },
      );

      renderer.dispose();

      if (
        mount.contains(
          renderer.domElement,
        )
      ) {
        mount.removeChild(
          renderer.domElement,
        );
      }
    };
  }, [router]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100vh",

 

        overflow: "hidden",

        cursor: "grab",

        touchAction: "none",

        userSelect: "none",
      }}
    />
  );
}
