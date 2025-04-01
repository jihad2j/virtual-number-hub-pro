
// خدمة قاعدة البيانات المحلية للتطوير
// في بيئة الإنتاج، يجب استخدام خادم باكيند حقيقي

// تخزين بيانات التطبيق محلياً
const localDB = {
  countries: [],
  providers: [],
  phoneNumbers: [],
  transactions: [],
  supportTickets: [],
  users: []
};

// وظائف التعامل مع قاعدة البيانات المحلية
export const connectToDatabase = async () => {
  console.log('تم الاتصال بقاعدة البيانات المحلية');
  return true;
};

export const getCollection = async (collectionName: string) => {
  // التأكد من وجود المجموعة
  if (!localDB[collectionName]) {
    localDB[collectionName] = [];
  }
  
  // إرجاع واجهة تشبه MongoDB للتعامل مع المجموعة
  return {
    find: (query = {}) => ({
      toArray: async () => {
        // محاكاة استرجاع البيانات
        return localDB[collectionName].map((item, index) => ({
          ...item,
          _id: item._id || `local_${index}`
        }));
      }
    }),
    findOne: async (query = {}) => {
      // محاكاة البحث عن عنصر واحد
      const items = localDB[collectionName];
      if (query._id) {
        return items.find(item => item._id === query._id) || null;
      }
      return items[0] || null;
    },
    insertOne: async (document) => {
      // إضافة معرّف محلي إذا لم يكن موجوداً
      const _id = document._id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDoc = { ...document, _id };
      
      // إضافة الوثيقة إلى المجموعة
      localDB[collectionName].push(newDoc);
      
      return { 
        insertedId: _id,
        acknowledged: true
      };
    },
    insertMany: async (documents) => {
      // إضافة عدة وثائق دفعة واحدة
      const insertedIds = [];
      
      for (const doc of documents) {
        const _id = doc._id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    updateOne: async (filter, update) => {
      // تحديث وثيقة واحدة
      const index = localDB[collectionName].findIndex(item => 
        filter._id ? item._id === filter._id : true
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
    deleteOne: async (filter) => {
      // حذف وثيقة واحدة
      const initialLength = localDB[collectionName].length;
      
      localDB[collectionName] = localDB[collectionName].filter(item => 
        filter._id ? item._id !== filter._id : false
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
