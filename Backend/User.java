package Backend;
public class User {
    int userID;
    boolean LoggedIn;
    String email;
    String password;
    
    // Logging In
    public void logIn() {
        this.LoggedIn = true;
    }
    // Setters
    public void setID(int userID) {
        this.userID = userID;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    // Getters
    public int getID() {
        return this.userID;
    }
    public String getEmail() {
        return this.email;
    }
    public String getPassword() {
        return this.password;
    }

    /*<- REMOVE THIS WHEN READY TO IMPLEMENT
    // searchEmployment Method: Should return the possible employment opportunities based off the given keywords. 
    //                          Keywords should be given through user input in a text box. (js, html interaction)

    // searchEmployement and searchResources return type may be subject to change to different object if needed.
    public String[] searchEmployment(String[] keywords) {

    }

    // searchResources Method: Return keyword search matches based on given user input in a text box.
    //                         This method should be capable of searching through all kinds of resources.
    //                         eg. Healthcare, Shelters, Food Banks.
    public String[] searchResources(String[] keywords) {

    }

    // saveLocation Method: Allow the user to save specific locations based on if the user selects the star icon.
    //                      Saved locations should be stored in the database under the user's ID.
    public void saveLocations() {

    }

    // submitFeedback Method: Is this necessary at this point with a dedicated feedback page?
    public void submitFeedback() {

    }
    REMOVE THIS WHEN READY TO IMPLEMENT ->*/
}
