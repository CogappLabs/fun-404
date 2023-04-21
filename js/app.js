import { generateFormPage } from './generateFormPage.js';
import { getStoredArtwork } from './getStoredArtwork.js';

// Set up empty global variables
let approvedArtworks = {};
let discardedArtworks = {};


// Show or hide caption input based on radio button
let caption = document.getElementById("caption");
let captionLabel = document.getElementById("caption-label");
let sentence = document.getElementById("sentence");

document.getElementById("yes").addEventListener("click", function () {
    if (this.checked) {
        caption.style.display = "inline-block";
        captionLabel.style.display = "block";
        sentence.style.display = "inline-block";
    } else {
        caption.style.display = "none";
        captionLabel.style.display = "none";
        sentence.style.display = "none";
    }
});

document.getElementById("no").addEventListener("click", function () {
    if (this.checked) {
        caption.style.display = "none";
        captionLabel.style.display = "none";
        sentence.style.display = "none";
    }
});


// On page load, randomly show either the form or a 404 page
window.onload = function() {
    // Generate a random number (0 or 1)
    const randomNum = Math.floor(Math.random() * 2);

    // Show the form
    if (randomNum === 0) {
        generateFormPage(approvedArtworks, discardedArtworks);
    } 
    // Show a 404 page
    else {
        let artwork; 

        // If there are approved artworks, get a random artwork
        if (localStorage.getItem('approvedArtworks')) {
            approvedArtworks = JSON.parse(localStorage.getItem('approvedArtworks'));
    
            // Convert object keys to an array
            let keys = Object.keys(approvedArtworks);
    
            // Generate a random index
            let randomIndex = Math.floor(Math.random() * keys.length);
    
            // Get the randomly selected key
            let randomKey = keys[randomIndex];
    
            // Get the value associated with the randomly selected key
            artwork = approvedArtworks[randomKey];
        }

        // If there's an artwork, display it
        if (artwork) {
            document.getElementById("container-form").style.display = "none";
            document.getElementById("container-404").style.display = "block";

            // Generate an OSD viewer for the approved artwork  
            getStoredArtwork(artwork);
        } 
        // If there aren't any approved artworks, show the form instead
        else {
            generateFormPage(approvedArtworks, discardedArtworks);
        }
    }
};






