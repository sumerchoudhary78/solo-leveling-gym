// src/components/three/PlayerAvatarFrame.jsx
'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Define basic rank colors first for use in getRankDetails
const rankColors = {
  'E': '#9CA3AF', // gray-400
  'D': '#60A5FA', // blue-400
  'C': '#4ADE80', // green-400
  'B': '#FBBF24', // yellow-400
  'A': '#FB923C', // orange-400
  'S': '#F87171', // red-400
  'National Level': '#FCA5A5', // red-300
  'Special Authority': '#D8B4FE', // purple-300
};

// Define animation intensity
const rankAnimationIntensity = {
  'E': 0.2,
  'D': 0.3,
  'C': 0.4,
  'B': 0.5,
  'A': 0.7,
  'S': 1.0,
  'National Level': 1.3,
  'Special Authority': 1.5,
};

// Define elemental themes for each rank
const rankElements = {
  'E': {
    name: 'Shadow',
    color: rankColors['E'],
    particleColors: ['#9CA3AF', '#6B7280', '#4B5563', '#374151'],
    particleType: 'shadow'
  },
  'D': {
    name: 'Ice',
    color: rankColors['D'],
    particleColors: ['#60A5FA', '#93C5FD', '#3B82F6', '#2563EB'],
    particleType: 'ice'
  },
  'C': {
    name: 'Water',
    color: rankColors['C'],
    particleColors: ['#38BDF8', '#0EA5E9', '#0284C7', '#0369A1'],
    particleType: 'water'
  },
  'B': {
    name: 'Earth',
    color: rankColors['B'],
    particleColors: ['#FBBF24', '#D97706', '#92400E', '#78350F'],
    particleType: 'earth'
  },
  'A': {
    name: 'Wind',
    color: rankColors['A'],
    particleColors: ['#E4E4E7', '#A1A1AA', '#71717A', '#52525B'],
    particleType: 'wind'
  },
  'S': {
    name: 'Fire',
    color: rankColors['S'],
    particleColors: ['#F87171', '#EF4444', '#DC2626', '#B91C1C'],
    particleType: 'fire'
  },
  'National Level': {
    name: 'Lightning',
    color: rankColors['National Level'],
    particleColors: ['#FEF08A', '#FDE047', '#FACC15', '#EAB308'],
    particleType: 'lightning'
  },
  'Special Authority': {
    name: 'Cosmic Energy',
    color: rankColors['Special Authority'],
    particleColors: ['#D8B4FE', '#C084FC', '#A855F7', '#9333EA'],
    particleType: 'cosmic'
  }
};

const PlayerAvatarFrame = ({ rank, size = 80, imageUrl }) => {
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const particlesRef = useRef(null);
  const timeRef = useRef(0);

  // Determine rank details
  const getRankDetails = (level) => {
    if (level >= 50) return { rank: 'Special Authority', color: rankColors['Special Authority'], intensity: rankAnimationIntensity['Special Authority'] };
    if (level >= 40) return { rank: 'National Level', color: rankColors['National Level'], intensity: rankAnimationIntensity['National Level'] };
    if (level >= 30) return { rank: 'S', color: rankColors['S'], intensity: rankAnimationIntensity['S'] };
    if (level >= 25) return { rank: 'A', color: rankColors['A'], intensity: rankAnimationIntensity['A'] };
    if (level >= 20) return { rank: 'B', color: rankColors['B'], intensity: rankAnimationIntensity['B'] };
    if (level >= 15) return { rank: 'C', color: rankColors['C'], intensity: rankAnimationIntensity['C'] };
    if (level >= 10) return { rank: 'D', color: rankColors['D'], intensity: rankAnimationIntensity['D'] };
    return { rank: 'E', color: rankColors['E'], intensity: rankAnimationIntensity['E'] };
  };

  const details = getRankDetails(rank === 'level' ? 1 : rank);
  const elementDetails = rankElements[details.rank];
  const rankColor = new THREE.Color(elementDetails.color);
  const intensity = details.intensity;
  const elementType = elementDetails.particleType;

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add avatar image as texture on a plane
    if (imageUrl) {
      // Handle both data URLs and regular URLs
      const isDataUrl = imageUrl.startsWith('data:');
      const textureLoader = new THREE.TextureLoader();

      // For data URLs, we need to handle them differently
      if (isDataUrl) {
        try {
          const texture = new THREE.Texture();
          const image = new Image();
          image.onload = function() {
            texture.image = image;
            texture.needsUpdate = true;

            const avatarGeometry = new THREE.PlaneGeometry(2.5, 2.5);
            const avatarMaterial = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true
            });
            const avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
            scene.add(avatarMesh);
          };
          image.src = imageUrl;
          image.onerror = function(error) {
            console.error('Error loading data URL image:', error);
            createDefaultAvatar(scene);
          };
        } catch (error) {
          console.error('Error processing data URL:', error);
          createDefaultAvatar(scene);
        }
      } else {
        // Regular URL handling
        textureLoader.load(
          imageUrl,
          (texture) => {
            const avatarGeometry = new THREE.PlaneGeometry(2.5, 2.5);
            const avatarMaterial = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true
            });
            const avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
            scene.add(avatarMesh);
          },
          undefined,
          (error) => {
            console.error('Error loading avatar texture:', error);
            createDefaultAvatar(scene);
          }
        );
      }
    } else {
      // Default circle if no image
      createDefaultAvatar(scene);
    }

    // Helper function to create default avatar
    function createDefaultAvatar(scene) {
      const avatarGeometry = new THREE.CircleGeometry(1.2, 32);
      const avatarMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true
      });
      const avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
      scene.add(avatarMesh);
    }

    // Create avatar frame based on rank
    const frameGeometry = new THREE.RingGeometry(1.3, 1.5, 32);
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: rankColor,
      transparent: true,
      side: THREE.DoubleSide
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    scene.add(frameMesh);
    frameRef.current = frameMesh;

    // Add elemental particles for all ranks
    const particleCount = Math.floor(100 * intensity);
    const particles = new THREE.Group();

    // Get particle colors for this element
    const particleColors = elementDetails.particleColors.map(color => new THREE.Color(color));

    for (let i = 0; i < particleCount; i++) {
      // Randomize particle size based on rank
      const size = 0.02 + Math.random() * 0.04 * intensity;
      const particleGeometry = new THREE.SphereGeometry(size, 8, 8);

      // Pick a random color from the element's palette
      const colorIndex = Math.floor(Math.random() * particleColors.length);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: particleColors[colorIndex],
        transparent: true,
        opacity: 0.4 + Math.random() * 0.6
      });

      const particle = new THREE.Mesh(particleGeometry, particleMaterial);

      // Random position in a circle around the avatar
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 1;
      particle.position.x = Math.cos(angle) * radius;
      particle.position.y = Math.sin(angle) * radius;
      particle.position.z = Math.random() * 0.5 - 0.25;

      // Base properties for all particles
      particle.userData = {
        speed: 0.01 + Math.random() * 0.03 * intensity,
        angle: angle,
        radius: radius,
        pulseSpeed: 0.03 + Math.random() * 0.05,
        pulseOffset: Math.random() * Math.PI * 2,
        elementType: elementType
      };

      // Add element-specific properties
      switch(elementType) {
        case 'shadow':
          // Shadow particles fade in and out
          particle.userData.fadeSpeed = 0.01 + Math.random() * 0.02;
          particle.userData.minOpacity = 0.1 + Math.random() * 0.2;
          particle.userData.maxOpacity = 0.4 + Math.random() * 0.3;
          break;

        case 'ice':
          // Ice particles are crystalline and shimmer
          particle.userData.shimmerSpeed = 0.05 + Math.random() * 0.1;
          particle.userData.shimmerIntensity = 0.1 + Math.random() * 0.2;
          break;

        case 'water':
          // Water particles flow in waves
          particle.userData.waveAmplitude = 0.1 + Math.random() * 0.2;
          particle.userData.waveFrequency = 0.05 + Math.random() * 0.1;
          break;

        case 'earth':
          // Earth particles orbit more slowly and are more stable
          particle.userData.speed *= 0.7;
          particle.userData.gravity = 0.001 + Math.random() * 0.002;
          break;

        case 'wind':
          // Wind particles move in gusts
          particle.userData.gustSpeed = 0.1 + Math.random() * 0.2;
          particle.userData.gustIntensity = 0.2 + Math.random() * 0.3;
          break;

        case 'fire':
          // Fire particles flicker and rise
          particle.userData.flickerSpeed = 0.1 + Math.random() * 0.2;
          particle.userData.riseSpeed = 0.005 + Math.random() * 0.01;
          particle.userData.initialY = particle.position.y;
          break;

        case 'lightning':
          // Lightning particles flash and jump
          particle.userData.flashSpeed = 0.2 + Math.random() * 0.3;
          particle.userData.jumpProbability = 0.01 + Math.random() * 0.02;
          particle.userData.jumpDistance = 0.2 + Math.random() * 0.3;
          break;

        case 'cosmic':
          // Cosmic particles have complex orbital patterns
          particle.userData.orbitSpeed1 = 0.01 + Math.random() * 0.02;
          particle.userData.orbitSpeed2 = 0.005 + Math.random() * 0.01;
          particle.userData.orbitRadius1 = radius;
          particle.userData.orbitRadius2 = 0.2 + Math.random() * 0.4;
          break;
      }

      particles.add(particle);
    }

    scene.add(particles);
    particlesRef.current = particles;



    // Add glow effect for high ranks
    if (intensity >= 0.7) {
      const glowGeometry = new THREE.RingGeometry(1.6, 2.2, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: rankColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      scene.add(glowMesh);

      // Animation for glow
      glowMesh.userData = {
        pulseSpeed: 0.015 * intensity
      };
    }

    // Clean up on unmount
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, [imageUrl, rank, size, elementType]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const animate = () => {
      timeRef.current += 0.01;

      // Animate frame based on rank
      if (frameRef.current) {
        frameRef.current.rotation.z = timeRef.current * 0.2 * intensity;

        // Pulse effect for frame scale
        const pulse = Math.sin(timeRef.current * 2) * 0.05 * intensity + 1;
        frameRef.current.scale.set(pulse, pulse, 1);
      }

      // Animate elemental particles
      if (particlesRef.current) {
        particlesRef.current.children.forEach(particle => {
          const userData = particle.userData;

          // Base animation for all particles
          userData.angle += userData.speed;

          // Element-specific animations
          switch(userData.elementType) {
            case 'shadow':
              // Shadow particles fade in and out and move in erratic patterns
              particle.material.opacity = userData.minOpacity +
                Math.sin(timeRef.current * userData.fadeSpeed) * (userData.maxOpacity - userData.minOpacity);

              // Slightly erratic movement
              const shadowRadius = userData.radius + Math.sin(timeRef.current * 0.5) * 0.1;
              particle.position.x = Math.cos(userData.angle) * shadowRadius;
              particle.position.y = Math.sin(userData.angle) * shadowRadius;
              break;

            case 'ice':
              // Ice particles shimmer and have crystalline movement
              particle.material.opacity = 0.5 + Math.sin(timeRef.current * userData.shimmerSpeed) * userData.shimmerIntensity;

              // Crystalline movement (more angular)
              particle.position.x = Math.cos(userData.angle) * userData.radius;
              particle.position.y = Math.sin(userData.angle) * userData.radius;

              // Occasional sparkle effect
              if (Math.random() < 0.01) {
                particle.scale.set(1.5, 1.5, 1.5);
                setTimeout(() => {
                  if (particle.scale) particle.scale.set(1, 1, 1);
                }, 100);
              }
              break;

            case 'water':
              // Water particles flow in wave patterns
              const waveOffset = Math.sin(timeRef.current * userData.waveFrequency) * userData.waveAmplitude;
              particle.position.x = Math.cos(userData.angle) * userData.radius + waveOffset;
              particle.position.y = Math.sin(userData.angle) * userData.radius;

              // Subtle opacity changes like water
              particle.material.opacity = 0.6 + Math.sin(timeRef.current * 0.2) * 0.2;
              break;

            case 'earth':
              // Earth particles move more slowly and have gravity effects
              particle.position.x = Math.cos(userData.angle) * userData.radius;
              particle.position.y = Math.sin(userData.angle) * userData.radius;

              // Subtle gravitational pull (particles slightly sink)
              particle.position.y -= userData.gravity;

              // Maintain opacity
              particle.material.opacity = 0.7;
              break;

            case 'wind':
              // Wind particles move in gusts
              const gustEffect = Math.sin(timeRef.current * userData.gustSpeed) * userData.gustIntensity;
              const windRadius = userData.radius + gustEffect;

              particle.position.x = Math.cos(userData.angle) * windRadius;
              particle.position.y = Math.sin(userData.angle) * windRadius;

              // Wind particles are more transparent
              particle.material.opacity = 0.3 + Math.abs(gustEffect) * 0.5;
              break;

            case 'fire':
              // Fire particles flicker and rise
              particle.position.x = Math.cos(userData.angle) * userData.radius;
              particle.position.y = Math.sin(userData.angle) * userData.radius +
                                   Math.sin(timeRef.current * userData.flickerSpeed) * 0.1;

              // Flickering opacity
              particle.material.opacity = 0.5 + Math.random() * 0.5;

              // Occasional size flicker
              if (Math.random() < 0.05) {
                const flickerSize = 0.8 + Math.random() * 0.4;
                particle.scale.set(flickerSize, flickerSize, flickerSize);
              }
              break;

            case 'lightning':
              // Lightning particles flash and jump
              particle.position.x = Math.cos(userData.angle) * userData.radius;
              particle.position.y = Math.sin(userData.angle) * userData.radius;

              // Random flashing
              particle.material.opacity = 0.3 + Math.abs(Math.sin(timeRef.current * userData.flashSpeed)) * 0.7;

              // Occasional jumping to new position
              if (Math.random() < userData.jumpProbability) {
                const jumpAngle = Math.random() * Math.PI * 2;
                userData.angle = jumpAngle;
              }
              break;

            case 'cosmic':
              // Cosmic particles have complex orbital patterns
              const orbitX = Math.cos(userData.angle) * userData.orbitRadius1;
              const orbitY = Math.sin(userData.angle) * userData.orbitRadius1;

              // Secondary orbit
              const secondaryAngle = timeRef.current * userData.orbitSpeed2;
              const secondaryX = Math.cos(secondaryAngle) * userData.orbitRadius2;
              const secondaryY = Math.sin(secondaryAngle) * userData.orbitRadius2;

              particle.position.x = orbitX + secondaryX;
              particle.position.y = orbitY + secondaryY;

              // Cosmic particles have pulsing opacity
              particle.material.opacity = 0.5 + Math.sin(timeRef.current * 0.1) * 0.5;
              break;

            default:
              // Default circular movement for any other element
              particle.position.x = Math.cos(userData.angle) * userData.radius;
              particle.position.y = Math.sin(userData.angle) * userData.radius;

              // Default pulsing opacity
              particle.material.opacity =
                (Math.sin(timeRef.current * userData.pulseSpeed + userData.pulseOffset) * 0.3 + 0.7) * 0.7;
          }
        });
      }

      // Update glow effects
      if (sceneRef.current.children.length > 2) {
        sceneRef.current.children.forEach(child => {
          if (child.userData && child.userData.pulseSpeed) {
            const scale = Math.sin(timeRef.current * child.userData.pulseSpeed) * 0.1 * intensity + 1;
            child.scale.set(scale, scale, 1);

            // Rotate in opposite direction for visual effect
            child.rotation.z = -timeRef.current * 0.1 * intensity;
          }
        });
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(requestRef.current);
  }, [intensity]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    />
  );
};

export default PlayerAvatarFrame;