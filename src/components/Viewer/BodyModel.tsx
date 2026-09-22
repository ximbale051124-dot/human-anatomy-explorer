import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useLoader, type ThreeEvent } from '@react-three/fiber';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import {
  fallbackStructureForSystem,
  structureIdForMesh,
  systemForMesh,
  Z_ANATOMY_ASSETS,
  type ZAnatomyAsset,
} from '../../data/zAnatomyModel';
import { useAnatomy } from '../../context/AnatomyContext';
const HIGHLIGHT_COLOR = new THREE.Color('#FFD23F');
const INTEGUMENTARY_COLOR = new THREE.Color('#E9B28C');
const SYSTEM_COLORS: Record<string, THREE.Color> = {
  skeletal: new THREE.Color('#B8C7D9'),
  muscular: new THREE.Color('#BF3E4A'),
  cardiovascular: new THREE.Color('#C92C36'),
  respiratory: new THREE.Color('#4D9DE0'),
  digestive: new THREE.Color('#DE8D35'),
  urinary: new THREE.Color('#6D72C3'),
  reproductive: new THREE.Color('#C45A9A'),
  endocrine: new THREE.Color('#E5B52D'),
  lymphatic: new THREE.Color('#39A96B'),
};

type RenderableAnatomyObject = THREE.Mesh | THREE.Line;

function isRenderableAnatomyObject(object: THREE.Object3D): object is RenderableAnatomyObject {
  return object instanceof THREE.Mesh || object instanceof THREE.Line;
}

function materials(object: RenderableAnatomyObject): THREE.Material[] {
  return Array.isArray(object.material) ? object.material : [object.material];
}

function ZAnatomyAssetModel({ asset }: { asset: ZAnatomyAsset }) {
  const source = useLoader(FBXLoader, asset.url);
  const model = useMemo(() => {
    const clone = source.clone(true);
    // FBX meshes often share a neutral material. Give each mesh its own copy
    // so a selected vessel does not recolour every vessel in the atlas.
    clone.traverse((object) => {
      if (!isRenderableAnatomyObject(object)) return;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
    });
    return clone;
  }, [source]);
  const { selectedStructureId, selectStructure, systemVisibility, layerVisibility } = useAnatomy();

  useEffect(() => {
    model.traverse((object) => {
      if (!isRenderableAnatomyObject(object)) return;
      const system = systemForMesh(asset, object.name);
      const structureId = structureIdForMesh(object.name);
      object.userData.structureId = structureId;
      object.visible = layerVisibility[asset.layer] &&
        (system === 'integumentary' || systemVisibility[system]);
      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
      }

      materials(object).forEach((material) => {
        const standard = material as THREE.MeshStandardMaterial;
        const baseColor = system === 'integumentary'
          ? INTEGUMENTARY_COLOR
          : SYSTEM_COLORS[system];
        // Z-Anatomy FBX files carry per-vertex authoring colours. Disable
        // them so every system consistently uses the learner-facing palette.
        if ('vertexColors' in standard) standard.vertexColors = false;
        if (standard.color) standard.color.copy(structureId === selectedStructureId ? HIGHLIGHT_COLOR : baseColor);
        if ('emissive' in standard) {
          standard.emissive.set(structureId === selectedStructureId ? HIGHLIGHT_COLOR : '#000000');
          standard.emissiveIntensity = structureId === selectedStructureId ? 0.65 : 0;
        }
        if (asset.layer === 'skin') {
          material.transparent = true;
          // The atlas splits the surface into hundreds of overlapping regions.
          // A low opacity keeps the skin identifiable without turning deeper
          // systems into one muddy colour where those regions overlap.
          material.opacity = 0.08;
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
        const structureId = structureIdForMesh(mesh.name) ??
          fallbackStructureForSystem(systemForMesh(asset, mesh.name));
        selectStructure(structureId);
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
