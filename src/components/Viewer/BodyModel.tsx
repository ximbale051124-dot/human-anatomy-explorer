import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  atlasNameForMesh,
  structureIdForMesh,
  systemForMesh,
  Z_ANATOMY_ASSETS,
  type ZAnatomyAsset,
} from '../../data/zAnatomyModel';
import { useAnatomy } from '../../context/AnatomyContext';
const HIGHLIGHT_COLOR = new THREE.Color('#FFD23F');
const HOVER_COLOR = new THREE.Color('#F4D35E');
useGLTF.setDecoderPath('/draco/');
const INTEGUMENTARY_COLOR = new THREE.Color('#E9B28C');
const SYSTEM_COLORS: Record<string, THREE.Color> = {
  skeletal: new THREE.Color('#B8C7D9'),
  joints: new THREE.Color('#63A89A'),
  muscular: new THREE.Color('#BF3E4A'),
  cardiovascular: new THREE.Color('#C92C36'),
  respiratory: new THREE.Color('#4D9DE0'),
  digestive: new THREE.Color('#DE8D35'),
  urinary: new THREE.Color('#6D72C3'),
  reproductive: new THREE.Color('#C45A9A'),
  endocrine: new THREE.Color('#E5B52D'),
  lymphatic: new THREE.Color('#39A96B'),
};

type RenderableAnatomyObject = THREE.Mesh;

function isRenderableAnatomyObject(object: THREE.Object3D): object is RenderableAnatomyObject {
  return object instanceof THREE.Mesh;
}

// Each Z-Anatomy collection has a decorative mesh bearing its collection
// title. It is not anatomy and was the source of the floating system labels.
const ATLAS_LEGEND_MESH = /^(skeletal system|muscular system|cardiovascular system|lymphoid organs|visceral systems|regions of human body)(\.g)?$/i;

function materials(object: RenderableAnatomyObject): THREE.Material[] {
  return Array.isArray(object.material) ? object.material : [object.material];
}

function meshKey(asset: ZAnatomyAsset, meshName: string) {
  return `${asset.id}:${meshName}`;
}

function variedSystemColor(base: THREE.Color, meshName: string): THREE.Color {
  // Preserve the model's anatomical segmentation even when a system has one
  // teaching colour: a deterministic small lightness variation separates
  // neighbouring muscles, bones, and organs without changing system identity.
  let hash = 0;
  for (let index = 0; index < meshName.length; index += 1) hash = (hash * 31 + meshName.charCodeAt(index)) | 0;
  const color = base.clone();
  color.offsetHSL(0, 0, ((hash % 9) - 4) * 0.018);
  return color;
}

function ZAnatomyAssetModel({
  asset,
  hoveredMeshKey,
  setHoveredMeshKey,
}: {
  asset: ZAnatomyAsset;
  hoveredMeshKey: string | null;
  setHoveredMeshKey: (key: string | null) => void;
}) {
  const source = useGLTF(asset.url, true);
  const model = useMemo(() => {
    const clone = source.scene.clone(true);
    // Replace source authoring materials with independent learner-facing ones.
    // The atlas uses several material types, vertex colours, and transparency
    // settings that make unrelated systems look alike in a web renderer.
    clone.traverse((object) => {
      if (!isRenderableAnatomyObject(object)) return;
      object.material = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        roughness: 0.6,
        metalness: 0,
        side: THREE.DoubleSide,
      });
    });
    return clone;
  }, [source.scene]);
  const { selectedStructureId, selectMesh, selectStructure, systemVisibility, layerVisibility } = useAnatomy();

  useEffect(() => {
    model.traverse((object) => {
      // Source atlas exports can contain construction/reference lines. They are not
      // anatomical structures and make the learning view visually noisy.
      if (object instanceof THREE.Line) {
        object.visible = false;
        return;
      }
      if (!isRenderableAnatomyObject(object)) return;
      if (ATLAS_LEGEND_MESH.test(object.name)) {
        object.visible = false;
        return;
      }
      const system = systemForMesh(asset, object.name);
      const structureId = structureIdForMesh(object.name);
      const isSelected = structureId !== null && structureId === selectedStructureId;
      const isHovered = hoveredMeshKey === meshKey(asset, object.name);
      object.userData.structureId = structureId;
      object.visible = layerVisibility[asset.layer] &&
        (system === 'integumentary' || systemVisibility[system]);
      object.castShadow = false;
      object.receiveShadow = false;

      materials(object).forEach((material) => {
        const standard = material as THREE.MeshStandardMaterial;
        const systemColor = system === 'integumentary'
          ? INTEGUMENTARY_COLOR
          : SYSTEM_COLORS[system];
        const baseColor = variedSystemColor(systemColor, object.name);
        standard.vertexColors = false;
        standard.color.copy(isSelected ? HIGHLIGHT_COLOR : isHovered ? HOVER_COLOR : baseColor);
        standard.emissive.set(isSelected ? HIGHLIGHT_COLOR : isHovered ? HOVER_COLOR : '#000000');
        standard.emissiveIntensity = isSelected ? 0.65 : isHovered ? 0.28 : 0;
        standard.transparent = false;
        standard.opacity = 1;
        if (asset.layer === 'skin') {
          standard.transparent = true;
          // The atlas splits the surface into hundreds of overlapping regions.
          // A low opacity keeps the skin identifiable without turning deeper
          // systems into one muddy colour where those regions overlap.
          standard.opacity = 0.08;
          standard.depthWrite = false;
        }
        standard.needsUpdate = true;
      });
    });
  }, [asset, hoveredMeshKey, layerVisibility, model, selectedStructureId, systemVisibility]);

  return (
    <primitive
      object={model}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const mesh = event.object as THREE.Mesh;
        const structureId = structureIdForMesh(mesh.name);
        if (structureId) {
          selectStructure(structureId);
        } else {
          selectMesh({ meshName: atlasNameForMesh(mesh.name), system: systemForMesh(asset, mesh.name) });
        }
      }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHoveredMeshKey(meshKey(asset, (event.object as THREE.Mesh).name));
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHoveredMeshKey(null);
        document.body.style.cursor = 'auto';
      }}
    />
  );
}

export function BodyModel() {
  const { layerVisibility } = useAnatomy();
  const [hoveredMeshKey, setHoveredMeshKey] = useState<string | null>(null);

  return (
    <group>
      {Z_ANATOMY_ASSETS
        .filter((asset) => asset.layer !== 'skin' || layerVisibility.skin)
        .map((asset) => (
          <ZAnatomyAssetModel
            key={asset.id}
            asset={asset}
            hoveredMeshKey={hoveredMeshKey}
            setHoveredMeshKey={setHoveredMeshKey}
          />
        ))}
    </group>
  );
}
