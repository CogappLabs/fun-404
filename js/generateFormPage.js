import { getNewArtwork } from './getNewArtwork.js';
import { storeOrDiscardArtwork } from './storeOrDiscardArtwork.js';

// Generate the form page
export function generateFormPage(approvedArtworks, discardedArtworks) {
    // Get the form element
    let form = document.querySelector('#form');

    document.getElementById("container-form").style.display = "block";
    document.getElementById("container-404").style.display = "none";

    // Get a new artwork for review
    getNewArtwork(approvedArtworks, discardedArtworks);

    // Store or discard the artwork based on the users form submission
    form.addEventListener('submit', storeOrDiscardArtwork.bind(approvedArtworks, discardedArtworks));
}