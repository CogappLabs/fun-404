// Get the radio button and text input element
const radioYes = document.getElementById("yes");
const radioNo = document.getElementById("no");
const captionLabel = document.getElementById("caption-label");
const caption = document.getElementById("caption");
const title = document.getElementById("title");
const artTitle = document.getElementById("artwork-title");
const artID = document.getElementById("artwork-id");
const artImgID = document.getElementById("artwork-image-id");
const container = document.getElementById("container");
const submit = document.getElementById("submit");
let viewer;


// Get the form element
let form = document.querySelector('#form');

    // Get all of the fields in the form
    let fields = form.elements;
    console.log(fields.yes.checked);

let storedArtworks = [];

// Add event listener to the radio button
radioYes.addEventListener("click", function () {
    if (radioYes.checked) {
        caption.style.display = "block";
        captionLabel.style.display = "block";
    } else {
        caption.style.display = "none";
        captionLabel.style.display = "none";
    }
});

radioNo.addEventListener("click", function () {
    if (radioNo.checked) {
        caption.style.display = "none";
        caption.style.display = "none";
    }
});

// Make an API call to get a random artwork and display in OSD 
async function getArtwork () {
    try {
        // Run an API call 
        // Create an empty variable to store the response in
        let response;

        response = await fetch('https://api.artic.edu/api/v1/artworks/search?query[term][has_not_been_viewed_much]=true&limit=100&page=10&fields=has_not_been_viewed_much,title,image_id,id');

        // If the call failed, throw an error
        if (!response.ok) {
            throw 'Something went wrong.';
        }

        // Otherwise, get the post JSON
        let data = await response.json();

        function randomArtwork() {
            let random = data.data[Math.floor(Math.random()*data.data.length)];

            if (random.image_id != '342b2214-04d5-de63-b577-55a08a618960') {
                return random;
            } else {
                return randomArtwork();
            }
        }

       let artwork = randomArtwork();

        console.log(artwork);

        let manifestUrl = 'https://api.artic.edu/api/v1/artworks/' + artwork.id + '/manifest.json';

        // Fetch the IIIF manifest
        fetch(manifestUrl)
        .then(response => response.json())
        .then(manifest => {
            // Extract the image URL and tile information from the manifest
            var imageUrl = manifest["sequences"][0]["canvases"][0]["images"][0]["resource"]["@id"];
            var tileWidth = manifest["sequences"][0]["canvases"][0]["images"][0]["resource"]["width"];
            var tileHeight = manifest["sequences"][0]["canvases"][0]["images"][0]["resource"]["height"];
            
            // Construct the OpenSeadragon tileSources object
            var tileSources = [{
                type: 'image',
                url: imageUrl,
                buildPyramid: false,
                tileSize: tileWidth,
                tileOverlap: 0,
                width: tileWidth,
                height: tileHeight
            }];

            // Create the OpenSeadragon viewer with the IIIF manifest as the tile source
            viewer = OpenSeadragon({
                id: 'openseadragon1',
                prefixUrl: '/openseadragon/images/',
                crossOriginPolicy: 'Anonymous',
                showSequenceControl: false,
                showHomeControl: false,
                showZoomControl: false,
                showFullPageControl: false,
                visibilityRatio: 0.3,
                homeFillsViewer: false,
                autoHideControls: true,
                showNavigator: true,
                navigatorPosition: 'TOP_LEFT',
                navigatorAutoFade: true,
                tileSources: tileSources
            });
        })
        .catch(error => console.error(error));

        title.textContent = artwork.title;
        artTitle.value = artwork.title;
        artID.value = artwork.id;
        artImgID.value = artwork.image_id;

        return viewer;

    } catch (error) {
        container.textContent = '[Something went wrong, sorry!]';
        console.warn(error);
    }
}

// Get artwork data from form and store 
function storeArtwork() {
    if (fields.no.checked) {
        return;
    } else {
        let approvedArtwork = {};

        approvedArtwork['has_not_been_viewed_much'] = true;
    
        // Get all of the fields in the form
        let fields = form.elements;
    
        // Loop through each one and remove it from storage
        for (let field of fields) {
            // Only save the field if it has an ID
            if (!field.id) return;
    
            if (field.id == 'artwork-title') {
                approvedArtwork['title'] = field.value;
            }
    
            if (field.id == 'artwork-id') {
                approvedArtwork['id'] = field.value;
            }
    
            if (field.id == 'artwork-image-id') {
                approvedArtwork['image_id'] = field.value;
            }
    
            if (field.id == 'caption') {
                approvedArtwork['caption'] = field.value;
            }
            
    
            // Save field to localStorage
            // localStorage.setItem(prefix + field.id, field.value);
        }
    
        storedArtworks.push({approvedArtwork: approvedArtwork});
    
        localStorage.setItem('approvedArtworks', JSON.stringify(storedArtworks));
    }
}

// On page load, get a random artwork 
document.addEventListener('DOMContentLoaded', getArtwork);

form.addEventListener('submit', storeArtwork);




