import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CYUT_BUILDINGS } from '../utils/demoData';
import { CampusBuilding } from '../types';
import { ArrowLeft, Compass, Layers, RotateCcw } from 'lucide-react';

interface Campus3DMapProps {
  onSelectBuilding?: (building: CampusBuilding) => void;
}

// Helper to recursively remove CSS2DObject DOM nodes & dispose geometries/materials
function clearThreeGroup(group: THREE.Group) {
  const cssObjects: CSS2DObject[] = [];
  group.traverse((child) => {
    if (child instanceof CSS2DObject) {
      cssObjects.push(child);
    }
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material?.dispose();
      }
    }
  });
  cssObjects.forEach((cssObj) => {
    cssObj.element.remove();
    cssObj.removeFromParent();
  });
  group.clear();
}

export const Campus3DMap: React.FC<Campus3DMapProps> = ({ onSelectBuilding }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [viewMode, setViewMode] = useState<'campus' | 'cross-section'>('campus');

  // Keep mutable refs for Three.js lifecycle without re-mounting WebGL
  const viewModeRef = useRef<'campus' | 'cross-section'>('campus');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const campusGroupRef = useRef<THREE.Group | null>(null);
  const crossSectionGroupRef = useRef<THREE.Group | null>(null);

  // Camera transition targets
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 38, 14));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, -0.5));
  const transitionActiveRef = useRef<boolean>(false);

  // Compute responsive 68-72 degree tilted top-down overview camera
  const getOverviewCameraPose = (width: number, height: number) => {
    const aspect = width / Math.max(1, height);
    // Widen distance on narrow portrait screens so all 10 spaced buildings fit comfortably
    const distScale = aspect < 1 ? Math.min(1.85, 1.18 / Math.max(0.45, aspect)) : 1.0;
    const y = 36 * distScale;
    const z = 13.5 * distScale; // atan2(36, 13.5) ≈ 69.4 degrees tilt!
    return {
      pos: new THREE.Vector3(0, y, z),
      lookAt: new THREE.Vector3(0, 0, -0.5),
    };
  };

  // Build Floor-by-Floor Cross-section 3D model with embedded CSS2D labels
  const buildCrossSectionScene = (bldg: CampusBuilding) => {
    if (!crossSectionGroupRef.current) return;
    const group = crossSectionGroupRef.current;
    clearThreeGroup(group);

    const bldgColor = new THREE.Color(bldg.color);
    const width = 6.2;
    const depth = 3.8;
    const slabHeight = 0.16;
    const floorClearance = 1.15;
    const floorStep = 2.05; // Generous vertical separation for 3D clarity

    bldg.floorsData.forEach((floor, idx) => {
      const floorGroup = new THREE.Group();
      const floorY = idx * floorStep;
      floorGroup.position.y = floorY;

      // 1. Floor Slab
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.35,
      });
      const slab = new THREE.Mesh(new THREE.BoxGeometry(width, slabHeight, depth), slabMat);
      slab.receiveShadow = true;
      slab.castShadow = true;
      floorGroup.add(slab);

      // Glowing Perimeter Trim on Slab
      const trimMat = new THREE.MeshBasicMaterial({
        color: bldgColor,
        transparent: true,
        opacity: 0.85,
      });
      const trimEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 0.02, slabHeight + 0.01, depth + 0.02)),
        new THREE.LineBasicMaterial({ color: bldgColor })
      );
      floorGroup.add(trimEdges);

      // Subtle Corner Structural Columns (open cutaway architecture so interior rooms are unobstructed)
      const colGeo = new THREE.BoxGeometry(0.14, floorClearance, 0.14);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.5 });
      const cornerOffsets = [
        [-width / 2 + 0.08, -depth / 2 + 0.08],
        [width / 2 - 0.08, -depth / 2 + 0.08],
        [-width / 2 + 0.08, depth / 2 - 0.08],
        [width / 2 - 0.08, depth / 2 - 0.08],
      ];
      cornerOffsets.forEach(([cx, cz]) => {
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(cx, slabHeight / 2 + floorClearance / 2, cz);
        floorGroup.add(col);
      });

      // Translucent Cutaway Glass Back & Floor Accent
      const glassBack = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.2, floorClearance, 0.06),
        new THREE.MeshStandardMaterial({
          color: 0x60a5fa,
          transparent: true,
          opacity: 0.16,
          roughness: 0.1,
          metalness: 0.8,
        })
      );
      glassBack.position.set(0, slabHeight / 2 + floorClearance / 2, -depth / 2 + 0.08);
      floorGroup.add(glassBack);

      // Floor Label Badge attached directly to the left edge of the 3D slab
      const floorEl = document.createElement('div');
      floorEl.className =
        'px-2 py-0.5 rounded-md bg-[#E50914] text-white font-mono font-extrabold text-[11px] shadow-lg border border-red-400/50 select-none pointer-events-none';
      floorEl.textContent = floor.floorLabel;
      const floorLabelObj = new CSS2DObject(floorEl);
      floorLabelObj.position.set(-width / 2 - 0.45, slabHeight / 2 + 0.3, depth / 2);
      floorGroup.add(floorLabelObj);

      // 2. Interior Classroom / Department Room Volumes + Direct 3D Spatial Labels
      const rooms = floor.rooms;
      const roomCount = rooms.length;
      const usableWidth = width - 0.8;
      const slotW = usableWidth / Math.max(1, roomCount);

      rooms.forEach((room, rIdx) => {
        const blockW = Math.min(2.3, slotW - 0.35);
        const blockD = depth * 0.52;
        const blockH = floorClearance * 0.68;

        const roomPosX = -usableWidth / 2 + (rIdx + 0.5) * slotW;
        // Alternate Z and slight vertical stagger when multiple rooms exist so floating labels don't collide on mobile
        const roomPosZ = roomCount > 1 ? (rIdx % 2 === 0 ? 0.55 : -0.55) : 0;

        const roomMat = new THREE.MeshStandardMaterial({
          color: 0x283548,
          roughness: 0.45,
          metalness: 0.2,
        });
        const roomBlock = new THREE.Mesh(new THREE.BoxGeometry(blockW, blockH, blockD), roomMat);
        roomBlock.position.set(roomPosX, slabHeight / 2 + blockH / 2 + 0.02, roomPosZ);
        roomBlock.castShadow = true;
        roomBlock.receiveShadow = true;
        floorGroup.add(roomBlock);

        // Room Accent Wireframe
        const roomOutline = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(blockW + 0.01, blockH + 0.01, blockD + 0.01)),
          new THREE.LineBasicMaterial({ color: trimMat.color, transparent: true, opacity: 0.6 })
        );
        roomOutline.position.copy(roomBlock.position);
        floorGroup.add(roomOutline);

        // In-Building 3D Classroom/Space CSS2D Label (Room Code + Name only, ZERO occupancy status)
        const roomEl = document.createElement('div');
        roomEl.className =
          'px-2 py-1 rounded-lg bg-slate-950/92 text-slate-100 border border-slate-600/80 shadow-xl backdrop-blur-sm select-none pointer-events-none text-center max-w-[116px] sm:max-w-[148px]';
        roomEl.innerHTML = `
          <div style="color: ${bldg.color}; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800; line-height: 1.15;">${room.roomCode}</div>
          <div style="font-size: 10px; font-weight: 600; color: #f1f5f9; line-height: 1.25; margin-top: 2px; white-space: normal;">${room.name}</div>
        `;
        const roomLabelObj = new CSS2DObject(roomEl);
        roomLabelObj.position.set(roomPosX, slabHeight / 2 + blockH + (rIdx % 2 === 0 ? 0.2 : 0.36), roomPosZ);
        floorGroup.add(roomLabelObj);
      });

      group.add(floorGroup);
    });
  };

  const enterCrossSectionView = (bldg: CampusBuilding) => {
    viewModeRef.current = 'cross-section';
    setViewMode('cross-section');
    setSelectedBuilding(bldg);
    if (onSelectBuilding) onSelectBuilding(bldg);

    if (campusGroupRef.current) {
      campusGroupRef.current.visible = false;
      // Hide campus building CSS2D tags while in cross-section mode
      campusGroupRef.current.traverse((obj) => {
        if (obj instanceof CSS2DObject) {
          obj.element.style.display = 'none';
        }
      });
    }
    if (crossSectionGroupRef.current) {
      crossSectionGroupRef.current.visible = true;
      buildCrossSectionScene(bldg);
    }

    // Center camera around exploded building
    const totalHeight = Math.max(1, bldg.floorsData.length - 1) * 2.05;
    const midY = totalHeight * 0.5 + 0.5;
    const aspect = containerRef.current
      ? containerRef.current.clientWidth / Math.max(1, containerRef.current.clientHeight)
      : 1.2;
    const zoomDist = aspect < 1 ? 15.5 : 12.5;

    targetLookAtRef.current.set(0, midY, 0);
    targetCamPosRef.current.set(zoomDist * 0.65, midY + 4.5, zoomDist * 0.85);
    transitionActiveRef.current = true;
  };

  const returnToCampusMap = () => {
    viewModeRef.current = 'campus';
    setViewMode('campus');
    setSelectedBuilding(null);

    if (crossSectionGroupRef.current) {
      clearThreeGroup(crossSectionGroupRef.current);
      crossSectionGroupRef.current.visible = false;
    }
    if (campusGroupRef.current) {
      campusGroupRef.current.visible = true;
      campusGroupRef.current.traverse((obj) => {
        if (obj instanceof CSS2DObject) {
          obj.element.style.display = 'block';
        }
      });
    }

    if (containerRef.current) {
      const { pos, lookAt } = getOverviewCameraPose(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      targetCamPosRef.current.copy(pos);
      targetLookAtRef.current.copy(lookAt);
      transitionActiveRef.current = true;
    }
  };

  const resetCurrentView = () => {
    if (viewModeRef.current === 'cross-section' && selectedBuilding) {
      const totalHeight = Math.max(1, selectedBuilding.floorsData.length - 1) * 2.05;
      const midY = totalHeight * 0.5 + 0.5;
      const aspect = containerRef.current
        ? containerRef.current.clientWidth / Math.max(1, containerRef.current.clientHeight)
        : 1.2;
      const zoomDist = aspect < 1 ? 15.5 : 12.5;

      targetLookAtRef.current.set(0, midY, 0);
      targetCamPosRef.current.set(zoomDist * 0.65, midY + 4.5, zoomDist * 0.85);
      transitionActiveRef.current = true;
    } else if (containerRef.current) {
      const { pos, lookAt } = getOverviewCameraPose(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      targetCamPosRef.current.copy(pos);
      targetLookAtRef.current.copy(lookAt);
      transitionActiveRef.current = true;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect Software WebGL for safe performance scaling
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f17);
    scene.fog = new THREE.FogExp2(0x0b0f17, 0.011);
    sceneRef.current = scene;

    // 2. Camera (Tilted High-Angle Top-Down ~69°)
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 200);
    const initialPose = getOverviewCameraPose(width, height);
    camera.position.copy(initialPose.pos);
    targetCamPosRef.current.copy(initialPose.pos);
    targetLookAtRef.current.copy(initialPose.lookAt);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. CSS2D Label Renderer (for 3D floating building badges & in-building classroom labels)
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.left = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(labelRenderer.domElement);

    // 5. OrbitControls (Touch pinch zoom + 1-finger rotate + smooth damping)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(initialPose.lookAt);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.47; // Keep above ground
    controls.minDistance = 5;
    controls.maxDistance = 85;
    controls.update();
    controlsRef.current = controls;

    const handleControlsStart = () => {
      transitionActiveRef.current = false;
    };
    controls.addEventListener('start', handleControlsStart);

    // 6. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.9);
    hemiLight.position.set(0, 35, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.55);
    dirLight.position.set(18, 32, 16);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -22;
    dirLight.shadow.camera.right = 22;
    dirLight.shadow.camera.top = 22;
    dirLight.shadow.camera.bottom = -22;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xe50914, 0.55);
    rimLight.position.set(-16, 12, -16);
    scene.add(rimLight);

    // 7. Spacious Campus Ground, Roads & Central Plazas (NO parking, dorms, or fields)
    const campusGroup = new THREE.Group();
    campusGroupRef.current = campusGroup;

    // Ground Terrain
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0d1320,
      roughness: 0.92,
      metalness: 0.08,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    campusGroup.add(ground);

    // Subtle Grid Lines on Campus Ground for spatial orientation
    const gridHelper = new THREE.GridHelper(52, 26, 0x1e293b, 0x131c2e);
    gridHelper.position.y = 0.01;
    campusGroup.add(gridHelper);

    // Clean Campus Connecting Roads (wide spacing between the 10 buildings)
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1a2335,
      roughness: 0.75,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const roads = [
      // Horizontal North Avenue (south of T1, D, T2)
      { x: 0, z: -3.2, w: 29, d: 1.6 },
      // Horizontal South Avenue (north of A)
      { x: 0, z: 4.0, w: 26, d: 1.4 },
      // Vertical West Avenue (between V/S and T1/E)
      { x: -8.5, z: -2.0, w: 1.6, d: 16 },
      // Vertical Central-East Avenue (between D/M and T2/L/G)
      { x: 8.2, z: -0.5, w: 1.6, d: 18 },
      // Central North-South Promenade (between T1/E and D/M)
      { x: 0, z: -1.5, w: 1.5, d: 12 },
    ];
    roads.forEach((r) => {
      const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.d), roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.position.set(r.x, 0.02, r.z);
      roadMesh.receiveShadow = true;
      campusGroup.add(roadMesh);
    });

    // 海豚廣場 (Dolphin Plaza between T1 & D)
    const dolphinPlaza = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 })
    );
    dolphinPlaza.rotation.x = -Math.PI / 2;
    dolphinPlaza.position.set(0, 0.03, -6.5);
    campusGroup.add(dolphinPlaza);

    // 紅磚廣場 (Red Brick Plaza north of A)
    const redBrickPlaza = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 })
    );
    redBrickPlaza.rotation.x = -Math.PI / 2;
    redBrickPlaza.position.set(0, 0.03, 1.8);
    campusGroup.add(redBrickPlaza);

    // 8. Build ONLY the 10 Specified CYUT Buildings (Spacious & Composite)
    CYUT_BUILDINGS.forEach((bldg) => {
      const bldgGroup = new THREE.Group();
      bldgGroup.name = bldg.id;
      bldgGroup.userData = { building: bldg };

      const bldgColor = new THREE.Color(bldg.color);
      const isRedBrick = ['D', 'A', 'E'].includes(bldg.code);
      const wallMat = new THREE.MeshStandardMaterial({
        color: isRedBrick ? 0x991b1b : 0x263348,
        roughness: 0.45,
        metalness: 0.2,
      });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        roughness: 0.15,
        metalness: 0.85,
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: bldgColor,
        emissive: bldgColor,
        emissiveIntensity: 0.25,
        roughness: 0.3,
      });

      const footprintW = bldg.code === 'S' ? 2.9 : 2.5;
      const footprintD = bldg.code === 'E' || bldg.code === 'L' ? 2.6 : 2.1;
      const bldgHeight = Math.max(2.0, bldg.floors * 0.46);

      // Part 1: Foundation Podium
      const podium = new THREE.Mesh(
        new THREE.BoxGeometry(footprintW + 0.35, 0.32, footprintD + 0.35),
        wallMat
      );
      podium.position.y = 0.16;
      podium.castShadow = true;
      podium.receiveShadow = true;
      bldgGroup.add(podium);

      // Part 2: Main Building Mass
      const mainBlock = new THREE.Mesh(
        new THREE.BoxGeometry(footprintW, bldgHeight, footprintD),
        wallMat
      );
      mainBlock.position.y = 0.32 + bldgHeight / 2;
      mainBlock.castShadow = true;
      mainBlock.receiveShadow = true;
      bldgGroup.add(mainBlock);

      // Part 3: Floor Window Ribbons
      for (let f = 1; f < bldg.floors; f++) {
        const ribbon = new THREE.Mesh(
          new THREE.BoxGeometry(footprintW + 0.05, 0.12, footprintD + 0.05),
          glassMat
        );
        ribbon.position.y = 0.32 + f * 0.46;
        bldgGroup.add(ribbon);
      }

      // Part 4: Roof Crown
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(footprintW * 0.78, 0.28, footprintD * 0.78),
        accentMat
      );
      crown.position.y = 0.32 + bldgHeight + 0.14;
      crown.castShadow = true;
      bldgGroup.add(crown);

      // Part 5: Ground Glow Ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(footprintW * 0.72, footprintW * 0.84, 32),
        new THREE.MeshBasicMaterial({
          color: bldgColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      bldgGroup.add(ring);

      // Part 6: Clickable CSS2D Floating Building Tag
      const badgeEl = document.createElement('button');
      badgeEl.type = 'button';
      badgeEl.className =
        'px-2 py-1 rounded-lg bg-slate-950/90 hover:bg-[#E50914] text-white border border-slate-700/80 shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer pointer-events-auto select-none whitespace-nowrap';
      badgeEl.innerHTML = `
        <span style="background:${bldg.color}; padding: 1px 5px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800; color: #fff;">${bldg.code}</span>
        <span style="font-size: 11px; font-weight: 700;">${bldg.name.replace(/\s*\([^)]*\)/, '')}</span>
      `;
      badgeEl.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (viewModeRef.current === 'campus') {
          enterCrossSectionView(bldg);
        }
      });

      const labelObj = new CSS2DObject(badgeEl);
      labelObj.position.set(0, 0.32 + bldgHeight + 0.85, 0);
      bldgGroup.add(labelObj);

      const [bx, by, bz] = bldg.coordinates;
      bldgGroup.position.set(bx, by, bz);
      campusGroup.add(bldgGroup);
    });

    scene.add(campusGroup);

    // 9. Cross-Section Container Group
    const crossSectionGroup = new THREE.Group();
    crossSectionGroup.visible = false;
    crossSectionGroupRef.current = crossSectionGroup;
    scene.add(crossSectionGroup);

    // 10. Tap / Click Raycasting (Distinguishes clean tap vs orbit drag)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (viewModeRef.current !== 'campus') {
        container.style.cursor = 'grab';
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(campusGroup.children, true);

      let found = false;
      for (const hit of intersects) {
        let p: THREE.Object3D | null = hit.object;
        while (p && p !== campusGroup) {
          if (p.userData?.building) {
            found = true;
            break;
          }
          p = p.parent;
        }
        if (found) break;
      }
      container.style.cursor = found ? 'pointer' : 'grab';
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (viewModeRef.current !== 'campus') return;
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 6) return; // Ignore drag-rotate gestures

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(campusGroup.children, true);

      for (const hit of intersects) {
        let p: THREE.Object3D | null = hit.object;
        while (p && p !== campusGroup) {
          if (p.userData?.building) {
            enterCrossSectionView(p.userData.building as CampusBuilding);
            return;
          }
          p = p.parent;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // 11. Render Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      if (transitionActiveRef.current) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPosRef.current.x, 4.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPosRef.current.y, 4.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPosRef.current.z, 4.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, targetLookAtRef.current.x, 4.8, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, targetLookAtRef.current.y, 4.8, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, targetLookAtRef.current.z, 4.8, delta);

        if (
          camera.position.distanceTo(targetCamPosRef.current) < 0.08 &&
          controls.target.distanceTo(targetLookAtRef.current) < 0.08
        ) {
          transitionActiveRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };

    animate();

    // 12. Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', handleControlsStart);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(frameId);
      clearThreeGroup(campusGroup);
      clearThreeGroup(crossSectionGroup);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="relative w-full h-[78vh] min-h-[540px] md:h-[760px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0B0F17] shadow-2xl touch-none">
      {/* Full-Bleed 3D WebGL + CSS2DRenderer Mount (90%+ unobstructed canvas) */}
      <div ref={containerRef} className="w-full h-full relative" />

      {/* Minimal Top Bar Only — Zero Sidebars, Zero Popup Cards, Zero Bottom Docks */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        {viewMode === 'cross-section' && selectedBuilding ? (
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={returnToCampusMap}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-red-600 rounded-xl shadow-lg shadow-red-950/60 active:scale-95 transition whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回全校地圖</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg">
              <Layers className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
              <span className="text-xs md:text-sm font-extrabold text-white truncate max-w-[180px] sm:max-w-xs">
                {selectedBuilding.code} {selectedBuilding.name.replace(/\s*\([^)]*\)/, '')}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-900/85 px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto">
            <Compass className="w-4 h-4 text-[#E50914] shrink-0" />
            <span className="text-xs font-bold text-white whitespace-nowrap">
              點選建築檢視 3D 樓層透視
            </span>
          </div>
        )}

        <button
          onClick={resetCurrentView}
          title="重置視角"
          className="pointer-events-auto flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-xl shadow-lg transition whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">重置視角</span>
        </button>
      </div>
    </div>
  );
};
