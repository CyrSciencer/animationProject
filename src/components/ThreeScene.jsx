import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "./ThreeScene.module.css"; // Import the CSS module

const ThreeScene = () => {
  // --- Refs --- //
  const mountRef = useRef(null);
  const modelRef = useRef();
  const mixerRef = useRef();
  const openingActionRef = useRef();
  const closingActionRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const clockRef = useRef(new THREE.Clock());
  const animationFrameIdRef = useRef();

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // --- 1. Core Three.js Setup --- //
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    // --- Renderer Setup (Modified for Transparency) ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // <<< Add alpha: true for transparency
    });
    renderer.setClearColor(0x000000, 0); // <<< Set clear color with 0 alpha
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.physicallyCorrectLights = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    rendererRef.current = renderer;

    // --- 2. Lighting Setup --- //
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- 3. Model & Animation Loading --- //
    const loader = new GLTFLoader();
    loader.load(
      "/models/door.glb",
      (gltf) => {
        console.log("GLTF loaded successfully:", gltf);
        modelRef.current = gltf.scene;
        scene.add(modelRef.current);

        // --- ADDED: Adjust Camera to Fit Model --- //
        const box = new THREE.Box3().setFromObject(modelRef.current);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Calculate the maximum dimension of the model
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180); // FOV in radians
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

        // Add a slight buffer/padding
        cameraZ *= 1.5; // Adjust multiplier for more/less padding

        // Position camera looking at the center
        camera.position.set(center.x, center.y, center.z + cameraZ);
        camera.lookAt(center);
        console.log("Camera adjusted to fit model:", {
          center,
          size,
          cameraPosition: camera.position,
        });
        // --- END: Adjust Camera --- //

        if (gltf.animations && gltf.animations.length > 0) {
          console.log("Animations found:", gltf.animations);
          mixerRef.current = new THREE.AnimationMixer(modelRef.current);

          const openingClip = THREE.AnimationClip.findByName(
            gltf.animations,
            "opening"
          );
          const closingClip = THREE.AnimationClip.findByName(
            gltf.animations,
            "closing"
          );

          if (openingClip) {
            openingActionRef.current = mixerRef.current.clipAction(openingClip);
            console.log(`Opening action created: ${openingClip.name}`);
            openingActionRef.current.loop = THREE.LoopOnce;
            // Optional: Play opening animation once on load?
            // openingActionRef.current.play();
          } else {
            console.warn("Could not find animation named 'opening'!");
          }

          if (closingClip) {
            closingActionRef.current = mixerRef.current.clipAction(closingClip);
            console.log(`Closing action created: ${closingClip.name}`);
            closingActionRef.current.loop = THREE.LoopOnce;
          } else {
            console.warn("Could not find animation named 'closing'!");
          }
        } else {
          console.log("No animations found in the model.");
        }
      },
      (xhr) => {
        console.log(`${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`);
      },
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );

    // --- 5. Animation Loop --- //
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    };

    // --- 6. Resize Handling --- //
    const handleResize = () => {
      if (currentMount && cameraRef.current && rendererRef.current) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();

        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
      }
    };

    // --- 7. Initial Setup & Event Listeners --- //
    currentMount.appendChild(renderer.domElement);
    const canvasElement = renderer.domElement;
    window.addEventListener("resize", handleResize);
    animate(); // Start the animation loop (mixer will update, but no actions playing by default)

    // --- 8. Cleanup Function --- //
    return () => {
      console.log("Cleanup: Starting");

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        console.log("Cleanup: Animation frame cancelled");
      }

      window.removeEventListener("resize", handleResize);

      if (modelRef.current) {
        if (scene) scene.remove(modelRef.current);
        modelRef.current.traverse((object) => {
          if (object.isMesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material) => {
                  if (material.map) material.map.dispose();
                  material.dispose();
                });
              } else {
                if (object.material.map) object.material.map.dispose();
                object.material.dispose();
              }
            }
          }
        });
        console.log("Cleanup: Model disposed");
      }
      modelRef.current = null;
      mixerRef.current = null;
      openingActionRef.current = null;
      closingActionRef.current = null;

      if (ambientLight) ambientLight.dispose();
      if (directionalLight) directionalLight.dispose();
      console.log("Cleanup: Lights disposed");

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (currentMount && rendererRef.current.domElement) {
          try {
            currentMount.removeChild(rendererRef.current.domElement);
          } catch (error) {
            console.error(
              "Cleanup Error removing renderer DOM element:",
              error
            );
          }
        }
        console.log("Cleanup: Renderer disposed");
      }
      rendererRef.current = null;
      cameraRef.current = null;

      console.log("Cleanup: Complete");
    };
  }, []);

  return <div ref={mountRef} className={styles.container} />;
};

export default ThreeScene;
