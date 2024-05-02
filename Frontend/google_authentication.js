// Simple js function to allow signup page to travel back to main flow.
function toHome() {
    window.location.href = 'index.html';
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile(); // Creates user object here, use this to manipulate user data.
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    // We should check here if profile is a valid profile,
    // and if so only switch page to home if successful.
    window.location.href = 'home.html';
}

function signOut() {
    // Implement this once a sign out area is created, shouldn't be an issue hopefully.
    /*var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });*/
    window.location.href = 'index.html';
}