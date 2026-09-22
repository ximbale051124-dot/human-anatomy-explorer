"""Verify that Z-Anatomy's procedural tissue materials can become GLB vertex colours.

Vertex colour baking retains the source tissue shading without introducing
hundreds of separate PNG files. It is the compact web delivery route used by
the full-system exporter once this preview has been approved.
"""

from pathlib import Path

import bpy


MESH_NAME = "Sternocostal head of pectoralis major muscle.l"
OUTPUT = Path(bpy.path.abspath("//")) / "web-exports" / "muscle-vertex-preview.glb"


def main() -> None:
    source = bpy.data.objects.get(MESH_NAME)
    if source is None or source.type != "MESH":
        raise RuntimeError(f"Missing expected muscle mesh: {MESH_NAME}")

    collection = bpy.data.collections.new("web-vertex-bake-preview")
    bpy.context.scene.collection.children.link(collection)
    obj = source.copy()
    obj.data = source.data.copy()
    obj.name = f"{source.name}-web-vertex-preview"
    collection.objects.link(obj)

    for scene_object in bpy.context.view_layer.objects:
        scene_object.select_set(False)
    obj.hide_set(False)
    obj.hide_viewport = False
    obj.hide_render = False
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    color = obj.data.color_attributes.new(
        name="web_tissue_color",
        type="BYTE_COLOR",
        domain="CORNER",
    )
    obj.data.color_attributes.active_color = color
    obj.data.color_attributes.render_color_index = 0

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 16
    scene.render.bake.target = "VERTEX_COLORS"
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, use_clear=True)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
    )
    print(f"Baked and exported vertex-colour preview to {OUTPUT}")


if __name__ == "__main__":
    main()
