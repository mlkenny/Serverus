package Backend;


import org.bson.Document;
import org.bson.types.ObjectId;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
public class Resource {

ObjectId resourceId;

    MongoClient mongoClient = MongoClients.create("mongodb+srv://AdminUser:3HeadsBetter1Head@serverus.iesu5ia.mongodb.net/");
    MongoDatabase database = mongoClient.getDatabase("ServerusDatabase");
    MongoCollection<Document> collection = database.getCollection("Places");

    public Resource(Document document){

        collection.insertOne(document);
        
        MongoCursor<Document> cursorIterator = collection.find(document).cursor();

            //Uses a Document to make a temporary copy of the document in the collection
        Document temp = cursorIterator.next();

            //gets the value of the key "_id", then stores it as an ObjectId.
            //IMPORTANT: Generated mongoDB ids are ObjectIDs by nature, and this cannot
            //be directly type casted into a String or Int! See getID() for that.
        resourceId = temp.getObjectId("_id");
    }
    public Resource(MongoCursor<Document> traceOn){
        Document temp = traceOn.next();
        resourceId = temp.getObjectId("_id");
    }
    public String getResource(){
        Document searchQuery = new Document("_id", resourceId);
            FindIterable<Document> cursor = collection.find(searchQuery);
            try (final MongoCursor<Document> cursorIterator = cursor.cursor()) {
                Document temp = cursorIterator.next();
                return temp.toString();
            }
    }
}
