// Initializes Map
// let map;

// async function initMap() {
//   const { Map } = await google.maps.importLibrary("maps");

//   map = new Map(document.getElementById("map"), {
//     center: { lat: 38.5816, lng: -121.4944 },
//     zoom: 10,
//   });
// }

// initMap();


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

  // Make a request to the server's /searchShelters endpoint
  fetch('/searchShelters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ zipcode: zipCode })
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

  // Check if there are any shelters returned
  if (shelters.length === 0) {
      shelterList.innerHTML = '<li>No shelters found nearby</li>';
      return;
  }

  // Iterate through each shelter and create a list item for each one
  shelters.forEach(shelter => {
      // Create a list item element
      var listItem = document.createElement('li');

      // Create a paragraph element to display the shelter name
      var nameParagraph = document.createElement('p');
      nameParagraph.textContent = `Name: ${shelter.name}`;

      // Create a paragraph element to display the shelter address
      var addressParagraph = document.createElement('p');
      addressParagraph.textContent = `Address: ${shelter.formatted_address}`;

      // Append the name and address paragraphs to the list item
      listItem.appendChild(nameParagraph);
      listItem.appendChild(addressParagraph);

      // Append the list item to the shelter list
      shelterList.appendChild(listItem);
  });
}
