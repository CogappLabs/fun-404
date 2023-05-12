import { generateOSDViewer } from './generateOSDViewer.js';
import { randomArtwork } from './randomArtwork.js';

// Make an API call to get a random artwork and display in OSD 
export async function getNewArtwork (approvedArtworks, discardedArtworks) {
    try {
        // Get current approvedArtworks
        if (localStorage.getItem('approvedArtworks')) {
            approvedArtworks = JSON.parse(localStorage.getItem('approvedArtworks'));
        }

        // Get current discardedArtworks
        if (localStorage.getItem('discardedArtworks')) {
            discardedArtworks = JSON.parse(localStorage.getItem('discardedArtworks'));
        }
        
        // Store the API response in a variable
        let response = await fetch('https://api.artic.edu/api/v1/artworks/search?query[bool][must][][term][is_public_domain]=true&query[bool][must][][term][has_not_been_viewed_much]=true&limit=50&fields=has_not_been_viewed_much,is_public_domain,title,image_id,id');

        // If the call failed, throw an error
        if (!response.ok) {
            throw 'Something went wrong.';
        }

        // Otherwise, get the post JSON
        let data = await response.json();

        console.log(data);

        // Assign a randomArtwork 
        let artwork = randomArtwork(data, approvedArtworks, discardedArtworks);

        // Fill in the image title and hidden form fields 
        document.getElementById("title").textContent = artwork.title;
        document.getElementById("artwork-title").value = artwork.title;
        document.getElementById("artwork-id").value = artwork.id;
        document.getElementById("artwork-image-id").value = artwork.image_id;

        generateOSDViewer(artwork, 'openseadragon1');

    } catch (error) {
        document.getElementById("container-form").textContent = '[Something went wrong, sorry!]';
        console.warn(error);
    }
}