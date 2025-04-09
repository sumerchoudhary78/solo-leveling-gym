# 3D Animal Models for Rank System

This directory contains the 3D models used for the rank animal system in Solo Leveling Gym.

## Required Models

The following GLTF/GLB models should be placed in this directory:

1. `rabbit.glb` - For E Rank (Level 1-9)
2. `fox.glb` - For D Rank (Level 10-14)
3. `wolf.glb` - For C Rank (Level 15-19)
4. `panther.glb` - For B Rank (Level 20-24)
5. `tiger.glb` - For A Rank (Level 25-29)
6. `lion.glb` - For S Rank (Level 30-39)
7. `dragon.glb` - For National Level Rank (Level 40-49)
8. `phoenix.glb` - For Special Authority Rank (Level 50+)
9. `sphere.glb` - Fallback model if others fail to load

## Model Requirements

- Models should be in GLB format (binary GLTF)
- Keep file sizes under 2MB for optimal performance
- Models should have basic animations (idle, walk, roar, etc.)
- Use low-poly models to ensure good performance on mobile devices

## Where to Find Models

You can obtain suitable 3D models from:

1. [Sketchfab](https://sketchfab.com/) - Many free and paid models
2. [TurboSquid](https://www.turbosquid.com/) - Professional 3D models
3. [Free3D](https://free3d.com/) - Free 3D models
4. [CGTrader](https://www.cgtrader.com/) - Marketplace for 3D models

Make sure to check the licensing terms for any models you use.

## Model Optimization

For optimal performance:

1. Reduce polygon count using tools like Blender
2. Compress textures
3. Simplify animations
4. Use draco compression for GLB files

## Customizing Models

You can customize the appearance and behavior of the models by editing the `RankAnimalModel.jsx` component in `app/components/three/`.

The component allows you to adjust:
- Scale
- Position
- Rotation
- Animation speed
- Colors and effects

## Fallback Behavior

If a model fails to load, the system will automatically fall back to using `sphere.glb`, which is a simple colored sphere that matches the rank color.
