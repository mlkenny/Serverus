//Initializes Map
let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: 38.5816, lng: -121.4944 },
    zoom: 10,
  });
}

initMap();

function loadMarkerLibrary() {
    return new Promise((resolve, reject) => {
        google.maps.importLibrary("marker").then(markerLibrary => {
            resolve(markerLibrary.AdvancedMarkerElement);
        }).catch(error => {
            reject(error);
        });
    });
}

async function createMarker(places) {
    try {
        // Load the marker library asynchronously
        const AdvancedMarkerElement = await loadMarkerLibrary();

        console.log(places.location);

        // Loop through places and create markers
        places.forEach(place => {
            // Ensure the place has a location
            if (place.location && typeof place.location.lat === 'number' && typeof place.location.lng === 'number') {
                const position = { lat: place.location.lat, lng: place.location.lng };
                const marker = new AdvancedMarkerElement({
                    position: position,
                    map: map,
                    title: place.name
                });
            }
        });        
    } catch (error) {
        console.error("Error creating markers:", error);
    }
}


const apiUrl = `https://places.googleapis.com/v1/places:searchText`;
const apiKey = 'AIzaSyCZ7BOs-nUaIYYPGSrXQHtpHE9lBd-Wr-M'; // Input your API key here.

document.getElementById('zip-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var zipCode = document.getElementById('zipcode').value;
    var zipCodeError = document.getElementById('zipcodeCheck');
    var hasError = false; // Boolean variable to track the error status
  
    // Error checking
    if (zipCode.length != 5 || isNaN(zipCode)) { // isNaN() returns true if there are any letters in the parameters
        hasError = true;
        zipCodeError.style.visibility = 'visible';
        return;
    }
  
    zipCodeError.style.visibility = 'hidden';

    var textQuerySearch = `homeless shelters in ${zipCode}`;
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri,places.location,places.nationalPhoneNumber'
        },
        body: JSON.stringify({textQuery: textQuerySearch})
  })
  .then(response => {
      console.log('Response status code:', response.status); // Log the status code
      return response.json()})
  .then(data => {
      // Process the response data and update the UI accordingly
      displayShelters(data);
  })
  .catch(error => {
      console.error('Error:', error);
  });
});
  
function displayShelters(shelters) {
    // Get the shelter list element from the HTML
    var shelterList = document.getElementById('shelter-list');
        
    // Clear any previous results
    shelterList.innerHTML = '';
    
    // Check if shelters is an object
    if (typeof shelters !== 'object' || shelters === null) {
        shelterList.innerHTML = '<li>Error: Invalid data format</li>';
        return;
    }

    // Access the 'places' array within the object
    var places = shelters.places;

    // Check if there are any shelters returned
    if (places.length === 0) {
        shelterList.innerHTML = '<li>No shelters found nearby</li>';
        return;
    }

    createMarker(places);
    // Iterate through each shelter object in the 'places' array
    places.forEach(function(shelter) {
        // Create a list item element
        var listItem = document.createElement('li');

        // Extract displayName and formattedAddress from shelter object
        var displayName = shelter.displayName.text; // Access the 'text' property inside 'displayName'
        var formattedAddress = shelter.formattedAddress;
        var nationalPhoneNumber = shelter.nationalPhoneNumber;

        // Create a paragraph element to display the shelter name
        var nameParagraph = document.createElement('p');
        nameParagraph.textContent = `Name: ${displayName}`;

        // Create a paragraph element to display the shelter address
        var addressParagraph = document.createElement('p');
        addressParagraph.textContent = `Address: ${formattedAddress}`;

        // Create a paragraph element to display the national phone number
        var phoneParagraph = document.createElement('p');
        phoneParagraph.textContent = `Phone Number: ${nationalPhoneNumber}`;

        // Append the name and address paragraphs to the list item
        listItem.appendChild(nameParagraph);
        listItem.appendChild(addressParagraph);
        listItem.appendChild(phoneParagraph);

        if (shelter.websiteUri) {
            let websitePara = document.createElement('p');
            let websiteLink = document.createElement('a');
            websiteLink.textContent = 'Website';
            websiteLink.title = 'Visit Website';
            websiteLink.href = shelter.websiteUri;
            websitePara.appendChild(websiteLink);
            listItem.appendChild(websitePara);
        }

        var button = document.createElement('button');
        button.textContent = 'Save as Favorite';
        button.addEventListener('click', function() {
            // Add functionality to the button here
            alert(`${displayName} is favorited.`);
        });
        listItem.appendChild(button);

        // Append the list item to the shelter list
        shelterList.appendChild(listItem);
    });
}