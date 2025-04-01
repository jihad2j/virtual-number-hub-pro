
import { MongoClient } from 'mongodb';

// عنوان اتصال MongoDB
const uri = "mongodb+srv://jihad2jus:l9GrLciVEUvvK8Fd@jihad.8dyvx.mongodb.net/seha?retryWrites=true&w=majority&appName=jihad";

// إنشاء عميل MongoDB
const client = new MongoClient(uri);

// الاتصال بقاعدة البيانات
export const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    return client.db('seha');
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    throw error;
  }
};

// الحصول على مجموعات البيانات
export const getCollection = async (collectionName: string) => {
  const db = await connectToDatabase();
  return db.collection(collectionName);
};

// إغلاق الاتصال
export const closeConnection = async () => {
  await client.close();
  console.log('تم إغلاق الاتصال بقاعدة البيانات');
};
