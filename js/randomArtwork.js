// Get a random artwork that isn't in approvedArtworks or discardedArtworks 
export function randomArtwork(data, approvedArtworks, discardedArtworks) {
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