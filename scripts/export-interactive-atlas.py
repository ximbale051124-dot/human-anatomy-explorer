"""Export Z-Anatomy collections as interaction-safe GLBs.

Every exported mesh receives a deterministic anatomyId as a Blender custom
property. With export_extras enabled, Blender writes it to node extras and
Three.js exposes it as mesh.userData.anatomyId. Runtime code never infers an
ID from an object name.

Run from the Z-Anatomy Startup.blend:
  ANATOMY_OUTPUT_DIR=... ANATOMY_DATA_DIR=... blender --background Startup.blend --python export-interactive-atlas.py
"""

from __future__ import annotations

import json
import os
import re
import struct
import unicodedata
from pathlib import Path

import bpy


OUTPUT_DIR = Path(os.environ["ANATOMY_OUTPUT_DIR"])
DATA_DIR = Path(os.environ["ANATOMY_DATA_DIR"])

ASSETS = {
    "skeletal": {"collection": "1: Skeletal system", "layer": "bones"},
    "joints": {"collection": "3: Joints", "layer": "bones"},
    "muscular": {"collection": "4: Muscular system", "layer": "muscles"},
    "cardiovascular": {"collection": "5: Cardiovascular system", "layer": "organs"},
    "lymphatic": {"collection": "6: Lymphoid organs", "layer": "organs"},
    "visceral": {"collection": "8: Visceral systems", "layer": "organs"},
    "integumentary": {"collection": "9: Regions of human body", "layer": "skin"},
}

SIDE_SUFFIX = re.compile(r"\.(l|r)(?:\.\d+)?$", re.IGNORECASE)

# A small seed improves the first learning pass. Every unlisted atlas object
# remains a complete record with its exact source name and can receive curated
# teaching text later without changing the GLB or viewer.
LATIN_NAMES = {
    "femur": "Os femoris",
    "tibia": "Tibia",
    "fibula": "Fibula",
    "humerus": "Humerus",
    "radius": "Radius",
    "ulna": "Ulna",
}


def parse_name(source_node: str) -> tuple[str, str]:
    match = SIDE_SUFFIX.search(source_node)
    side = {"l": "left", "r": "right"}.get(match.group(1).lower(), "midline") if match else "midline"
    base = source_node[:match.start()] if match else source_node
    base = base.strip().strip("()")
    return base, side


def slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    if not value:
        raise RuntimeError("Cannot create anatomy ID from an empty source node name")
    return value


def anatomy_id(asset_id: str, source_node: str) -> tuple[str, str, str]:
    base, side = parse_name(source_node)
    return f"{asset_id}_{slug(base)}_{side}", base, side


def display_name(base: str, side: str) -> str:
    return f"{side.title()} {base}" if side != "midline" else base


def exported_anatomy_ids(glb_path: Path) -> set[str]:
    """Read emitted node extras so omitted zero-primitive meshes never enter data."""
    with glb_path.open("rb") as file:
        header = file.read(20)
        magic, _, _, json_length, json_type = struct.unpack("<IIIII", header)
        if magic != 0x46546C67 or json_type != 0x4E4F534A:
            raise RuntimeError(f"Invalid GLB JSON header: {glb_path}")
        document = json.loads(file.read(json_length).decode("utf-8"))
    return {
        node["extras"]["anatomyId"]
        for node in document.get("nodes", [])
        if "mesh" in node and isinstance(node.get("extras", {}).get("anatomyId"), str)
    }


def export_asset(asset_id: str, config: dict[str, str]) -> tuple[list[dict], list[dict]]:
    source = bpy.data.collections.get(config["collection"])
    if source is None:
        raise RuntimeError(f"Missing Z-Anatomy collection: {config['collection']}")

    scene = bpy.context.scene
    export_collection = bpy.data.collections.new(f"interactive-{asset_id}")
    scene.collection.children.link(export_collection)

    records: list[dict] = []
    bindings: list[dict] = []
    ids: set[str] = set()
    copies = []
    source_meshes = [
        (source_object, source_object.name)
        for source_object in sorted(source.all_objects, key=lambda item: item.name)
        if source_object.type == "MESH" and not source_object.name.endswith(".g")
    ]
    # Blender requires object names to be globally unique, including copies in
    # a temporary export collection. Move the original objects out of the name
    # namespace for this unsaved export session so the GLB nodes retain the
    # exact source names recorded in the manifest.
    for index, (source_object, _) in enumerate(source_meshes):
        source_object.name = f"__atlas_source_{asset_id}_{index}"

    for source_object, source_node in source_meshes:
        # Decorative labels and Blender helper objects are not anatomy.
        record_id, base_name, side = anatomy_id(asset_id, source_node)
        if record_id in ids:
            raise RuntimeError(f"Duplicate anatomy ID {record_id} from {source_node}")
        ids.add(record_id)

        copy = source_object.copy()
        copy.data = source_object.data.copy()
        copy.name = source_node
        copy["anatomyId"] = record_id
        export_collection.objects.link(copy)
        copies.append(copy)

        record = {
            "id": record_id,
            "displayName": display_name(base_name, side),
            "latinName": LATIN_NAMES.get(base_name.lower()),
            "aliases": [base_name, display_name(base_name, side)],
            "system": asset_id,
            "layer": config["layer"],
            "side": side,
            "sourceAsset": asset_id,
            "sourceNode": source_node,
            "description": None,
            "function": None,
            "location": None,
            "relatedAnatomyIds": [],
        }
        records.append(record)
        bindings.append({"anatomyId": record_id, "sourceAsset": asset_id, "sourceNode": source_node})

    if not copies:
        raise RuntimeError(f"No mesh nodes found in {config['collection']}")

    for object_ in scene.objects:
        object_.select_set(False)
    for copy in copies:
        copy.select_set(True)
    bpy.context.view_layer.objects.active = copies[0]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"{asset_id}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
        export_extras=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )

    emitted_ids = exported_anatomy_ids(output_path)
    expected_ids = {record["id"] for record in records}
    unexpected_ids = emitted_ids - expected_ids
    if unexpected_ids:
        raise RuntimeError(f"{asset_id} emitted unregistered anatomy IDs: {sorted(unexpected_ids)}")
    omitted_count = len(expected_ids - emitted_ids)
    records = [record for record in records if record["id"] in emitted_ids]
    bindings = [binding for binding in bindings if binding["anatomyId"] in emitted_ids]

    bpy.data.collections.remove(export_collection)
    for source_object, source_node in source_meshes:
        source_object.name = source_node
    print(f"Exported {asset_id}: {len(records)} interactive anatomy nodes ({omitted_count} empty source meshes excluded)")
    return records, bindings


all_records: list[dict] = []
all_bindings: list[dict] = []
for asset, asset_config in ASSETS.items():
    records, bindings = export_asset(asset, asset_config)
    all_records.extend(records)
    all_bindings.extend(bindings)

all_ids = [record["id"] for record in all_records]
if len(all_ids) != len(set(all_ids)):
    raise RuntimeError("Duplicate anatomy IDs across atlas assets")

DATA_DIR.mkdir(parents=True, exist_ok=True)
payload = {"records": all_records, "bindings": all_bindings}
(DATA_DIR / "atlas.generated.json").write_text(
    json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
)
print(f"Wrote {len(all_records)} anatomy records and bindings")
