"""Bake one native Z-Anatomy muscle material to a portable texture.

This is a verification step for the production atlas-baking pipeline.  The
source project uses Blender shader node groups rather than web-ready image
textures, so a direct GLB export drops the characteristic muscle surface.

Run from the extracted Z-Anatomy folder:
  blender --background Startup.blend --python <this-file>
"""

from pathlib import Path

import bpy


MESH_NAME = "Sternocostal head of pectoralis major muscle.l"
TEXTURE_SIZE = 1024
OUTPUT = Path(bpy.path.abspath("//")) / "web-exports" / "muscle-material-preview.png"


def main() -> None:
    obj = bpy.data.objects.get(MESH_NAME)
    if obj is None or obj.type != "MESH":
        raise RuntimeError(f"Missing expected muscle mesh: {MESH_NAME}")

    # The source atlas keeps many teaching collections disabled in its saved
    # view layer.  Bake a linked copy in an explicitly visible collection so
    # that the original .blend stays untouched and Blender accepts the mesh.
    source_obj = obj
    working_collection = bpy.data.collections.new("web-bake-preview")
    bpy.context.scene.collection.children.link(working_collection)
    obj = source_obj.copy()
    obj.data = source_obj.data.copy()
    obj.name = f"{source_obj.name}-web-preview"
    working_collection.objects.link(obj)

    for scene_object in bpy.context.view_layer.objects:
        scene_object.select_set(False)
    obj.hide_set(False)
    obj.hide_viewport = False
    obj.hide_render = False
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    print(
        f"Object selected={obj.select_get()} visible={obj.visible_get()} "
        f"hidden={obj.hide_get()} collection={[c.name for c in obj.users_collection]}"
    )
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(island_margin=0.02)
    bpy.ops.object.mode_set(mode="OBJECT")

    image = bpy.data.images.new("web-muscle-material-preview", TEXTURE_SIZE, TEXTURE_SIZE, alpha=False)
    for material in obj.data.materials:
        if material is None or not material.use_nodes:
            continue
        texture_node = material.node_tree.nodes.new("ShaderNodeTexImage")
        texture_node.image = image
        material.node_tree.nodes.active = texture_node
        texture_node.select = True

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 16
    scene.render.image_settings.file_format = "PNG"
    scene.render.bake.margin = 8
    # Diffuse colour preserves the native tissue palette without introducing
    # scene lights. Surface relief is added separately in the full bake.
    bpy.ops.object.bake(
        type="DIFFUSE",
        margin=8,
        use_clear=True,
        pass_filter={"COLOR"},
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.filepath_raw = str(OUTPUT)
    image.save()
    print(f"Baked {MESH_NAME} to {OUTPUT}")


if __name__ == "__main__":
    main()
