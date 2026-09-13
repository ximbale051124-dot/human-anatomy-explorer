import React, { useMemo } from 'react';
import * as THREE from 'three';
import { MESH_CONFIGS } from '../../data/meshConfigs';
import { useAnatomy } from '../../context/AnatomyContext';
import type { MeshConfig } from '../../types/anatomy';

// -----------------------------------------------------------------------
// PLACEHOLDER 3D MODEL
// -----------------------------------------------------------------------
// This component renders a simple humanoid figure built from primitive
// Three.js geometries (see src/data/meshConfigs.ts for placement). It is a
// stand-in until a real anatomical GLB/GLTF model is available.
//
// >>> HOW TO REPLACE WITH A REAL GLB/GLTF MODEL <<<
// 1. Place your .glb/.gltf file in `public/models/` (create the folder),
//    e.g. `public/models/human-body.glb`.
// 2. In this file, replace the primitive rendering below with something like:
//
//      import { useGLTF } from '@react-three/drei';
//
//      export function BodyModel() {
//        const { scene } = useGLTF('/models/human-body.glb');
//        const { selectedStructureId, selectStructure, systemVisibility, layerVisibility } = useAnatomy();
//
//        useEffect(() => {
//          scene.traverse((obj) => {
//            if (!(obj instanceof THREE.Mesh)) return;
//            // Map each mesh name in the GLB to a structure id from
//            // src/data/structures.ts. Keep a lookup table (meshName -> { structureId, system, layer })
//            // similar to MESH_CONFIGS, then set obj.visible and obj.material
//            // color/emissive based on the current context state, the same
//            // way computeVisible()/computeColor() do below.
//          });
//        }, [scene, systemVisibility, layerVisibility, selectedStructureId]);
//
//        return <primitive object={scene} />;
//      }
//
// 3. Delete src/data/meshConfigs.ts once every mesh in the GLB is mapped.
// -----------------------------------------------------------------------

const HIGHLIGHT_COLOR = new THREE.Color('#FFD23F');

function Primitive({ config }: { config: MeshConfig }) {
  const { selectedStructureId, selectStructure, systemVisibility, layerVisibility } = useAnatomy();

  const visible =
    layerVisibility[config.layer] &&
    (config.system === 'integumentary' ? true : systemVisibility[config.system]);

  const isSelected = selectedStructureId === config.structureId;

  const geometryArgs = config.args as [number, number, number, number];

  const geometry = useMemo(() => {
    switch (config.geometry) {
      case 'box':
        return <boxGeometry args={config.args as [number, number, number]} />;
      case 'sphere':
        return <sphereGeometry args={[config.args[0], 24, 16]} />;
      case 'cylinder':
        return <cylinderGeometry args={[config.args[0], config.args[1], config.args[2], config.args[3] ?? 12]} />;
      case 'capsule':
        return <capsuleGeometry args={[config.args[0], config.args[1], config.args[2] ?? 4, config.args[3] ?? 8]} />;
      case 'torus':
        return <torusGeometry args={[config.args[0], config.args[1], config.args[2] ?? 8, config.args[3] ?? 16]} />;
      case 'cone':
        return <coneGeometry args={[config.args[0], config.args[1], config.args[2] ?? 12]} />;
      default:
        return <boxGeometry args={geometryArgs} />;
    }
  }, [config.geometry, config.args, geometryArgs]);

  if (!visible) return null;

  return (
    <mesh
      position={config.position}
      rotation={config.rotation ?? [0, 0, 0]}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        selectStructure(config.structureId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      userData={{ structureId: config.structureId }}
    >
      {geometry}
      <meshStandardMaterial
        color={isSelected ? HIGHLIGHT_COLOR : config.color}
        emissive={isSelected ? HIGHLIGHT_COLOR : new THREE.Color('#000000')}
        emissiveIntensity={isSelected ? 0.5 : 0}
        roughness={0.55}
        metalness={0.05}
      />
    </mesh>
  );
}

export function BodyModel() {
  return (
    <group>
      {MESH_CONFIGS.map((config) => (
        <Primitive key={config.meshId} config={config} />
      ))}
    </group>
  );
}
