import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { type ThreeEvent } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { ANATOMY_BY_ID } from '../../data/anatomy/records';
import { SYSTEM_MAP } from '../../data/systems';
import { ANATOMY_ATLAS_ASSETS, type AnatomyAtlasAsset } from '../../data/zAnatomyModel';
import { useAnatomy } from '../../context/AnatomyContext';
import type { AnatomyId } from '../../types/anatomy';

useGLTF.setDecoderPath('/draco/');

const HOVER_COLOR = new THREE.Color('#F4D35E');
const SELECTED_COLOR = new THREE.Color('#FFD23F');
const NO_RAYCAST = () => undefined;

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return object instanceof THREE.Mesh;
}

function anatomyIdFor(object: THREE.Object3D): AnatomyId | null {
  const anatomyId = object.userData.anatomyId;
  return typeof anatomyId === 'string' && ANATOMY_BY_ID.has(anatomyId) ? anatomyId : null;
}

function AtlasAsset({ asset, onHoverPosition }: { asset: AnatomyAtlasAsset; onHoverPosition: (position: [number, number, number] | null) => void }) {
  const source = useGLTF(asset.url, true);
  const model = useMemo(() => {
    const clone = source.scene.clone(true);
    clone.traverse((object: THREE.Object3D) => {
      if (!isMesh(object)) return;
      const anatomyId = anatomyIdFor(object);
      if (!anatomyId) return;
      const record = ANATOMY_BY_ID.get(anatomyId)!;
      const material = new THREE.MeshStandardMaterial({
        color: SYSTEM_MAP[record.system].color,
        roughness: 0.58,
        metalness: 0,
        side: THREE.DoubleSide,
      });
      object.userData.interactionMaterial = material;
      object.material = material;
    });
    return clone;
  }, [source.scene]);
  const {
    hoveredAnatomyId, setHoveredAnatomyId, selectedAnatomyId, selectAnatomyId,
    systemVisibility, layerVisibility, registerAnatomyPosition,
  } = useAnatomy();

  useEffect(() => {
    model.updateWorldMatrix(true, true);
    model.traverse((object: THREE.Object3D) => {
      if (!isMesh(object)) return;
      const anatomyId = anatomyIdFor(object);
      if (!anatomyId) {
        console.error('Interactive atlas mesh is missing a valid anatomyId.', object);
        object.visible = false;
        object.raycast = NO_RAYCAST;
        return;
      }
      const record = ANATOMY_BY_ID.get(anatomyId)!;
      if (record.sourceAsset !== asset.id) {
        throw new Error(`Atlas binding mismatch: ${anatomyId} belongs to ${record.sourceAsset}, not ${asset.id}.`);
      }
      const visible = systemVisibility[record.system] && layerVisibility[record.layer];
      object.visible = visible;
      object.raycast = visible ? THREE.Mesh.prototype.raycast : NO_RAYCAST;
      object.castShadow = false;
      object.receiveShadow = false;
      const position = new THREE.Vector3();
      object.getWorldPosition(position);
      registerAnatomyPosition(anatomyId, [position.x, position.y, position.z]);

      const material = object.userData.interactionMaterial as THREE.MeshStandardMaterial;
      const isSelected = selectedAnatomyId === anatomyId;
      const isHovered = hoveredAnatomyId === anatomyId;
      if (isSelected) material.color.copy(SELECTED_COLOR);
      else if (isHovered) material.color.copy(HOVER_COLOR);
      else material.color.set(SYSTEM_MAP[record.system].color);
      if (isSelected) material.emissive.copy(SELECTED_COLOR);
      else if (isHovered) material.emissive.copy(HOVER_COLOR);
      else material.emissive.set('#000000');
      material.emissiveIntensity = isSelected ? 0.62 : isHovered ? 0.28 : 0;
      if (record.layer === 'skin') {
        material.transparent = true;
        material.opacity = 0.08;
        material.depthWrite = false;
      }
      object.material = material;
    });
  }, [asset.id, hoveredAnatomyId, layerVisibility, model, registerAnatomyPosition, selectedAnatomyId, systemVisibility]);

  const selectFromEvent = (event: ThreeEvent<MouseEvent | PointerEvent>, select: boolean) => {
    event.stopPropagation();
    const anatomyId = anatomyIdFor(event.object);
    if (!anatomyId) {
      console.error('Pointer event received from a mesh without anatomyId.', event.object);
      return;
    }
    if (select) selectAnatomyId(anatomyId);
    else {
      setHoveredAnatomyId(anatomyId);
      const position = new THREE.Vector3();
      (event.object as THREE.Object3D).getWorldPosition(position);
      onHoverPosition([position.x, position.y, position.z]);
      document.body.style.cursor = 'pointer';
    }
  };

  return (
    <primitive
      object={model}
      onClick={(event: ThreeEvent<MouseEvent>) => selectFromEvent(event, true)}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => selectFromEvent(event, false)}
      onPointerOut={(event: ThreeEvent<PointerEvent>) => {
        const anatomyId = anatomyIdFor(event.object);
        if (anatomyId === hoveredAnatomyId) setHoveredAnatomyId(null);
        onHoverPosition(null);
        document.body.style.cursor = 'auto';
      }}
    />
  );
}

export function BodyModel() {
  const { hoveredAnatomyId } = useAnatomy();
  const [hoverPosition, setHoverPosition] = useState<[number, number, number] | null>(null);
  const hoveredRecord = hoveredAnatomyId ? ANATOMY_BY_ID.get(hoveredAnatomyId) : null;

  return (
    <group>
      {ANATOMY_ATLAS_ASSETS.map((asset) => <AtlasAsset key={asset.id} asset={asset} onHoverPosition={setHoverPosition} />)}
      {hoveredRecord && hoverPosition && (
        <Html position={hoverPosition} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
          <div className="anatomy-tooltip">{hoveredRecord.displayName}</div>
        </Html>
      )}
    </group>
  );
}
