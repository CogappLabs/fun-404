// Add an artwork to the approvedArtworks or discardedArtworks
export function saveToStorage(string, object, fields) {
    // Get current approvedArtworks
    if (localStorage.getItem(string)) {
        object = JSON.parse(localStorage.getItem(string));
    }

    // Create emtpy object and empty variable
    let artwork = {};
    let id;

    // Loop through each field and assign relevant values to approvedArtwork and id
    for (let field of fields) {
        // Only save the field if it has an ID
        if (!field.id) return;

        if (field.id == 'artwork-title') {
            artwork['title'] = field.value;
        }

        if (field.id == 'artwork-id') {
            id = field.value;
            artwork['id'] = field.value;
        }

        if (field.id == 'artwork-image-id') {
            artwork['image_id'] = field.value;
        }

        // Todo: Is there a way to prevent caption being a key on discardedArtworks?
        if (field.id == 'caption') {
            artwork['caption'] = field.value;
        }
    }

    // Add this approved artwork to the stored artworks object 
    object[id] = artwork;

    // Save stored artworks in local storage
    localStorage.setItem(string, JSON.stringify(object));
}