// src/components/three/PlayerAvatarFrame.jsx
'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

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

const PlayerAvatarFrame = ({ rank, size = 80, imageUrl }) => {
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const particlesRef = useRef(null);
  const fireParticlesRef = useRef(null);
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
  const rankColor = new THREE.Color(details.color);
  const intensity = details.intensity;
  const isRankD = details.rank === 'D';

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
      const textureLoader = new THREE.TextureLoader();
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
          // Fallback to a default circle if image fails to load
          const avatarGeometry = new THREE.CircleGeometry(1.2, 32);
          const avatarMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x333333,
            transparent: true 
          });
          const avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
          scene.add(avatarMesh);
        }
      );
    } else {
      // Default circle if no image
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

    // Add particles for higher ranks
    if (intensity >= 0.4) {
      const particleCount = Math.floor(100 * intensity);
      const particles = new THREE.Group();
      
      for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
          color: rankColor,
          transparent: true,
          opacity: 0.7
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Random position in a circle around the avatar
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.5 + Math.random() * 1;
        particle.position.x = Math.cos(angle) * radius;
        particle.position.y = Math.sin(angle) * radius;
        particle.position.z = Math.random() * 0.5 - 0.25;
        
        // Custom properties for animation
        particle.userData = {
          speed: 0.01 + Math.random() * 0.03 * intensity,
          angle: angle,
          radius: radius,
          pulseSpeed: 0.03 + Math.random() * 0.05,
          pulseOffset: Math.random() * Math.PI * 2
        };
        
        particles.add(particle);
      }
      
      scene.add(particles);
      particlesRef.current = particles;
    }

    // Add fire animation for Rank D
    if (isRankD) {
      const fireParticleCount = 80;
      const fireParticles = new THREE.Group();
      
      // Create fire color palette (blue fire for D rank)
      const fireColors = [
        new THREE.Color(0x60A5FA), // base blue
        new THREE.Color(0x93C5FD), // lighter blue
        new THREE.Color(0x3B82F6), // darker blue
        new THREE.Color(0xDBEAFE), // very light blue
        new THREE.Color(0x2563EB)  // deep blue
      ];
      
      for (let i = 0; i < fireParticleCount; i++) {
        const size = 0.02 + Math.random() * 0.08;
        const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
        
        // Pick a random color from our palette
        const colorIndex = Math.floor(Math.random() * fireColors.length);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
          color: fireColors[colorIndex],
          transparent: true,
          opacity: 0.3 + Math.random() * 0.7
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Position particles around the bottom half of the frame
        const angle = (Math.random() * Math.PI) + Math.PI / 2; // Bottom half
        const radius = 1.4 + Math.random() * 0.2;
        particle.position.x = Math.cos(angle) * radius;
        particle.position.y = Math.sin(angle) * radius;
        particle.position.z = Math.random() * 0.2;
        
        // Custom properties for fire animation
        particle.userData = {
          initialY: particle.position.y,
          initialX: particle.position.x,
          speed: 0.02 + Math.random() * 0.04,
          wiggleSpeed: 0.1 + Math.random() * 0.3,
          wiggleAmount: 0.02 + Math.random() * 0.06,
          lifespan: 1 + Math.random() * 2,
          age: Math.random() * 3, // Randomize initial age
          maxY: particle.position.y + 0.5 + Math.random() * 0.5
        };
        
        fireParticles.add(particle);
      }
      
      scene.add(fireParticles);
      fireParticlesRef.current = fireParticles;
    }

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
  }, [imageUrl, rank, size, isRankD]);

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
      
      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.children.forEach(particle => {
          const userData = particle.userData;
          
          // Update particle angle
          userData.angle += userData.speed;
          
          // Position along circular path
          particle.position.x = Math.cos(userData.angle) * userData.radius;
          particle.position.y = Math.sin(userData.angle) * userData.radius;
          
          // Pulse opacity
          particle.material.opacity = 
            (Math.sin(timeRef.current * userData.pulseSpeed + userData.pulseOffset) * 0.3 + 0.7) * 0.7;
        });
      }
      
      // Animate fire particles for D rank
      if (fireParticlesRef.current) {
        fireParticlesRef.current.children.forEach(particle => {
          const userData = particle.userData;
          
          // Increment age
          userData.age += userData.speed;
          
          // Reset if beyond lifespan
          if (userData.age > userData.lifespan) {
            userData.age = 0;
            particle.position.y = userData.initialY;
            particle.position.x = userData.initialX;
            particle.material.opacity = 0.7 + Math.random() * 0.3;
            particle.scale.set(1, 1, 1);
          }
          
          // Rise upward
          const lifePercent = userData.age / userData.lifespan;
          const newY = userData.initialY + (userData.maxY - userData.initialY) * lifePercent;
          particle.position.y = newY;
          
          // Wiggle side to side
          const wiggle = Math.sin(timeRef.current * userData.wiggleSpeed * 10) * userData.wiggleAmount;
          particle.position.x = userData.initialX + wiggle;
          
          // Fade out near end of life
          if (lifePercent > 0.7) {
            particle.material.opacity = 0.7 * (1 - (lifePercent - 0.7) / 0.3);
          }
          
          // Shrink slightly as it rises
          const scale = 1 - lifePercent * 0.5;
          particle.scale.set(scale, scale, scale);
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