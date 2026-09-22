import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useLoader, type ThreeEvent } from '@react-three/fiber';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Z_ANATOMY_ASSETS, structureIdForMesh, systemForMesh, type ZAnatomyAsset } from '../../data/zAnatomyModel';
import { useAnatomy } from '../../context/AnatomyContext';
const HIGHLIGHT_COLOR = new THREE.Color('#FFD23F');

function materials(mesh: THREE.Mesh): THREE.Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function ZAnatomyAssetModel({ asset }: { asset: ZAnatomyAsset }) {
  const source = useLoader(FBXLoader, asset.url);
  const model = useMemo(() => source.clone(true), [source]);
  const { selectedStructureId, selectStructure, systemVisibility, layerVisibility } = useAnatomy();

  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const system = systemForMesh(asset, object.name);
      const structureId = structureIdForMesh(object.name);
      object.userData.structureId = structureId;
      object.visible = layerVisibility[asset.layer] &&
        (system === 'integumentary' || systemVisibility[system]);
      object.castShadow = false;
      object.receiveShadow = false;

      materials(object).forEach((material) => {
        const standard = material as THREE.MeshStandardMaterial;
        if ('emissive' in standard) {
          standard.emissive.set(structureId === selectedStructureId ? HIGHLIGHT_COLOR : '#000000');
          standard.emissiveIntensity = structureId === selectedStructureId ? 0.8 : 0;
        }
        if (asset.layer === 'skin') {
          material.transparent = true;
          material.opacity = 0.22;
          material.depthWrite = false;
        }
        material.needsUpdate = true;
      });
    });
  }, [asset, layerVisibility, model, selectedStructureId, systemVisibility]);

  return (
    <primitive
      object={model}
      scale={0.01}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const mesh = event.object as THREE.Mesh;
        const structureId = mesh.userData.structureId as string | null | undefined;
        if (structureId) selectStructure(structureId);
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    />
  );
}

export function BodyModel() {
  return (
    <group>
      {Z_ANATOMY_ASSETS.map((asset) => <ZAnatomyAssetModel key={asset.id} asset={asset} />)}
    </group>
  );
}
