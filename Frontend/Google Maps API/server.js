const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser'); // Import body-parser middleware

const app = express();
app.use(bodyParser.json()); // Add JSON body parsing middleware

const apiKey = 'AIzaSyB3LZKYMSE96H4dshwCak9bHAltzDY8w1Y'; // Replace 'YOUR_API_KEY' with your actual API key
const searchText = 'homeless shelters';

// Define a route to handle POST requests from the client
app.post('/searchShelters', async (req, res) => {
    // Extract the zipcode from the request body
    const { zipcode } = req.body;

    // Construct the request body for Google Places API
    const requestBody = {
        textQuery: `${searchText} in ${zipcode}`
    };

    // Define the URL for the Text Search endpoint
    const apiUrl = `https://places.googleapis.com/v1/places:searchText`;

    try {
        // Make a POST request to the Google Places API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Error fetching data from Google Places API');
        }

        const data = await response.json();
        res.json(data); // Send the response back to the client
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching data from Google Places API' });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
