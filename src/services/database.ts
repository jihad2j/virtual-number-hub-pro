
import { IS_BROWSER, collections, getQueryId, ObjectId } from '../config/mongodb';
import { Document } from 'mongodb';

// Browser-safe imports - only used in non-browser environments
let MongoClient: any;

// Only import MongoDB in non-browser environments
if (!IS_BROWSER) {
  try {
    // This code will not run in the browser
    const mongodb = require('mongodb');
    MongoClient = mongodb.MongoClient;
  } catch (error) {
    console.error('Failed to import MongoDB in Node environment:', error);
  }
}

// Interface definitions
interface LocalItem {
  _id?: string | any; // Allow both string and ObjectId
  id?: string;
  [key: string]: any;
}

interface LocalDB {
  [key: string]: LocalItem[];
}

// Local database for browser environments
const localDB: LocalDB = {
  countries: [],
  providers: [],
  phoneNumbers: [],
  transactions: [],
  supportTickets: [],
  users: []
};

// Mock database client
let db: any = null;

// Connect to database function - works differently in browser vs server
export const connectToDatabase = async () => {
  if (IS_BROWSER) {
    console.log('Running in browser environment. Using local storage database.');
    return true;
  }
  
  // This code will not execute in browser environments
  try {
    if (!db && MongoClient) {
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      db = client.db();
      console.log('Successfully connected to MongoDB database');
    }
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Get database collection - works in both environments
export const getCollection = async (collectionName: string) => {
  // Make sure the collection exists in our local DB
  if (!localDB[collectionName]) {
    localDB[collectionName] = [];
  }

  // If not in browser and connected to real MongoDB, use it
  if (!IS_BROWSER && db) {
    return db.collection(collections[collectionName as keyof typeof collections]);
  }

  // Otherwise return a MongoDB-like interface for the local collection
  return {
    find: (query = {}) => ({
      toArray: async () => {
        // Simulate data retrieval
        return localDB[collectionName].map((item: LocalItem, index) => ({
          ...item,
          _id: item._id || `local_${index}`
        }));
      }
    }),
    findOne: async (query: {_id?: string | any} = {}) => {
      // Simulate finding a single item
      const items = localDB[collectionName];
      if (query._id) {
        const idString = query._id.toString();
        return items.find((item: LocalItem) => 
          item._id?.toString() === idString
        ) || null;
      }
      return items[0] || null;
    },
    insertOne: async (document: Document & {_id?: any} & LocalItem) => {
      // Generate local ID if none provided
      const _id = document._id?.toString() || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDoc = { ...document, _id };
      
      // Add document to collection
      localDB[collectionName].push(newDoc);
      
      return { 
        insertedId: _id,
        acknowledged: true
      };
    },
    insertMany: async (documents: Document[]) => {
      // Add multiple documents
      const insertedIds = [];
      
      for (const doc of documents) {
        const _id = doc._id?.toString() || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newDoc = { ...doc, _id };
        
        localDB[collectionName].push(newDoc);
        insertedIds.push(_id);
      }
      
      return {
        insertedIds,
        insertedCount: documents.length,
        acknowledged: true
      };
    },
    updateOne: async (filter: {_id?: string | any}, update: {$set?: LocalItem}) => {
      // Update a document
      const idString = filter._id?.toString();
      const index = localDB[collectionName].findIndex((item: LocalItem) => 
        idString ? item._id?.toString() === idString : false
      );
      
      if (index !== -1) {
        if (update.$set) {
          localDB[collectionName][index] = {
            ...localDB[collectionName][index],
            ...update.$set
          };
        }
        
        return {
          matchedCount: 1,
          modifiedCount: 1,
          acknowledged: true
        };
      }
      
      return {
        matchedCount: 0,
        modifiedCount: 0,
        acknowledged: true
      };
    },
    deleteOne: async (filter: {_id?: string | any}) => {
      // Delete a document
      const idString = filter._id?.toString();
      const initialLength = localDB[collectionName].length;
      
      localDB[collectionName] = localDB[collectionName].filter((item: LocalItem) => 
        idString ? item._id?.toString() !== idString : false
      );
      
      const deletedCount = initialLength - localDB[collectionName].length;
      
      return {
        deletedCount,
        acknowledged: true
      };
    },
    countDocuments: async () => {
      // Count documents
      return localDB[collectionName].length;
    }
  };
};

// Close connection - mock implementation for browser
export const closeConnection = async () => {
  console.log('Database connection closed');
  return true;
};

// Import data helper function
export const importData = (collectionName: string, data: any[]) => {
  localDB[collectionName] = data.map(item => ({
    ...item,
    _id: item.id || item._id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }));
  
  console.log(`Imported ${data.length} records to ${collectionName}`);
};
