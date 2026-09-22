import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { BodyModel } from './BodyModel';
import { CameraRig } from './CameraRig';
import { useAnatomy } from '../../context/AnatomyContext';

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial color="#4FB0A5" wireframe />
    </mesh>
  );
}

export function Scene3D() {
  const { selectAnatomyId } = useAnatomy();

  return (
    <Canvas
      shadows
      camera={{ position: [0.2, 1.5, 2.6], fov: 40 }}
      onPointerMissed={() => selectAnatomyId(null)}
    >
      <color attach="background" args={['#EEF3F4']} />
      <hemisphereLight args={['#FFFFFF', '#B8C4C8', 0.6]} />
      <directionalLight
        position={[2, 4, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-2, 2, -3]} intensity={0.4} />

      <Suspense fallback={<Loader />}>
        <BodyModel />
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={3} blur={2.4} far={1} />

      <CameraRig />
    </Canvas>
  );
}
