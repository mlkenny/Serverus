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

const apiUrl = `https://places.googleapis.com/v1/places:searchText`;
const apiKey = 'INPUTAPI'; // Input your API key here.

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
        searchHousing(location);
        searchFood(location);
        searchMedical(location);
};

function searchHousing(location) {
    // Define the textQuerySearch based on the current page
    var textQuerySearch;
    textQuerySearch = `homeless shelters in ${location}`;

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
        displayShelters(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function searchFood(location) {
    // Define the textQuerySearch based on the current page
    var textQuerySearch;
    textQuerySearch = `food banks in ${location}`;

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
        displayFoodBanks(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function searchMedical(location) {
    // Define the textQuerySearch based on the current page
    var textQuerySearch;
    textQuerySearch = `hospitals in ${location}`;

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
        displayHealthcare(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
  
function displayPlaces(places, listElementId, noResultsMessage, searchType) {
    // Get the list element from the HTML
    var list = document.getElementById(listElementId);
        
    // Clear any previous results
    //list.innerHTML = '';
    
    // Check if places is an object
    if (typeof places !== 'object' || places === null) {
        list.innerHTML = `<li>Error: Invalid data format</li>`;
        return;
    }

    // Access the 'places' array within the object
    var placesArray = places.places;

    if(searchType === 'housing'){
        var housingArray = placesArray;
        printAndCreateMarker(housingArray, searchType, list);
    } else if(searchType === 'food') {
        var foodArray = placesArray;
        printAndCreateMarker(foodArray, searchType, list);
    } else if(searchType === 'health') {
        var healthArray = placesArray;
        printAndCreateMarker(healthArray, searchType, list);
    }

    // Check if there are any places returned
    if (placesArray.length === 0) {
        list.innerHTML = `<li>${noResultsMessage}</li>`;
        return;
    }
}


function displayShelters(shelters) {
    displayPlaces(
        shelters, // places data
        'housing-list', // ID of the list element
        'No shelters found nearby', // Message for no results
        'housing'
    );
}

function displayFoodBanks(food) {
    displayPlaces(
        food, // places data
        'food-list', // ID of the list element
        'No Food Banks found nearby', // Message for no results
        'food'
    );
}

function displayHealthcare(healthCareCenters) {
    displayPlaces(
        healthCareCenters, // places data
        'health-list', // ID of the list element
        'No Health Care Centers found nearby', // Message for no results
        'health'
    );
}

function printAndCreateMarker(placesArray, searchType, list) {
    
    createMarker(placesArray);
    
    // Iterate through each place object in the 'places' array
    placesArray.forEach(function(place) {
        // Create a div element for each search result
        var searchResultDiv = document.createElement('div');
        searchResultDiv.classList.add('search-card', `${searchType}`); // Add appropriate class
        
        // Create a link element
        var link = document.createElement('a');
        link.href = "#"; // Set the href attribute
        
        // Create paragraph elements for the content
        var nameParagraph = document.createElement('p');
        nameParagraph.classList.add('d-flex', 'align-items-center', 'gap-2');
        nameParagraph.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.73073 3.98799L5.56406 0.213668C5.56202 0.211962 5.56011 0.210124 5.55833 0.208167C5.40493 0.0742226 5.20502 0 4.99766 0C4.7903 0 4.59039 0.0742226 4.43698 0.208167L4.43125 0.213668L0.269271 3.98799C0.184374 4.06294 0.116606 4.15399 0.070256 4.25539C0.0239058 4.35678 -1.75223e-05 4.46631 9.62907e-09 4.57704V9.19993C9.62907e-09 9.41212 0.0877973 9.61562 0.244078 9.76567C0.400358 9.91571 0.61232 10 0.833333 10H3.33333C3.55435 10 3.76631 9.91571 3.92259 9.76567C4.07887 9.61562 4.16667 9.41212 4.16667 9.19993V6.79973H5.83333V9.19993C5.83333 9.41212 5.92113 9.61562 6.07741 9.76567C6.23369 9.91571 6.44565 10 6.66667 10H9.16667C9.38768 10 9.59964 9.91571 9.75592 9.76567C9.9122 9.61562 10 9.41212 10 9.19993V4.57704C10 4.46631 9.97609 4.35678 9.92974 4.25539C9.88339 4.15399 9.81563 4.06294 9.73073 3.98799ZM9.16667 9.19993H6.66667V6.79973C6.66667 6.58754 6.57887 6.38404 6.42259 6.23399C6.26631 6.08395 6.05435 5.99966 5.83333 5.99966H4.16667C3.94565 5.99966 3.73369 6.08395 3.57741 6.23399C3.42113 6.38404 3.33333 6.58754 3.33333 6.79973V9.19993H0.833333V4.57704L0.839063 4.57204L5 0.799218L9.16146 4.57104L9.16719 4.57604L9.16667 9.19993Z" fill="#818181"/></svg> ${place.displayName.text}`;

        var addressParagraph = document.createElement('p');
        addressParagraph.classList.add('d-flex', 'align-items-center', 'gap-2');
        addressParagraph.innerHTML = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1.04714C5.06745 1.04714 4.65262 1.21271 4.34677 1.50742C4.04091 1.80213 3.86908 2.20185 3.86908 2.61864C3.86908 3.03543 4.04091 3.43515 4.34677 3.72986C4.65262 4.02458 5.06745 4.19015 5.5 4.19015C5.93255 4.19015 6.34738 4.02458 6.65323 3.72986C6.95909 3.43515 7.13092 3.03543 7.13092 2.61864C7.13092 2.20185 6.95909 1.80213 6.65323 1.50742C6.34738 1.21271 5.93255 1.04714 5.5 1.04714ZM2.7818 2.61864C2.78191 2.12308 2.92792 1.63771 3.20287 1.21891C3.47783 0.800117 3.87044 0.465075 4.33512 0.252702C4.7998 0.0403295 5.31747 -0.0406595 5.82801 0.0191417C6.33855 0.0789428 6.82101 0.27708 7.21935 0.590541C7.61769 0.904002 7.91557 1.31992 8.07839 1.79C8.2412 2.26007 8.26228 2.76501 8.13916 3.24617C8.01605 3.72732 7.7538 4.16495 7.38286 4.50822C7.01193 4.85149 6.54755 5.08632 6.04364 5.18543V8.38083H4.95636V5.18543C4.34249 5.06449 3.79079 4.74299 3.39456 4.27529C2.99833 3.80759 2.78188 3.22239 2.7818 2.61864ZM0.664327 5.23782H3.32544V6.28549H1.63744L1.21449 9.95233H9.78551L9.36256 6.28549H7.67456V5.23782H10.3357L11 11H0L0.664327 5.23782Z" fill="#818181"/></svg> ${place.formattedAddress}`;

        var linkParagraph = document.createElement('p');
        linkParagraph.classList.add('d-flex', 'align-items-center', 'gap-2');
        if (place.websiteUri) {
            linkParagraph.innerHTML = `<a href="${place.websiteUri}" target="_blank">${place.websiteUri}</a>`;
        } else {
            linkParagraph.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.83929 1.62509L5.73212 0.732252C5.96428 0.500099 6.23988 0.315946 6.5432 0.190306C6.84652 0.0646661 7.17162 3.45934e-09 7.49994 0C7.82825 -3.45934e-09 8.15335 0.064666 8.45667 0.190306C8.75999 0.315946 9.0356 0.500099 9.26775 0.732252C9.4999 0.964404 9.68405 1.24001 9.80969 1.54333C9.93533 1.84665 10 2.17175 10 2.50006C10 2.82838 9.93533 3.15348 9.80969 3.4568C9.68405 3.76012 9.4999 4.03572 9.26775 4.26788L7.48208 6.05354C7.24994 6.28571 6.97433 6.46988 6.67101 6.59553C6.36769 6.72118 6.04259 6.78585 5.71427 6.78585C5.38595 6.78585 5.06085 6.72118 4.75752 6.59553C4.4542 6.46988 4.1786 6.28571 3.94646 6.05354C3.85188 5.95193 3.80038 5.81761 3.80278 5.67882C3.80517 5.54002 3.86128 5.40756 3.95931 5.30928C4.0576 5.21125 4.19006 5.15514 4.32885 5.15274C4.46765 5.15034 4.60197 5.20185 4.70358 5.29642C4.83616 5.42941 4.99368 5.53493 5.16711 5.60693C5.34054 5.67892 5.52648 5.71599 5.71427 5.71599C5.90205 5.71599 6.08799 5.67892 6.26142 5.60693C6.43486 5.53493 6.59238 5.42941 6.72496 5.29642L8.51062 3.51075C8.76563 3.24008 8.90517 2.88072 8.89963 2.50888C8.89409 2.13705 8.74392 1.78199 8.48096 1.51904C8.21801 1.25608 7.86295 1.10591 7.49112 1.10037C7.11928 1.09483 6.75992 1.23437 6.48925 1.48938L5.59641 2.38221C5.4948 2.47678 5.36048 2.52829 5.22169 2.52589C5.08289 2.52349 4.95043 2.46738 4.85215 2.36935C4.75412 2.27107 4.69801 2.13861 4.69561 1.99981C4.69321 1.86102 4.74471 1.7267 4.83929 1.62509ZM9.16667 9.19993H6.66667V6.79973C6.66667 6.58754 6.57887 6.38404 6.42259 6.23399C6.26631 6.08395 6.05435 5.99966 5.83333 5.99966H4.16667C3.94565 5.99966 3.73369 6.08395 3.57741 6.23399C3.42113 6.38404 3.33333 6.58754 3.33333 6.79973V9.19993H0.833333V4.57704L0.839063 4.57204L5 0.799218L9.16146 4.57104L9.16719 4.57604L9.16667 9.19993Z" fill="#818181"/></svg> No link available`;
        }
        
        // Append the paragraphs to the link element
        link.appendChild(nameParagraph);
        link.appendChild(addressParagraph);
        link.appendChild(linkParagraph);
        
        // Append the link element to the search result div
        searchResultDiv.appendChild(link);
        
        // Append the search result div to the list element
        list.appendChild(searchResultDiv);
    });
}

// For filtering
// Add event listeners to filter buttons
document.getElementById('all-filter').addEventListener('click', function() {
    filterSelection('all'); // Filter results for food
});

document.getElementById('food-filter').addEventListener('click', function() {
    filterSelection('all');
    filterFoodSelection('food'); // Filter results for food
});

document.getElementById('housing-filter').addEventListener('click', function() {
    filterSelection('all');
    filterHouseSelection('housing'); // Filter results for housing
});

document.getElementById('health-filter').addEventListener('click', function() {
    filterSelection('all');
    filterHealthSelection('health'); // Filter results for health
});

function filterSelection(category) {
    var searchResults = document.querySelectorAll('.search-card'); // Get all search result cards

    // Loop through each search result card
    searchResults.forEach(function(result) {
        // Check if the result belongs to the selected category
        if (category === 'all') {
            result.style.display = ''; // Display the result
        } else if(result.classList.contains(category)){
            result.style.display = 'none'; // Display the result
        } 
        else {
            result.style.display = 'none'; // Hide the result
        }
    });
}

function filterFoodSelection(category) {
    var housingResults = document.querySelectorAll('.search-card.housing'); // Get all search result cards
    var healthResults = document.querySelectorAll('.search-card.health'); // Get all search result cards

    // Loop through each search result card
    housingResults.forEach(function(result) {
        // Check if the result belongs to the selected category
        if (category === 'all') {
            result.style.display = 'none'; // Display the result
        } else if(result.classList.contains(category)){
            result.style.display = ''; // Display the result
        } 
        else {
            result.style.display = 'none'; // Hide the result
        }
    });
    // Loop through each search result card
    healthResults.forEach(function(result) {
        // Check if the result belongs to the selected category
        if (category === 'all') {
            result.style.display = 'none'; // Display the result
        } else if(result.classList.contains(category)){
            result.style.display = ''; // Display the result
        } 
        else {
            result.style.display = 'none'; // Hide the result
        }
    });
}

function filterHouseSelection(category) {
    var foodResults = document.querySelectorAll('.search-card.food'); // Get all search result cards
    var healthResults = document.querySelectorAll('.search-card.health'); // Get all search result cards

    // Loop through each search result card
    foodResults.forEach(function(result) {
        // Check if the result belongs to the selected category
        if (category === 'all') {
            result.style.display = 'none'; // Display the result
        } else if(result.classList.contains(category)){
            result.style.display = ''; // Display the result
        } 
        else {
            result.style.display = 'none'; // Hide the result
        }
    });
    // Loop through each search result card
    healthResults.forEach(function(result) {
        // Check if the result belongs to the selected category
        if (category === 'all') {
            result.style.display = 'none'; // Display the result
        } else if(result.classList.contains(category)){
            result.style.display = ''; // Display the result
        } 
        else {
            result.style.display = 'none'; // Hide the result
        }
    });
}

function filterHealthSelection(category) {
    var foodResults = document.querySelectorAll('.search-card.food'); // Get all search result cards
    var housingResults = document.querySelectorAll('.search-card.housing'); // Get all search result cards

    // Loop through each search result card
    housingResults.forEach(function(result) {
        // Check if the result belongs to the selected category
        if (category === 'all') {
            result.style.display = 'none'; // Display the result
        } else if(result.classList.contains(category)){
            result.style.display = ''; // Display the result
        } 
        else {
            result.style.display = 'none'; // Hide the result
        }
    });
    // Loop through each search result card
    foodResults.forEach(function(result) {
        // Check if the result belongs to the selected category
        if (category === 'all') {
            result.style.display = 'none'; // Display the result
        } else if(result.classList.contains(category)){
            result.style.display = ''; // Display the result
        } 
        else {
            result.style.display = 'none'; // Hide the result
        }
    });
}