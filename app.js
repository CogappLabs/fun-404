let viewer;
let storedArtworks = {};
let unstoredArtworks = {};
const title = document.getElementById("title");
const title2 = document.getElementById("title2");
// Get the radio button and text input element
const radioYes = document.getElementById("yes");
const radioNo = document.getElementById("no");
const captionLabel = document.getElementById("caption-label");
const caption = document.getElementById("caption");
const captionDisplay = document.getElementById("caption-display");
const artTitle = document.getElementById("artwork-title");
const artID = document.getElementById("artwork-id");
const artImgID = document.getElementById("artwork-image-id");
const submit = document.getElementById("submit");


// Get the form element
let form = document.querySelector('#form');

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
        captionLabel.style.display = "none";
    }
});

// Make an API call to get a random artwork and display in OSD 
async function getArtwork () {
    try {
        // Get current storedArtworks
        if (localStorage.getItem('approvedArtworks')) {
            storedArtworks = JSON.parse(localStorage.getItem('approvedArtworks'));
        }
        

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

            // Check that the image_id isn't the archive image and make sure the ID isn't already a key in storedArtworks
            if (random.image_id != '342b2214-04d5-de63-b577-55a08a618960' && storedArtworks != null) {
                if (!storedArtworks.hasOwnProperty(random.id)) {
                    return random;
                }
            } else if (random.image_id != '342b2214-04d5-de63-b577-55a08a618960' && storedArtworks == null) {
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
        document.getElementById("container-form").textContent = '[Something went wrong, sorry!]';
        console.warn(error);
    }
}

function getStoredArtwork(artwork) {
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
            id: 'openseadragon2',
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

    title2.textContent = artwork.title;
    captionDisplay.textContent = artwork.caption;

    return viewer;
}

// Get artwork data from form and store (or add to discardedArtworks)
function storeArtwork() {
    // Get all of the fields in the form
    let fields = form.elements;

    if (fields.no.checked) {
        // Get current unstoredArtworks
        if (localStorage.getItem('discardedArtworks')) {
            unstoredArtworks = JSON.parse(localStorage.getItem('discardedArtworks'));
        }

        let discardedArtwork = {};

        let discardedID;

        // Loop through each one and remove it from storage
        for (let field of fields) {
            // Only save the field if it has an ID
            if (!field.id) return;
    
            if (field.id == 'artwork-id') {
                discardedID = field.value;
                discardedArtwork['id'] = field.value;
            }
        }
    
        unstoredArtworks[discardedID] = discardedArtwork;
    
        localStorage.setItem('discardedArtworks', JSON.stringify(unstoredArtworks));
    } else {
        // Get current storedArtworks
        if (localStorage.getItem('approvedArtworks')) {
            storedArtworks = JSON.parse(localStorage.getItem('approvedArtworks'));
        }

        let approvedArtwork = {};

        let id;

        approvedArtwork['has_not_been_viewed_much'] = true;
    
        // Loop through each one and remove it from storage
        for (let field of fields) {
            // Only save the field if it has an ID
            if (!field.id) return;
    
            if (field.id == 'artwork-title') {
                approvedArtwork['title'] = field.value;
            }
    
            if (field.id == 'artwork-id') {
                id = field.value;
                approvedArtwork['id'] = field.value;
            }
    
            if (field.id == 'artwork-image-id') {
                approvedArtwork['image_id'] = field.value;
            }
    
            if (field.id == 'caption') {
                approvedArtwork['caption'] = field.value;
            }
        }
    
        storedArtworks[id] = approvedArtwork;
    
        localStorage.setItem('approvedArtworks', JSON.stringify(storedArtworks));
    }
}

window.onload = function() {
    // Generate a random number (0 or 1)
    const randomNum = Math.floor(Math.random() * 2);

    // Show/hide pages based on the random number
    if (randomNum === 0) {
        document.getElementById("container-form").style.display = "block";
        document.getElementById("container-404").style.display = "none";

        // On page load, get a random artwork 
        getArtwork();

        form.addEventListener('submit', storeArtwork);

    } else {
        let artwork; 

        if (localStorage.getItem('approvedArtworks')) {
            storedArtworks = JSON.parse(localStorage.getItem('approvedArtworks'));
    
            // Convert object keys to an array
            let keys = Object.keys(storedArtworks);
    
            // Generate a random index
            let randomIndex = Math.floor(Math.random() * keys.length);
    
            // Get the randomly selected key
            let randomKey = keys[randomIndex];
    
            // Get the value associated with the randomly selected key
            artwork = storedArtworks[randomKey];
        }

        if (artwork) {
            document.getElementById("container-form").style.display = "none";
            document.getElementById("container-404").style.display = "block";

            // On page load, get an approved artwork 
            getStoredArtwork(artwork);
        } else {
            document.getElementById("container-form").style.display = "block";
            document.getElementById("container-404").style.display = "none";
    
            // On page load, get a random artwork 
            getArtwork();
    
            form.addEventListener('submit', storeArtwork);
        }
    }
  };






