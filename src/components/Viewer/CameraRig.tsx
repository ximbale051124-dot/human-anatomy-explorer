import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAnatomy } from '../../context/AnatomyContext';
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
  const { viewCommand, clearViewCommand, getAnatomyPosition } = useAnatomy();
  const cameraTarget = useRef<THREE.Vector3 | null>(null);
  const lookTarget = useRef(TARGET.clone());

  React.useEffect(() => {
    if (!viewCommand) return;
    if (viewCommand.type === 'preset') {
      cameraTarget.current = PRESET_POSITIONS[viewCommand.preset].clone();
      lookTarget.current = TARGET.clone();
    } else {
      const position = getAnatomyPosition(viewCommand.anatomyId);
      if (position) {
        const focus = new THREE.Vector3(...position);
        const direction = new THREE.Vector3(camera.position.x, 0, camera.position.z).normalize();
        cameraTarget.current = focus.clone().add(direction.multiplyScalar(0.9)).setY(focus.y + 0.15);
        lookTarget.current = focus;
      }
    }
    clearViewCommand();
  }, [camera, clearViewCommand, getAnatomyPosition, viewCommand]);

  useFrame(() => {
    if (!cameraTarget.current) return;
    camera.position.lerp(cameraTarget.current, 0.08);
    controlsRef.current?.target.lerp(lookTarget.current, 0.08);
    controlsRef.current?.update();
    if (camera.position.distanceTo(cameraTarget.current) < 0.01) cameraTarget.current = null;
  });

  return <OrbitControls ref={controlsRef} target={[0, 1.3, 0]} enablePan enableZoom enableRotate minDistance={0.6} maxDistance={6} maxPolarAngle={Math.PI * 0.85} />;
}
