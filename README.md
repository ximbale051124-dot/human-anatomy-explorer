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

> Note: this project was written and reviewed carefully, but it has **not**
> been run through `npm install` / `npm run build` in the environment that
> generated it, since that environment has no network access to the npm
> registry. Please run `npm install && npm run dev` yourself as the first
> step, and let me know if you hit any errors — I'll fix them immediately.

## Project structure

```
src/
  types/anatomy.ts          Shared TypeScript types
  data/
    systems.ts               The 9 body systems (id, label, color, description)
    structures.ts             Anatomical structure info (name, location, function, etc.)
    meshConfigs.ts             Placement of placeholder 3D primitives — SEE BELOW
  context/AnatomyContext.tsx   App-wide state: selection, system/layer visibility, search, camera commands
  components/
    Header/SearchBar.tsx
    Sidebar/SystemsPanel.tsx
    Sidebar/LayerControls.tsx
    Viewer/Scene3D.tsx         <Canvas> setup, lights, environment
    Viewer/BodyModel.tsx       Renders the 3D body — see below for GLB instructions
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

## Where to add a real GLB/GLTF anatomical model

Right now the 3D body is a placeholder made of simple primitive shapes
(spheres, boxes, cylinders), positioned and colored to roughly resemble a
human figure with skin, bones, muscles, and organs. This keeps the whole
interaction model (selection, systems, layers, search, camera) fully working
without needing a licensed anatomy asset.

To use a real model:

1. Put your `.glb` or `.gltf` file in **`public/models/`**, e.g.
   `public/models/human-body.glb`.
2. Open **`src/components/Viewer/BodyModel.tsx`** — there is a detailed
   comment at the top of that file with a code example. In short: load the
   model with `useGLTF('/models/human-body.glb')` from `@react-three/drei`,
   then walk the loaded scene's meshes and map each mesh name to a
   `structureId` from `src/data/structures.ts` (the same way
   `src/data/meshConfigs.ts` currently maps placeholder shapes to structure
   ids). Use that mapping to drive visibility (systems/layers) and the
   selection highlight, exactly like the placeholder does.
3. Once every relevant mesh in your GLB is mapped, you can delete
   `src/data/meshConfigs.ts` — it's only used by the placeholder.

If your model separates meshes by system/layer already (e.g. a mesh named
`heart`, another named `femur_L`), this mapping step is usually just a
lookup table with a dozen or so entries per system.

## Adding more anatomy content

To add a new structure:

1. Add an entry to `STRUCTURES` in `src/data/structures.ts`.
2. If you're still using the placeholder body, add a matching primitive to
   `MESH_CONFIGS` in `src/data/meshConfigs.ts`. If you're using a real GLB,
   add the mesh-name mapping described above instead.

No other files need to change — the sidebar, search, and info panel all read
from this shared data automatically.
