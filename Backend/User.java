package Backend;

import java.util.ArrayList;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;

public class User {
        ObjectId userID;
        boolean LoggedIn;
        
        ArrayList<Location> locations = new ArrayList<Location>();

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
            test.savePlace("shelter", "U.N Owen", "10148 Frank Greg Way", "11111111", "Certainly a place.");
            test.savePlace("healthcare", "Feel Better", "69420 Hahaha Road", "2222222", "Certainly a place.");
                
                //Tests the general getPlaces function. WORKS
            System.out.println(test.getPlaces());
                
                //Tests the specific getPlaces function. WORKS
            System.out.println("\n" + test.getPlaces("shelter"));
            
                //Tests on adding shelters in the database to the User
            test.savePlace("shelter", "U.N Owen", "10148 Frank Greg Way", "11111111", "Certainly a place.");
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
        public boolean savePlace(String type, String name, String address, String phone, String description){
                //A new document with all the data on the location to be saved
            Document newDocument = new Document();
            newDocument.put("name", name);
            newDocument.put("type", type);
            newDocument.put("address", address);
            newDocument.put("phone", phone);
            newDocument.put("description", description);
            Location location = new Location(newDocument, type);

            if (checkUnique(location)){
                locations.add(location);
                return true;
            }
            else{
                return false;
            }
        }
        public boolean checkUnique(Location location){
            for (int n = 0; n < locations.size(); n++){
                if (location.getId() == locations.get(n).getId())
                    return false;
            }

            return true;
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
        public void removePlace(String name){
            for (int n = 0; n < locations.size(); n++)
            {
                if (name == locations.get(n).getName())
                    locations.remove(n);
            }
        }
        
    /*<- REMOVE THIS WHEN READY TO IMPLEMENT
    searchEmployment Method: Should return the possible employment opportunities based off the given keywords. 
                             Keywords should be given through user input in a text box. (js, html interaction)

    searchEmployement and searchResources return type may be subject to change to different object if needed.
    public String[] searchEmployment(String[] keywords) {}
    */
}