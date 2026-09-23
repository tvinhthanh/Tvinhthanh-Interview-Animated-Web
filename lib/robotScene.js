// Loaded on demand (dynamic import) so three.js + GSAP stay out of the initial bundle.
//
// The canvas covers the viewport. The robot is placed in world space from the
// on-screen box of the current [data-robot-anchor] element, so it lines up with
// the layout at any viewport size. Between two anchors it "falls" to the next one.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MODEL_URL = "/models/friendly-robot.glb";
const TRAVEL_CLIP = "Free_Fall";
const CAMERA_DISTANCE = 10;
const CAMERA_FOV = 30;

// clip: animation while parked at the anchor
// turn: body yaw (radians) so the robot faces the related content
// fit: robot height relative to the anchor box height (feet on the box bottom)
const ANCHORS = {
  hero: { clip: "Look_Wave", turn: -0.35, fit: 1 },
  features: { clip: "Free_Fall", turn: 0.45, fit: 1 },
  about: { clip: "Sitting", turn: 0.5, fit: 0.8 },
  team: { clip: "Look_Wave", turn: 0, fit: 0.9 },
};

function disposeModel(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material) return;
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      material.dispose();
    });
  });
}

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

function setRobotState(state) {
  document.body.dataset.robot = state;
}

export function initRobotScene({ stage, canvas, prefersReducedMotion }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    setRobotState("error");
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_DISTANCE);
  camera.lookAt(0, 0, 0);
  const viewHeightWorld = 2 * CAMERA_DISTANCE * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
  keyLight.position.set(4, 6, 6);
  const rimLight = new THREE.DirectionalLight(0x8fdcff, 2.2);
  rimLight.position.set(-4, 3, -2);
  scene.add(keyLight, rimLight, new THREE.HemisphereLight(0xf8f5e8, 0x31343b, 2.5));

  // robotRoot: screen placement (position + scale), driven by GSAP quickTo.
  // pose: yaw toward content + pointer tracking + idle bob.
  const robotRoot = new THREE.Group();
  const pose = new THREE.Group();
  robotRoot.add(pose);
  scene.add(robotRoot);

  let model = null;
  let mixer = null;
  let activeAction = null;
  let desiredClip = ANCHORS.hero.clip;
  let disposed = false;
  const actions = new Map();
  const clock = new THREE.Clock();

  const playClip = (name, fadeDuration = 0.45) => {
    desiredClip = name;
    // Reduced motion: hold the first pose, never switch or play clips.
    if (prefersReducedMotion && activeAction) return;
    const nextAction = actions.get(name);
    if (!nextAction || nextAction === activeAction) return;
    nextAction.reset().fadeIn(fadeDuration).play();
    activeAction?.fadeOut(fadeDuration);
    activeAction = nextAction;
    if (prefersReducedMotion) mixer.update(0);
  };

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    MODEL_URL,
    (gltf) => {
      if (disposed) {
        disposeModel(gltf.scene);
        return;
      }

      model = gltf.scene;
      model.traverse((child) => {
        if (!child.isMesh) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (material?.map) material.map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        });
      });

      // Normalise to 1 world unit tall with the feet at the origin, so the
      // group scale equals the robot's height in world units.
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.scale.setScalar(1 / Math.max(size.y, 0.001));
      const fitted = new THREE.Box3().setFromObject(model);
      const center = fitted.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -fitted.min.y, -center.z);
      pose.add(model);

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        actions.set(clip.name, action);
      });

      // Upload textures/shaders before revealing so the fade-in doesn't hitch.
      renderer.compile(scene, camera);
      setRobotState("ready");
      const clip = desiredClip;
      desiredClip = null;
      playClip(clip, 0);
    },
    undefined,
    () => {
      if (!disposed) setRobotState("error");
    },
  );

  // --- Layout anchors -------------------------------------------------------
  const anchors = Array.from(document.querySelectorAll("[data-robot-anchor]"))
    .map((element) => ({ element, ...ANCHORS[element.dataset.robotAnchor] }))
    .filter((anchor) => anchor.clip);

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  const measureAnchor = (anchor) => {
    const rect = anchor.element.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      bottom: rect.bottom,
      height: rect.height * anchor.fit,
      turn: anchor.turn,
    };
  };

  // Where the robot should be this frame, in CSS pixels.
  const resolveTarget = () => {
    const boxes = anchors.map(measureAnchor).filter(Boolean);
    if (!boxes.length) return null;
    const focus = viewportHeight * 0.5;
    if (focus <= boxes[0].cy) return boxes[0];
    for (let i = 0; i < boxes.length - 1; i += 1) {
      const from = boxes[i];
      const to = boxes[i + 1];
      if (focus > to.cy) continue;
      // Stay parked on each anchor for the first/last 30% of the gap, travel in between.
      const t = smoothstep(0.3, 0.7, (focus - from.cy) / (to.cy - from.cy));
      return {
        cx: lerp(from.cx, to.cx, t),
        bottom: lerp(from.bottom, to.bottom, t),
        height: lerp(from.height, to.height, t),
        turn: lerp(from.turn, to.turn, t),
      };
    }
    return boxes[boxes.length - 1];
  };

  const duration = prefersReducedMotion ? 0.01 : 0.35;
  const moveX = gsap.quickTo(robotRoot.position, "x", { duration, ease: "power3.out" });
  const moveY = gsap.quickTo(robotRoot.position, "y", { duration, ease: "power3.out" });
  const moveScale = gsap.quickTo(robotRoot.scale, "x", {
    duration,
    ease: "power3.out",
    onUpdate: () => robotRoot.scale.setScalar(robotRoot.scale.x),
  });
  const turnTo = gsap.quickTo(pose.rotation, "y", { duration: 0.8, ease: "power2.out" });

  let placed = false;
  const placeRobot = () => {
    const target = resolveTarget();
    if (!target) return;
    const worldPerPx = viewHeightWorld / viewportHeight;
    const x = (target.cx - viewportWidth / 2) * worldPerPx;
    const y = (viewportHeight / 2 - target.bottom) * worldPerPx;
    const scale = target.height * worldPerPx;

    if (!placed) {
      // First frame: snap instead of flying in from the origin.
      gsap.set(robotRoot.position, { x, y });
      robotRoot.scale.setScalar(scale);
      placed = true;
    }
    moveX(x);
    moveY(y);
    moveScale(scale);
    turnTo(target.turn);
  };

  // --- Render loop ----------------------------------------------------------
  let targetPointerX = 0;
  let targetPointerY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let elapsed = 0;
  let animationFrame = 0;
  let wasOffScreen = false;

  const handlePointerMove = (event) => {
    targetPointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetPointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  const resizeRenderer = () => {
    viewportWidth = stage.clientWidth || window.innerWidth;
    viewportHeight = stage.clientHeight || window.innerHeight;
    renderer.setSize(viewportWidth, viewportHeight, false);
    camera.aspect = viewportWidth / Math.max(viewportHeight, 1);
    camera.updateProjectionMatrix();
  };
  const animate = () => {
    animationFrame = window.requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);

    placeRobot();
    // Skip GPU work once the robot (where GSAP has actually moved it, not where
    // it is heading) is fully off screen, e.g. after scrolling past the team.
    const worldPerPx = viewHeightWorld / viewportHeight;
    const bottomPx = viewportHeight / 2 - robotRoot.position.y / worldPerPx;
    const heightPx = robotRoot.scale.y / worldPerPx;
    const onScreen = bottomPx > -40 && bottomPx - heightPx < viewportHeight + 40;
    if (!model || (!onScreen && wasOffScreen)) return;
    wasOffScreen = !onScreen;

    elapsed += delta;
    if (!prefersReducedMotion) mixer?.update(delta);

    pointerX += (targetPointerX - pointerX) * 0.05;
    pointerY += (targetPointerY - pointerY) * 0.05;
    if (!prefersReducedMotion) {
      // Head/body follows the cursor on top of the section yaw.
      model.rotation.y = pointerX * 0.35;
      model.rotation.x = pointerY * 0.08;
      pose.position.y = Math.sin(elapsed * 1.5) * 0.012;
    }

    renderer.render(scene, camera);
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("resize", resizeRenderer);
  resizeRenderer();
  animate();

  // --- Scroll-driven clip changes (GSAP ScrollTrigger) ----------------------
  const animationContext = gsap.context(() => {
    if (!prefersReducedMotion) {
      gsap.from(".hero-copy > :not(h1)", { opacity: 0, y: 24, duration: 0.78, stagger: 0.1, ease: "power3.out" });
      gsap.utils.toArray("section").forEach((section) => {
        const animatedChildren = Array.from(section.querySelectorAll("h2, article, .accordion, .team-intro p, .split-copy > *, .cta > *"));
        if (!animatedChildren.length) return;
        gsap.from(animatedChildren, {
          scrollTrigger: { trigger: section, start: "top 78%" },
          opacity: 0,
          y: 34,
          duration: 0.72,
          stagger: 0.08,
          ease: "power3.out",
        });
      });
    }

    // Each section decides the clip: its own anchor's clip, the travel clip for
    // sections the robot only passes through, or the last anchor's clip after it.
    const sections = gsap.utils.toArray("main > section");
    const lastAnchorSection = anchors.length ? anchors[anchors.length - 1].element.closest("section") : null;
    const lastAnchorIndex = sections.indexOf(lastAnchorSection);
    sections.forEach((section, index) => {
      const anchorElement = section.querySelector("[data-robot-anchor]");
      const anchorClip = anchorElement && ANCHORS[anchorElement.dataset.robotAnchor]?.clip;
      const clip = anchorClip ?? (index > lastAnchorIndex ? ANCHORS[lastAnchorSection?.querySelector("[data-robot-anchor]")?.dataset.robotAnchor]?.clip : TRAVEL_CLIP);
      if (!clip) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) playClip(clip);
        },
      });
    });
  });

  return () => {
    disposed = true;
    animationContext.revert();
    gsap.killTweensOf([robotRoot.position, robotRoot.scale, pose.rotation]);
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("resize", resizeRenderer);
    if (model) disposeModel(model);
    mixer?.stopAllAction();
    renderer.dispose();
    delete document.body.dataset.robot;
  };
}
