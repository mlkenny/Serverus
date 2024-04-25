package Backend;

import org.bson.Document;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;

public class Location {
    String type;
    Resource resource;

    MongoClient mongoClient = MongoClients.create("mongodb+srv://AdminUser:3HeadsBetter1Head@serverus.iesu5ia.mongodb.net/");
    MongoDatabase database = mongoClient.getDatabase("ServerusDatabase");
    MongoCollection<Document> collection = database.getCollection("Places");

    public Location(Document document, String type){
        this.type = type;

        FindIterable<Document> cursor = collection.find(document);
        try (final MongoCursor<Document> cursorIterator = cursor.cursor()){
            resource = new Resource(collection.find(document));
        } catch (Exception e) {
            resource = new Resource(document);
        }
    }

    public String getLocation(){
       return resource.getResource();
    }
}
