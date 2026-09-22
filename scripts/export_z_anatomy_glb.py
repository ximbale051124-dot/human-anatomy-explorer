"""Export clean, system-level GLBs from Z-Anatomy's Startup.blend.

Run with Blender in background mode. Only the top-level anatomy collections
listed below are exported: reference lines, cross-sections, bonus objects, and
the nervous system are deliberately excluded.
"""

from pathlib import Path
import bpy

OUTPUT_DIR = Path(bpy.path.abspath("//")) / "web-exports"
USE_DRACO = True

SYSTEMS = {
    "skeletal": "1: Skeletal system",
    "joints": "3: Joints",
    "muscular": "4: Muscular system",
    "cardiovascular": "5: Cardiovascular system",
    "lymphatic": "6: Lymphoid organs",
    "visceral": "8: Visceral systems",
    "skin": "9: Regions of human body",
}

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

for output_name, collection_name in SYSTEMS.items():
    collection = bpy.data.collections.get(collection_name)
    if collection is None:
        raise RuntimeError(f"Missing Z-Anatomy collection: {collection_name}")

    # `select_all(DESELECT)` skips hidden atlas objects. Explicitly clear every
    # object first, otherwise the prior system remains selected and is silently
    # appended to the next GLB export.
    for obj in bpy.context.scene.objects:
        obj.hide_set(False)
        obj.select_set(False)

    selected = []
    for obj in collection.all_objects:
        # Atlas collection-title labels are meshes named e.g. "Skeletal
        # system.g". They are presentation aids in Blender, not anatomy.
        if obj.type not in {"MESH", "CURVE", "SURFACE"} or obj.name.endswith(".g"):
            continue
        obj.select_set(True)
        selected.append(obj)

    if not selected:
        raise RuntimeError(f"No exportable objects in {collection_name}")

    bpy.context.view_layer.objects.active = selected[0]
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT_DIR / f"{output_name}.glb"),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
        export_draco_mesh_compression_enable=USE_DRACO,
        export_draco_mesh_compression_level=6,
    )
    print(f"Exported {output_name}.glb with {len(selected)} objects")
