import { generateOSDViewer } from './generateOSDViewer.js';

// Generate an OSD viewer for an approved artwork to show on a 404 page
export function getApprovedArtwork(artwork) {
    // Fill in the image title and caption 
    document.getElementById("title2").textContent = artwork.title;
    document.getElementById("caption-display").textContent = artwork.caption;

    generateOSDViewer(artwork, 'openseadragon2');
}