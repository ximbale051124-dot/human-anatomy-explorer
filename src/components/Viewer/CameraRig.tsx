import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAnatomy } from '../../context/AnatomyContext';
import { MESH_CONFIGS } from '../../data/meshConfigs';
import type { ViewPreset } from '../../types/anatomy';

const TARGET = new THREE.Vector3(0, 1.3, 0);
const DISTANCE = 2.6;

const PRESET_POSITIONS: Record<ViewPreset, THREE.Vector3> = {
  front: new THREE.Vector3(0, 1.3, DISTANCE),
  back: new THREE.Vector3(0, 1.3, -DISTANCE),
  left: new THREE.Vector3(-DISTANCE, 1.3, 0),
  right: new THREE.Vector3(DISTANCE, 1.3, 0),
  reset: new THREE.Vector3(0.2, 1.5, DISTANCE),
};

export function CameraRig() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const { viewCommand, clearViewCommand } = useAnatomy();

  const animTarget = useRef<THREE.Vector3 | null>(null);
  const lookTarget = useRef<THREE.Vector3>(TARGET.clone());

  React.useEffect(() => {
    if (!viewCommand) return;

    if (viewCommand.type === 'preset') {
      animTarget.current = PRESET_POSITIONS[viewCommand.preset].clone();
      lookTarget.current = TARGET.clone();
    } else if (viewCommand.type === 'focus') {
      const [x, y, z] = viewCommand.position;
      const focusPoint = new THREE.Vector3(x, y, z);
      const dir = new THREE.Vector3(camera.position.x, 0, camera.position.z).normalize();
      animTarget.current = focusPoint.clone().add(dir.multiplyScalar(0.9)).setY(y + 0.15);
      lookTarget.current = focusPoint;
    }
    clearViewCommand();
  }, [viewCommand, clearViewCommand, camera]);

  useFrame(() => {
    if (animTarget.current) {
      camera.position.lerp(animTarget.current, 0.08);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookTarget.current, 0.08);
        controlsRef.current.update();
      }
      if (camera.position.distanceTo(animTarget.current) < 0.01) {
        animTarget.current = null;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 1.3, 0]}
      enablePan
      enableZoom
      enableRotate
      minDistance={0.6}
      maxDistance={6}
      maxPolarAngle={Math.PI * 0.85}
    />
  );
}

// Utility used by the search feature to find a mesh's world position for a
// given structure id, so the camera can focus on it.
export function findStructurePosition(structureId: string): [number, number, number] | null {
  const match = MESH_CONFIGS.find((m) => m.structureId === structureId);
  return match ? match.position : null;
}
