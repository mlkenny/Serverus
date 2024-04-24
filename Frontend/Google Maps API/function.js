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

const apiUrl = `https://places.googleapis.com/v1/places:searchText`;
const apiKey = 'Input your API key here'; // Input your API key here.

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
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri'
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

    // Iterate through each shelter object in the 'places' array
    places.forEach(function(shelter) {
        // Create a list item element
        var listItem = document.createElement('li');

        // Extract displayName and formattedAddress from shelter object
        var displayName = shelter.displayName.text; // Access the 'text' property inside 'displayName'
        var formattedAddress = shelter.formattedAddress;

        // Create a paragraph element to display the shelter name
        var nameParagraph = document.createElement('p');
        nameParagraph.textContent = `Name: ${displayName}`;

        // Create a paragraph element to display the shelter address
        var addressParagraph = document.createElement('p');
        addressParagraph.textContent = `Address: ${formattedAddress}`;

        // Append the name and address paragraphs to the list item
        listItem.appendChild(nameParagraph);
        listItem.appendChild(addressParagraph);

        if (shelter.websiteUri) {
            let websitePara = document.createElement('p');
            let websiteLink = document.createElement('a');
            websiteLink.textContent = 'Website';
            websiteLink.title = 'Visit Website';
            websiteLink.href = shelter.websiteUri;
            websitePara.appendChild(websiteLink);
            listItem.appendChild(websitePara);
        }

        // Append the list item to the shelter list
        shelterList.appendChild(listItem);
    });
}