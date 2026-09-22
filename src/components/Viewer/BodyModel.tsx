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
const WHITE = new THREE.Color('#FFFFFF');
useGLTF.setDecoderPath('/draco/');
const INTEGUMENTARY_COLOR = new THREE.Color('#E9B28C');
const SYSTEM_COLORS: Record<string, THREE.Color> = {
  skeletal: new THREE.Color('#B8C7D9'),
  joints: new THREE.Color('#63A89A'),
  muscular: new THREE.Color('#B96839'),
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
  const stableHash = hash >>> 0;
  const color = base.clone();
  color.offsetHSL(
    ((stableHash % 7) - 3) * 0.006,
    ((stableHash % 5) - 2) * 0.015,
    ((stableHash % 9) - 4) * 0.025
  );
  return color;
}

function isMuscleCoveringLayer(asset: ZAnatomyAsset, meshName: string): boolean {
  // These broad connective-tissue sheets sit over the individual muscle
  // bellies in the atlas. Keeping them in the same opaque layer makes the
  // body read as one red shell rather than distinct muscles.
  return asset.system === 'muscular' && /\b(fascia|aponeurosis)\b/i.test(meshName);
}

function atlasMaterialColor(
  system: string,
  meshName: string,
  materialName: string
): THREE.Color {
  const nativeMaterial = materialName.toLowerCase();
  const nativeMesh = meshName.toLowerCase();
  if (/cartilage/.test(nativeMaterial) || /cartilage/.test(nativeMesh)) return new THREE.Color('#9DB5A4');
  if (/tendon/.test(nativeMaterial) || /tendon/.test(nativeMesh)) return new THREE.Color('#D6C1A8');
  if (/ligament|articular capsule/.test(nativeMaterial) || /ligament/.test(nativeMesh)) return new THREE.Color('#8DAEA4');
  return variedSystemColor(
    system === 'integumentary' ? INTEGUMENTARY_COLOR : SYSTEM_COLORS[system],
    meshName
  );
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
      const sourceMaterial = Array.isArray(object.material) ? object.material[0] : object.material;
      object.userData.atlasMaterialName = sourceMaterial?.name ?? '';
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
      object.visible = !isMuscleCoveringLayer(asset, object.name) && layerVisibility[asset.layer] &&
        (system === 'integumentary' || systemVisibility[system]);
      object.castShadow = false;
      object.receiveShadow = false;

      materials(object).forEach((material) => {
        const standard = material as THREE.MeshStandardMaterial;
        const hasBakedVertexColor = Boolean(object.geometry.getAttribute('color'));
        const baseColor = atlasMaterialColor(system, object.name, String(object.userData.atlasMaterialName ?? ''));
        // The vertex-colour export contains the original Z-Anatomy tissue
        // shading. Retain it at rest; selection and hover temporarily become
        // high-contrast teaching colours so the precise mesh is unambiguous.
        standard.vertexColors = hasBakedVertexColor && !isSelected && !isHovered;
        standard.color.copy(
          isSelected
            ? HIGHLIGHT_COLOR
            : isHovered
              ? HOVER_COLOR
              : hasBakedVertexColor
                ? WHITE
                : baseColor
        );
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
