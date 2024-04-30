//Initializes Map
let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: 38.5816, lng: -121.4944 },
    zoom: 10,
    mapId: "8a056949708ce337",
  });
}

document.addEventListener("DOMContentLoaded", function() {
    // Initialize the map dynamically
    initMap();
});


function loadMarkerLibrary() {
    return new Promise((resolve, reject) => {
        google.maps.importLibrary("marker").then(markerLibrary => {
            resolve(markerLibrary.AdvancedMarkerElement);
        }).catch(error => {
            reject(error);
        });
    });
}

let markers = [];

async function createMarker(places) {
    try {
        // Load the marker library asynchronously
        const AdvancedMarkerElement = await loadMarkerLibrary();

        // Remove existing markers
        markers.forEach(marker => {
            marker.setMap(null); // Remove the marker from the map
        });
        markers = []; // Clear the markers array

        // Define bounds to include all markers
        const bounds = new google.maps.LatLngBounds();

        // Loop through places and create markers
        places.forEach(place => {
            // Ensure the place has a location
            if (place.location && typeof place.location.latitude === 'number' && typeof place.location.longitude === 'number') {
                const position = { lat: place.location.latitude, lng: place.location.longitude };
                const marker = new AdvancedMarkerElement({
                    position: position,
                    map: map,
                    title: place.name
                });
                markers.push(marker); // Add the marker to the markers array

                // Extend bounds to include this marker
                bounds.extend(position);
            }
        });

        // Fit map to bounds to zoom to the searched location
        map.fitBounds(bounds);
        
        // Set max zoom level to prevent zooming in too much if only one marker
        const maxZoom = 15;
        map.setOptions({ maxZoom: maxZoom });
    } catch (error) {
        console.error("Error creating markers:", error);
    }
}




const apiUrl = `https://places.googleapis.com/v1/places:searchText`;
const apiKey = 'AIzaSyDrjiteTAbow8AASp_6lBuGuTzse982CBY'; // Input your API key here.

function handleSearch(location) {
        // Regular expression patterns for city, state, and zip code validation
        var cityStatePattern = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;
        var zipCodePattern = /^\d{5}$|^\d{5}-\d{4}$/;
        var locationInput = document.getElementById('location');
        var location = locationInput.value.trim();
        var hasError = false; // Boolean variable to track the error status

        // Error checking
        if (!cityStatePattern.test(location) && !zipCodePattern.test(location)) { 
            hasError = true;
            // Display an error message or perform an action (e.g., show a pop-up)
            alert('Invalid location. Please enter a valid city, state, or zip code.');
            // Clear the input field
            locationInput.value = '';
            // Focus on the input field
            locationInput.focus();
            return;
        }

    // Get the current page URL or any other identifier
    var currentPage = window.location.href;

    // Pages for search
    var housing = 'housing';
    var health = 'health';
    var food = 'food';

    // Define the textQuerySearch based on the current page
    var textQuerySearch;
    if (currentPage.includes(housing)) {
        textQuerySearch = `homeless shelters in ${location}`;
    } else if (currentPage.includes(food)) {
        textQuerySearch = `food banks in ${location}`;
    } else if (currentPage.includes(health)) {
        textQuerySearch = `hospitals in ${location}`;
    } else {
        // Default to a generic search if the page doesn't match any specific criteria
        textQuerySearch = `services in ${location}`;
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
        // Process the response data and update the UI accordingly based on the current page
        if (currentPage.includes(housing)) {
            displayShelters(data);
        } else if (currentPage.includes(food)) {
            displayFoodBanks(data);
        } else if (currentPage.includes(health)) { 
            displayHealthcare(data);
        } else {
            // Handle default response
            console.log('Default response');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

// Event listener for form submission
document.getElementById('location-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    var location = document.getElementById('location').value; // Get the entered location
    handleSearch(location); // Call the function to handle the search
});

// Event listener for Enter key press in the input field
document.getElementById('location').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission on Enter press
        var location = document.getElementById('location').value; // Get the entered location
        handleSearch(location); // Call the function to handle the search
    }
});

  
function displayPlaces(places, listElementId, noResultsMessage) {
    // Get the list element from the HTML
    var list = document.getElementById(listElementId);
        
    // Check if the list element exists before proceeding
    if (!list) {
        console.error('List element not found:', listElementId);
        return;
    }
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
