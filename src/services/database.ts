
import { MongoClient, Db, ObjectId, Document } from 'mongodb';
import { MONGODB_URI, collections, getQueryId } from '../config/mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

// خدمة قاعدة البيانات المحلية للتطوير
// في بيئة الإنتاج، يجب استخدام خادم باكيند حقيقي

// تخزين بيانات التطبيق محلياً
interface LocalItem {
  _id?: string;
  id?: string;
  [key: string]: any;
}

interface LocalDB {
  [key: string]: LocalItem[];
}

const localDB: LocalDB = {
  countries: [],
  providers: [],
  phoneNumbers: [],
  transactions: [],
  supportTickets: [],
  users: []
};

// Connect to MongoDB
export const connectToDatabase = async () => {
  try {
    if (!client) {
      client = await MongoClient.connect(MONGODB_URI);
      db = client.db();
      console.log('تم الاتصال بقاعدة البيانات بنجاح');
    }
    return true;
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    return false;
  }
};

// وظائف التعامل مع قاعدة البيانات
export const getCollection = async (collectionName: string) => {
  if (!db) {
    await connectToDatabase();
  }

  // التأكد من وجود المجموعة
  if (!localDB[collectionName]) {
    localDB[collectionName] = [];
  }

  // في حالة الاتصال بقاعدة البيانات
  if (db) {
    return db.collection(collections[collectionName as keyof typeof collections]);
  }

  // إرجاع واجهة تشبه MongoDB للتعامل مع المجموعة المحلية
  return {
    find: (query = {}) => ({
      toArray: async () => {
        // محاكاة استرجاع البيانات
        return localDB[collectionName].map((item: LocalItem, index) => ({
          ...item,
          _id: item._id || `local_${index}`
        }));
      }
    }),
    findOne: async (query: {_id?: string | ObjectId} = {}) => {
      // محاكاة البحث عن عنصر واحد
      const items = localDB[collectionName];
      if (query._id) {
        const idString = query._id.toString();
        return items.find((item: LocalItem) => item._id === idString) || null;
      }
      return items[0] || null;
    },
    insertOne: async (document: Document & {_id?: ObjectId | string} & LocalItem) => {
      // إضافة معرّف محلي إذا لم يكن موجوداً
      const _id = document._id?.toString() || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDoc = { ...document, _id };
      
      // إضافة الوثيقة إلى المجموعة
      localDB[collectionName].push(newDoc);
      
      return { 
        insertedId: _id,
        acknowledged: true
      };
    },
    insertMany: async (documents: Document[]) => {
      // إضافة عدة وثائق دفعة واحدة
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
    updateOne: async (filter: {_id?: string | ObjectId}, update: {$set?: LocalItem}) => {
      // تحديث وثيقة واحدة
      const idString = filter._id?.toString();
      const index = localDB[collectionName].findIndex((item: LocalItem) => 
        idString ? item._id === idString : true
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
    deleteOne: async (filter: {_id?: string | ObjectId}) => {
      // حذف وثيقة واحدة
      const idString = filter._id?.toString();
      const initialLength = localDB[collectionName].length;
      
      localDB[collectionName] = localDB[collectionName].filter((item: LocalItem) => 
        idString ? item._id !== idString : false
      );
      
      const deletedCount = initialLength - localDB[collectionName].length;
      
      return {
        deletedCount,
        acknowledged: true
      };
    },
    countDocuments: async () => {
      // إحصاء عدد الوثائق
      return localDB[collectionName].length;
    }
  };
};

export const closeConnection = async () => {
  console.log('تم إغلاق الاتصال بقاعدة البيانات المحلية');
  return true;
};

// استيراد البيانات إلى قاعدة البيانات المحلية
export const importData = (collectionName: string, data: any[]) => {
  localDB[collectionName] = data.map(item => ({
    ...item,
    _id: item.id || item._id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }));
  
  console.log(`تم استيراد ${data.length} سجل إلى ${collectionName}`);
};
