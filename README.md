# Human Anatomy Explorer

An interactive 3D human anatomy learning tool for undergraduate Biomedical
Science students. Built with React, TypeScript, Vite, and React Three Fiber.

This is a pure exploration/reference tool — there are no quizzes, flashcards,
or AI chat. The nervous system (brain, spinal cord) is intentionally excluded.

## Features

- Interactive 3D body you can orbit, zoom, and pan
- Click any structure to see its Anatomical Name, Common Name, Location,
  Structure, Main Function, and Related Structures
- Toggle 9 body systems on/off (Skeletal, Muscular, Cardiovascular,
  Respiratory, Digestive, Urinary, Reproductive, Endocrine, Lymphatic), with
  Show All / Hide All / Show Only This System controls
- Toggle anatomical layers (Skin, Muscles, Bones, Organs) to look deeper
  into the body
- Front / Back / Left / Right / Reset camera view buttons
- Search bar to jump straight to a structure (e.g. "femur", "heart", "liver")
- Responsive layout for desktop and mobile

## Running the project

You'll need [Node.js](https://nodejs.org) 18 or later installed.

```bash
cd human-anatomy-explorer
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`) in your
browser.

To create a production build:

```bash
npm run build
npm run preview
```

The production build has been verified after the Z-Anatomy integration.

## Project structure

```
src/
  types/anatomy.ts          Shared TypeScript types
  data/
    systems.ts               The 9 body systems (id, label, color, description)
    structures.ts             Anatomical structure info (name, location, function, etc.)
    zAnatomyModel.ts           Z-Anatomy asset catalogue and mesh-to-structure mapping
  context/AnatomyContext.tsx   App-wide state: selection, system/layer visibility, search, camera commands
  components/
    Header/SearchBar.tsx
    Sidebar/SystemsPanel.tsx
    Sidebar/LayerControls.tsx
    Viewer/Scene3D.tsx         <Canvas> setup, lights, environment
    Viewer/BodyModel.tsx       Loads and renders the Z-Anatomy system meshes
    Viewer/CameraRig.tsx       OrbitControls + Front/Back/Left/Right/Reset/Focus logic
    Viewer/ViewControls.tsx    The view preset buttons
    InfoPanel/InfoPanel.tsx    Structure detail panel
  App.tsx
  main.tsx
  index.css
```

Anatomy **data** (`src/data/`) is completely separate from the **UI
components** (`src/components/`), so you can edit or expand the anatomy
content without touching any rendering code, and vice versa.

## Included real anatomy model

The viewer now loads the real Z-Anatomy atlas as six clean, optimized GLB
system assets from `public/models/z-anatomy-clean/`. They were exported
from the complete `Startup.blend` atlas included in the
[Z-Anatomy Models of human anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy)
release. The export includes skin, skeletal, muscular, cardiovascular,
lymphatic, and visceral collections, and deliberately excludes nervous-system,
reference-line, cross-section, and bonus collections.

The repeatable Blender exporter is `scripts/export_z_anatomy_glb.py`. To make
a new export, open the source `Startup.blend` with Blender in background mode
and run that script; copy its `web-exports/*.glb` files into
`public/models/z-anatomy-clean/`.

`src/data/zAnatomyModel.ts` is the single integration point. It declares the
asset files, classifies the combined visceral model into the digestive,
urinary, reproductive, endocrine, and respiratory systems, and maps source
mesh names to the structures in `structures.ts` for search, selection, and
highlighting.

### Attribution and license

The included assets are from **Z-Anatomy — the libre 3D atlas of anatomy** by
Gauthier Kervyn, Marcin Zielinski, and Lluís Vinent Juanico, with a model
lineage from **BodyParts3D — The Database Center for Life Science**. They are
provided under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Keep the attribution in `public/models/z-anatomy-clean/ATTRIBUTION.md` and release
any redistributed model derivatives under the same license.

## Adding more anatomy content

To add a new structure:

1. Add an entry to `STRUCTURES` in `src/data/structures.ts`.
2. Add a matching source-mesh pattern to `structureMatchers` in
   `src/data/zAnatomyModel.ts`.

No other files need to change — the sidebar, search, and info panel all read
from this shared data automatically.
