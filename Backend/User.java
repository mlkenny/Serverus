package Backend;

import java.util.ArrayList;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Projections;
import com.mongodb.client.model.Updates;

public class User {
    ObjectId userID;
        boolean LoggedIn;
        
        ArrayList<Location> locations;

            //Creates a connection to the Client, the specific database, and the collection 
        MongoClient mongoClient = MongoClients.create("mongodb+srv://AdminUser:3HeadsBetter1Head@serverus.iesu5ia.mongodb.net/");
        MongoDatabase database = mongoClient.getDatabase("ServerusDatabase");
        MongoCollection<Document> collection = database.getCollection("Users");


        // Data is stored primarily via Bson Objects and other special data types, and a lot of interaction is done via
        // the MongoDB dependancy (outlined in pom.xml). Below is the documentation for each of these things:
        // -Bson Documentation: https://mongodb.github.io/mongo-java-driver/5.0/apidocs/bson/index.html
        // -MongoDB Documentation: https://mongodb.github.io/mongo-java-driver/5.0/apidocs/mongodb-driver-sync/index.html
        // -Extra MongoDB in Java Documentation: https://www.mongodb.com/docs/drivers/java/sync/current/quick-start/


        public static void main(String[] args) {
                //Tests the constructor. WORKS
            User test = new User("John@email.com", "1234");

                //Tests the setPassword function. WORKS
            test.setPassword("0000");
            System.out.println(test.getPassword());

                //Tests the saveLocation function. WORKS
            test.saveLocation("shelter", "U.N Owen", "10148 Frank Greg Way", "11111111", "Certainly a place.");
            test.saveLocation("healthcare", "Feel Better", "69420 Hahaha Road", "2222222", "Certainly a place.");
                
                //Tests the general getLocations function. WORKS
            System.out.println(test.getLocations());
                
                //Tests the specific getLocations function. DOESN'T WORK YET
            System.out.println("\n" + test.getLocations("shelter"));
        }

        public User(String email, String password){
            
                //Creates a new document (composed of keys and values) and adds it to the collection
            Document document = new Document();
            document.put("email", email);
            document.put("password", password);
            collection.insertOne(document);
            
                //Creates a new document to use in the collection.find() function, allowing the created data to be queried
            Document searchQuery = new Document("email", email);
            try (MongoCursor<Document> cursorIterator = collection.find(searchQuery).cursor()) {

                    //Uses a Document to make a temporary copy of the document in the collection
                Document temp = cursorIterator.next();

                    //gets the value of the key "_id", then stores it as an ObjectId.
                    //IMPORTANT: Generated mongoDB ids are ObjectIDs by nature, and this cannot
                    //be directly type casted into a String or Int! See getID() for that.
                userID = temp.getObjectId("_id");
            }   
        }

        // Logging In
        public void logIn() {
            this.LoggedIn = true;
        }
        public void logOut(){
            this.LoggedIn = false;
        }

        // Setters
        public boolean setPassword(String password) {
                //Finds the user based on their id
            Document searchQuery = new Document("_id", userID);
            try (MongoCursor<Document> cursorIterator = collection.find(searchQuery).cursor()) {
                Document temp = cursorIterator.next();

                    //Checks if the new password is unique from the old one
                if (temp.get("password") != password) {
                        //Empties searchQuery Document
                    searchQuery.clear();
                    searchQuery.put("password", temp.get("password"));
                    
                        //I don't know why, but this dual document system is important for updateOne().
                    Document newDocument = new Document("password", password);
                    Document updateObject = new Document("$set", newDocument);
                    
                        //Updates the value at the given point in the collection with the new one
                        //In this case, changes your password
                    collection.updateOne(searchQuery, updateObject);

                    return true;    
                }
                    //Returns false if they're not different
                else
                    return false;
            }
        }

        // Getters
        public String getID() {
                //calls the ObjectID toString() function.
            return userID.toString();
        }
        public String getEmail() {
            Document searchQuery = new Document("_id", userID);
            FindIterable<Document> cursor = collection.find(searchQuery);
            try (final MongoCursor<Document> cursorIterator = cursor.cursor()) {
                Document temp = cursorIterator.next();
                return temp.getString("email");
            }
        }
        public String getPassword() {
            Document searchQuery = new Document("_id", userID);
            FindIterable<Document> cursor = collection.find(searchQuery);
            try (final MongoCursor<Document> cursorIterator = cursor.cursor()) {
                Document temp = cursorIterator.next();
                return temp.getString("password");
            }
        }
        
        //Playing with locations 
        public void savePlace(String type, String name, String address, String phone, String description){
                //A new document with all the data on the location to be saved
                Document newDocument = new Document();
                newDocument.put("name", name);
                newDocument.put("type", type);
                newDocument.put("address", address);
                newDocument.put("phone", phone);
                newDocument.put("description", description);

                Location location = new Location(newDocument, type);
                locations.add(location);
        }
        public String getPlaces(){

            String places = "";

            for (int n = 0; n < locations.size(); n++)
            {
                places += locations.get(n).getLocation() + "\n\n";
            }

            return places;
        }
        public String getPlaces(String types){

            String places = "";

            for (int n = 0; n < locations.size(); n++)
            {
                if (locations.get(n).type == types)
                    places += locations.get(n).getLocation() + "\n\n";
            }

            return places;
        }

        //Extras?
        public void saveLocation(String type, String name, String address, String phone, String description){
            
                //Creates a Bson filter. in this case, key equal to "_id" and a value equal to the userID
            Bson filter = Filters.eq("_id", userID);
            
                //A new document with all the data on the location to be saved
            Document newDocument = new Document();
            newDocument.put("name", name);
            newDocument.put("type", type);
            newDocument.put("address", address);
            newDocument.put("phone", phone);
            newDocument.put("description", description);
        
                //
            Bson update = Updates.push("Locations", newDocument);

            collection.findOneAndUpdate(filter, update);
        }

        public String getLocations()
        {
                //Filters nothing (ie returns everything)
            Bson filter = Filters.empty();
                //Tells it to project any field that's labeled "Locations", and exclude the ObjectID when projecting
            Bson projection = Projections.fields(Projections.include("Locations"), Projections.excludeId());

                //Returns the list of all saved locations
                //NOTE: .find() returns a data type of FindIterable<Document>. You have to use something like .first()
                //to make that a Document, then use something like .toString() to make it a String
            return collection.find(filter).projection(projection).first().toString();
        }
            //FIX!
        public String getLocations(String type)
        {
            
            Bson filter = Filters.type("type",type);
                //Tells it to project any field that's labeled "Locations", and exclude the ObjectID when projecting
            Bson projection = Projections.fields(Projections.include("Locations"), Projections.excludeId());

            return collection.find(filter).projection(projection).first().toString();
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