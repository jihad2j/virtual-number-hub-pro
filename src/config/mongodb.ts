import { ObjectId } from 'mongodb';

// Check if we're running in a browser environment
export const IS_BROWSER = typeof window !== 'undefined';

// Import ObjectId only in non-browser environments
let ObjectId: any;
if (!IS_BROWSER) {
  try {
    // This will only execute in Node.js environments
    const mongodb = require('mongodb');
    ObjectId = mongodb.ObjectId;
  } catch (error) {
    console.error('Failed to import MongoDB in Node environment:', error);
  }
} else {
  // Create a mock ObjectId for browser environments
  ObjectId = class MockObjectId {
    static isValid(id: string): boolean {
      return typeof id === 'string' && id.length === 24;
    }
    
    constructor(id?: string) {
      return { 
        toString: () => id || `browser_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      };
    }
  };
}

// Connection URI - Note: in browser environments, this will only be used for formatting
export const MONGODB_URI = "mongodb://localhost:27017/masarDB";

export const collections = {
  users: "users",
  orders: "orders",
  transactions: "transactions",
  providers: "providers",
  countries: "countries",
  settings: "settings"
};

// Export ObjectId to use throughout the application
export { ObjectId };

// Helper function to convert string ID to MongoDB ObjectId
export const toObjectId = (id: string): any => {
  try {
    return new ObjectId(id);
  } catch (error) {
    console.error("Invalid ObjectId format:", id);
    // Return a dummy ObjectId for local development
    return new ObjectId();
  }
};

// Helper function to safely handle string or ObjectId
export const getQueryId = (id: string | any): any => {
  // If using local storage mode, return the string as is
  if (IS_BROWSER) {
    return id.toString();
  }
  
  // If it's already an ObjectId, return it
  if (id && typeof id === 'object' && id.constructor && id.constructor.name === 'ObjectId') {
    return id;
  }
  
  // Otherwise try to convert to ObjectId
  try {
    return new ObjectId(id.toString());
  } catch (error) {
    return id.toString();
  }
};
