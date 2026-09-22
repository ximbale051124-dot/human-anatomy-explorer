"""Bake Z-Anatomy procedural tissue colours into compact, selection-safe GLBs.

Z-Anatomy's Blender file uses procedural node groups.  Direct GLB export keeps
the geometry but not that material output, making every muscle appear as one
flat web colour.  This exporter writes the diffuse tissue colour to each
mesh's vertex colour attribute, then exports the original independently named
objects.  The names are preserved for picking and information lookup.

Usage:
  blender --background Startup.blend --python export_z_anatomy_vertex_colours.py

Set WEB_ANATOMY_SYSTEM to a key below to export one system while iterating.
"""

from pathlib import Path
import os

import bpy


OUTPUT_DIR = Path(bpy.path.abspath("//")) / "web-exports"
VERTEX_COLOR_NAME = "web_tissue_color"
SYSTEMS = {
    "muscular": "4: Muscular system",
}


def new_web_material() -> bpy.types.Material:
    material = bpy.data.materials.new("Web tissue vertex colour")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    shader.inputs["Roughness"].default_value = 0.52
    color = nodes.new("ShaderNodeVertexColor")
    color.layer_name = VERTEX_COLOR_NAME
    material.node_tree.links.new(color.outputs["Color"], shader.inputs["Base Color"])
    material.node_tree.links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    return material


def copy_mesh_to_scene(
    source: bpy.types.Object,
    destination: bpy.types.Collection,
) -> bpy.types.Object:
    copy = source.copy()
    copy.data = source.data.copy()
    copy.name = source.name
    copy.hide_set(False)
    copy.hide_viewport = False
    copy.hide_render = False
    destination.objects.link(copy)
    color_attributes = copy.data.color_attributes
    if VERTEX_COLOR_NAME in color_attributes:
        color = color_attributes[VERTEX_COLOR_NAME]
    else:
        color = color_attributes.new(
            name=VERTEX_COLOR_NAME,
            type="BYTE_COLOR",
            domain="CORNER",
        )
    color_attributes.active_color = color
    return copy


def export_system(system_id: str, collection_name: str) -> None:
    source_collection = bpy.data.collections.get(collection_name)
    if source_collection is None:
        raise RuntimeError(f"Missing Z-Anatomy collection: {collection_name}")

    # Work in the source scene: evaluated Z-Anatomy meshes depend on its
    # authoring hierarchy. The temporary collection contains only export
    # copies, while original objects are disabled for the bake.
    scene = bpy.context.scene
    collection = bpy.data.collections.new(f"web-{system_id}-objects")
    scene.collection.children.link(collection)

    copies = []
    for source in source_collection.all_objects:
        if source.type != "MESH" or source.name.endswith(".g"):
            continue
        copies.append(copy_mesh_to_scene(source, collection))
    if not copies:
        raise RuntimeError(f"No mesh objects in {collection_name}")

    for obj in bpy.context.view_layer.objects:
        obj.select_set(False)
        if obj not in copies:
            obj.hide_render = True
    for obj in copies:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = copies[0]

    scene.render.engine = "CYCLES"
    scene.cycles.samples = 16
    scene.render.bake.target = "VERTEX_COLORS"
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, use_clear=True)

    web_material = new_web_material()
    for obj in copies:
        obj.data.materials.clear()
        obj.data.materials.append(web_material)
        obj.select_set(True)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUTPUT_DIR / f"{system_id}-vertex.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
        export_vertex_color="ACTIVE",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    print(f"Exported {output} with {len(copies)} independently selectable meshes")


requested_system = os.environ.get("WEB_ANATOMY_SYSTEM")
if requested_system:
    if requested_system not in SYSTEMS:
        raise RuntimeError(f"Unknown WEB_ANATOMY_SYSTEM: {requested_system}")
    export_system(requested_system, SYSTEMS[requested_system])
else:
    for system_id, collection_name in SYSTEMS.items():
        export_system(system_id, collection_name)
