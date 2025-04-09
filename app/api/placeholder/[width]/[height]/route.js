// app/api/placeholder/[width]/[height]/route.js
import { NextResponse } from 'next/server';

/**
 * API route that generates a placeholder image
 * Usage: /api/placeholder/100/100 - generates a 100x100 placeholder
 */
export async function GET(request, { params }) {
  const { width, height } = params;
  
  // Parse dimensions with fallbacks
  const w = parseInt(width) || 100;
  const h = parseInt(height) || 100;
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#2A3A5A"/>
      <circle cx="${w/2}" cy="${h/2}" r="${Math.min(w, h) * 0.4}" fill="#3B4D6B"/>
      <path d="M${w*0.3},${h*0.35} C${w*0.4},${h*0.2} ${w*0.6},${h*0.2} ${w*0.7},${h*0.35} C${w*0.75},${h*0.4} ${w*0.75},${h*0.5} ${w*0.7},${h*0.55} C${w*0.6},${h*0.7} ${w*0.4},${h*0.7} ${w*0.3},${h*0.55} C${w*0.25},${h*0.5} ${w*0.25},${h*0.4} ${w*0.3},${h*0.35} Z" fill="#1F2A40"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${Math.min(w, h) * 0.1}px" fill="#8BA0C3" text-anchor="middle" dominant-baseline="middle">Avatar</text>
    </svg>
  `;
  
  // Return the SVG with appropriate headers
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
