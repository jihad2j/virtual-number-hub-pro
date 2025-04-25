import { ObjectId } from 'mongodb';

export const MONGODB_URI = "mongodb+srv://zoolka:zzzzz11111@masarproject.daj3l2l.mongodb.net/?retryWrites=true&w=majority&appName=masarproject";

export const collections = {
  users: "users",
  orders: "orders",
  transactions: "transactions",
  providers: "providers",
  countries: "countries",
  settings: "settings"
};

// Helper function to convert string ID to MongoDB ObjectId
export const toObjectId = (id: string): ObjectId => {
  try {
    return new ObjectId(id);
  } catch (error) {
    console.error("Invalid ObjectId format:", id);
    // Return a dummy ObjectId for local development
    return new ObjectId();
  }
};

// Helper function to safely handle string or ObjectId
export const getQueryId = (id: string | ObjectId): ObjectId | string => {
  // If using local storage mode, return the string as is
  if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return id;
  }

  // Otherwise try to convert to ObjectId
  try {
    return new ObjectId(id.toString());
  } catch (error) {
    return id.toString();
  }
};
 