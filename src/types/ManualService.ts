
export interface ManualService {
  id: string;
  _id?: string; // Support for MongoDB's _id
  name: string;
  description: string;
  price: number;
  available: boolean;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
