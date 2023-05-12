import OpenSeadragon from 'openseadragon'

// Generate an OSD viewer for a provided artwork, and display in the relevant container
export function generateOSDViewer(artwork, id) {
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
        let viewer = OpenSeadragon({
            id: id,
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

        return viewer;
    })
    .catch(error => console.error(error));

}