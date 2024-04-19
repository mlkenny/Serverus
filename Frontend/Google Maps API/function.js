// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

// Initializes Map
let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: 38.5816, lng: -121.4944 },
    zoom: 10,
  });
}

initMap();




// function searchNearbyShelters(coordinates, zipcode) {
//     // var map = new google.maps.Map(document.getElementById('map'), {
//     //     center: coordinates,
//     //     zoom: 12
//     // });

//     // var request = {
//     //     location: coordinates,
//     //     radius: '5000', // 5000 meters (5 km) radius
//     //     type: ['homeless_shelter'] // Specify the type of place you are searching for
//     // };

//     // var service = new google.maps.places.PlacesService(map);
//     // service.nearbySearch(request, function(results, status) {
//     //     if (status === google.maps.places.PlacesServiceStatus.OK) {
//     //         displayShelters(results, map);
//     //     }
//     // });


//     var enteredZip = zipcode; 
// // var apiKey = 'AIzaSyB3LZKYMSE96H4dshwCak9bHAltzDY8w1Y'; 

// // var apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=homeless+shelters+in+${zipCode}&key=${apiKey}`;


// // Make an HTTP GET request to the Google Maps API
// // fetch(apiUrl)
// //   .then(response => response.json()) // Parse the JSON response
// //   .then(data => {
// //     // Access information from the JSON response
// //     var location = data.results[0].geometry.location;
// //     console.log("Latitude:", location.lat);
// //     console.log("Longitude:", location.lng);
// //   })
// //   .catch(error => {
// //     console.error('Error:', error);
// //   });
// }


function displayShelters(shelters, map) {
    var shelterList = document.getElementById('shelter-list');
    shelterList.innerHTML = ''; // Clear previous results

    shelters.forEach(function(shelter) {
        var marker = new google.maps.Marker({
            position: shelter.geometry.location,
            map: map,
            title: shelter.name
        });
    });

    shelters.forEach(function(shelter) {
        var shelterItem = document.createElement('li');
        shelterItem.textContent = shelter.name;
        shelterList.appendChild(shelterItem);
    });
}


document.getElementById('zip-form').addEventListener('submit', function(event) {
    
    event.preventDefault();
    var zipCode = document.getElementById('zipcode').value;
    var zipCodeError = document.getElementById('zipcodeCheck');
    var hasError = false; // Boolean variable to track the error status

    
    
    // error checking
    if(zipCode.length != 5 || isNaN(zipCode)) {  // isNaN() returns true if there are any letters in the parameters
        hasError = true;
        zipCodeError.style.visibility = 'visible';
        return;
    }

    zipCodeError.style.visibility = 'hidden'; 


    // Geocode the ZIP code to get coordinates
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: zipCode }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            var coordinates = results[0].geometry.location;
            searchNearbyShelters(coordinates, zipCode);
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
});