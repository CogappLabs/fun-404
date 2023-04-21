import { saveToStorage } from './saveToStorage.js';

// Get artwork data from form and store or discard
export function storeOrDiscardArtwork(approvedArtworks, discardedArtworks) {
    // Get the form element
    let form = document.querySelector('#form');

    // Get all of the fields in the form
    let fields = form.elements;

    // If the no radio button is checked...
    if (fields.no.checked) {
        saveToStorage('discardedArtworks', discardedArtworks, fields);
    } 
    // If the yes radio button is checked 
    else {
        saveToStorage('approvedArtworks', approvedArtworks, fields);
    }
}