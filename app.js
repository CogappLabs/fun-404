// Get the container and button elements
let container = document.querySelector('#sunrise-container');
let btn = document.querySelector('#btn');


// Make an API call 
async function getArtwork () {
    try {


        // Run an API call 
        // Create an empty variable to store the response in
        let response;

        response = await fetch('https://api.artic.edu/api/v1/artworks/search?query[term][has_not_been_viewed_much]=true&limit=100&page=10&fields=has_not_been_viewed_much,title,image_id,id');
        // response = await fetch('https://api.artic.edu/api/v1/artworks?fields=title,image_id,has_not_been_viewed_much,id/search?query[term][has_not_been_viewed_much]=true?page=100&limit=100');

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

        let artwork  = randomArtwork();

        console.log('https://www.artic.edu/iiif/2/' + artwork.image_id + '/full/843,/0/default.jpg');

        return 'https://www.artic.edu/iiif/2/' + artwork.image_id + '/full/843,/0/default.jpg';

    } catch (error) {
        container.textContent = '[Something went wrong, sorry!]';
        console.warn(error);
    }
}

// When the button is clicked, get the sun data
btn.addEventListener('click', getArtwork);
