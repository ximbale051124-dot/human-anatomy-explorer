Place your real anatomical GLB/GLTF model file(s) in this folder.

Example: public/models/human-body.glb

Then update src/components/Viewer/BodyModel.tsx to load it with useGLTF
from '@react-three/drei' instead of rendering the placeholder primitives.
See the comment block at the top of BodyModel.tsx for full instructions.
