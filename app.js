let viewer;
let approvedArtworks = {};
let discardedArtworks = {};
let caption = document.getElementById("caption");
let captionLabel = document.getElementById("caption-label");
let sentence = document.getElementById("sentence");


// Get the form element
let form = document.querySelector('#form');

// Show or hide caption input based on radio button
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


// Get a random artwork that isn't in approvedArtworks or discardedArtworks 
function randomArtwork(data, approvedArtworks, discardedArtworks) {
    let random = data.data[Math.floor(Math.random()*data.data.length)];

    // Check that the image_id isn't the archive image and make sure the ID isn't already a key in approvedArtworks
    if (random.image_id != '342b2214-04d5-de63-b577-55a08a618960' 
        && (approvedArtworks == null || !approvedArtworks.hasOwnProperty(random.id)) 
        && (discardedArtworks == null || !discardedArtworks.hasOwnProperty(random.id))) {
            return random;
        } else {
            return randomArtwork(data, approvedArtworks, discardedArtworks);
        }
}


// Make an API call to get a random artwork and display in OSD 
async function getArtwork () {
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
        let response = await fetch('https://api.artic.edu/api/v1/artworks/search?query[term][has_not_been_viewed_much]=true&limit=100&page=10&fields=has_not_been_viewed_much,title,image_id,id');

        // If the call failed, throw an error
        if (!response.ok) {
            throw 'Something went wrong.';
        }

        // Otherwise, get the post JSON
        let data = await response.json();

        // Assign a randomArtwork 
        let artwork = randomArtwork(data, approvedArtworks, discardedArtworks);

        // Construct the manifest url 
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

        // Fill in the image title and hidden form fields 
        document.getElementById("title").textContent = artwork.title;
        document.getElementById("artwork-title").value = artwork.title;
        document.getElementById("artwork-id").value = artwork.id;
        document.getElementById("artwork-image-id").value = artwork.image_id;

        return viewer;

    } catch (error) {
        document.getElementById("container-form").textContent = '[Something went wrong, sorry!]';
        console.warn(error);
    }
}


// Todo: A lot of this is the same as another function. Can you extract?
// Generate an OSD viewer for an approved artwork to show on a 404 page
function getStoredArtwork(artwork) {
    // Construct the manifest url
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

    // Fill in the image title and caption 
    document.getElementById("title2").textContent = artwork.title;
    document.getElementById("caption-display").textContent = artwork.caption;

    return viewer;
}


// Todo: There is some repitition in this? Can you get rid of?
// Get artwork data from form and store or discard
function storeArtwork() {
    // Get all of the fields in the form
    let fields = form.elements;

    // If the no radio button is checked...
    if (fields.no.checked) {
        // Get current discardedArtworks
        if (localStorage.getItem('discardedArtworks')) {
            discardedArtworks = JSON.parse(localStorage.getItem('discardedArtworks'));
        }

        // Create emtpy object and empty variable
        let discardedArtwork = {};
        let discardedID;

        // Loop through each field and assign relevant values to discardedArtwork and discardedID
        for (let field of fields) {
            // Only save the field if it has an ID
            if (!field.id) return;
    
            if (field.id == 'artwork-id') {
                discardedID = field.value;
                discardedArtwork['id'] = field.value;
            }
        }
    
        // Add this discarded artwork to the discarded artworks object 
        discardedArtworks[discardedID] = discardedArtwork;
    
        // Save discarded artworks in local storage
        localStorage.setItem('discardedArtworks', JSON.stringify(discardedArtworks));
    } 
    // If the yes radio button is checked 
    else {
        // Get current approvedArtworks
        if (localStorage.getItem('approvedArtworks')) {
            approvedArtworks = JSON.parse(localStorage.getItem('approvedArtworks'));
        }

        // Create emtpy object and empty variable
        let approvedArtwork = {};
        let id;
    
        // Loop through each field and assign relevant values to approvedArtwork and id
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
    
        // Add this approved artwork to the stored artworks object 
        approvedArtworks[id] = approvedArtwork;
    
        // Save stored artworks in local storage
        localStorage.setItem('approvedArtworks', JSON.stringify(approvedArtworks));
    }
}


// On page load, randomly show either the form or a 404 page
window.onload = function() {
    // Generate a random number (0 or 1)
    const randomNum = Math.floor(Math.random() * 2);

    // Show the form
    if (randomNum === 0) {
        document.getElementById("container-form").style.display = "block";
        document.getElementById("container-404").style.display = "none";

        // Get a random artwork for review
        getArtwork();

        // Listen for form submission
        form.addEventListener('submit', storeArtwork);

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
        // Todo: Extract this as it's reused
        // If there aren't any approved artworks, show the form instead
        else {
            document.getElementById("container-form").style.display = "block";
            document.getElementById("container-404").style.display = "none";
    
            // Get a random artwork for review 
            getArtwork();
    
            // Listen for form submission
            form.addEventListener('submit', storeArtwork);
        }
    }
  };






