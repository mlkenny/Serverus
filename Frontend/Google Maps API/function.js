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
const apiKey = 'INPUT KEY'; // Input your API key here.

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

    // Get the current page URL or any other identifier
    var currentPage = window.location.href;

    // Define the textQuerySearch based on the current page
    var textQuerySearch;
    if (currentPage.includes('shelters')) {
        textQuerySearch = `homeless shelters in ${zipCode}`;
    } else if (currentPage.includes('food-banks')) {
        textQuerySearch = `food banks in ${zipCode}`;
    } else if (currentPage.includes('hospitals')) {
        textQuerySearch = `hospitals in ${zipCode}`;
    } else {
        // Default to a generic search if the page doesn't match any specific criteria
        textQuerySearch = `services in ${zipCode}`;
    }

    // Fetch data based on the textQuerySearch
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
        return response.json();
    })
    .then(data => {
        // Process the response data and update the UI accordingly based on the current page, must change this depending on the pages set from HTML
        if (currentPage.includes('shelters')) {
            displayShelters(data);
        } else if (currentPage.includes('food-banks')) {
            displayFoodBanks(data);
        } else if (currentPage.includes('Front')) { // For now this is the only one that can be displayed because of testing. 
            displayHealthcare(data);
        } else {
            // Handle default response
            console.log('Default response');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

  
function displayPlaces(places, listElementId, noResultsMessage) {
    // Get the list element from the HTML
    var list = document.getElementById(listElementId);
        
    // Clear any previous results
    list.innerHTML = '';
    
    // Check if places is an object
    if (typeof places !== 'object' || places === null) {
        list.innerHTML = `<li>Error: Invalid data format</li>`;
        return;
    }

    // Access the 'places' array within the object
    var placesArray = places.places;

    // Check if there are any places returned
    if (placesArray.length === 0) {
        list.innerHTML = `<li>${noResultsMessage}</li>`;
        return;
    }

    createMarker(placesArray);
    
    // Iterate through each place object in the 'places' array
    placesArray.forEach(function(place) {
        // Create a list item element
        var listItem = document.createElement('li');

        // Extract displayName and formattedAddress from place object
        var displayName = place.displayName.text; // Access the 'text' property inside 'displayName'
        var formattedAddress = place.formattedAddress;
        var nationalPhoneNumber = place.nationalPhoneNumber;

        // Create a paragraph element to display the place name
        var nameParagraph = document.createElement('p');
        nameParagraph.textContent = `Name: ${displayName}`;

        // Create a paragraph element to display the place address
        var addressParagraph = document.createElement('p');
        addressParagraph.textContent = `Address: ${formattedAddress}`;

        // Create a paragraph element to display the national phone number
        var phoneParagraph = document.createElement('p');
        phoneParagraph.textContent = `Phone Number: ${nationalPhoneNumber}`;

        // Append the name and address paragraphs to the list item
        listItem.appendChild(nameParagraph);
        listItem.appendChild(addressParagraph);
        listItem.appendChild(phoneParagraph);

        if (place.websiteUri) {
            let websitePara = document.createElement('p');
            let websiteLink = document.createElement('a');
            websiteLink.textContent = 'Website';
            websiteLink.title = 'Visit Website';
            websiteLink.href = place.websiteUri;
            websitePara.appendChild(websiteLink);
            listItem.appendChild(websitePara);
        }

        // Button used to favorite 
        var button = document.createElement('button');
        button.textContent = 'Save as Favorite';
        button.addEventListener('click', function() {
            // Add functionality to the button here
            alert(`${displayName} is favorited.`);
        });
        listItem.appendChild(button);

        // Append the list item to the list
        list.appendChild(listItem);
    });
}

function displayShelters(shelters) {
    displayPlaces(
        shelters, // places data
        'shelter-list', // ID of the list element
        'No shelters found nearby' // Message for no results
    );
}

function displayFoodBanks(food) {
    displayPlaces(
        food, // places data
        'food-banks', // ID of the list element
        'No Food Banks found nearby' // Message for no results
    );
}

function displayHealthcare(healthCareCenters) {
    displayPlaces(
        healthCareCenters, // places data
        'healthcare-centers', // ID of the list element
        'No Health Care Centers found nearby' // Message for no results
    );
}
