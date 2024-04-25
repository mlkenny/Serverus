package Backend;

import org.bson.Document;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

public class Location {
    String type;
    Resource resource;

    MongoClient mongoClient = MongoClients.create("mongodb+srv://AdminUser:3HeadsBetter1Head@serverus.iesu5ia.mongodb.net/");
    MongoDatabase database = mongoClient.getDatabase("ServerusDatabase");
    MongoCollection<Document> collection = database.getCollection("Users");

    public Location(Document document, String type){
        this.type = type;
        if (collection.find(document).cursor() == null){
            resource = new Resource(document);
        }
        else{
            resource = new Resource(collection.find(document).cursor());
        }
    }

    public String getLocation(){
       return resource.getResource();
    }
}
