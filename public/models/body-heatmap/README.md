# BodyHeatmap3D model assets

`BodyHeatmap3D` currently renders a procedural Three.js anatomical proxy made from separate muscle meshes. This keeps the homepage working without bundling an unlicensed anatomical model.

To replace it with a real `.glb`/`.gltf`, add a licensed model in this directory and keep, or adapt to, mesh names that can be mapped to:

- quadriceps
- hamstrings
- glutes
- calves
- hipFlexors
- adductors
- core
- lowerBack
- lats
- upperBack
- traps
- shoulders
- chest
- triceps
- biceps
- forearms

Preferred path for a future asset:

```txt
public/models/body-heatmap/muscular-body.glb
```

The model should be optimized for web use and expose separate meshes or named mesh groups per muscle region. If a source model groups several muscles into one mesh, the heatmap can only color that larger group.
