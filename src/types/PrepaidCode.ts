
export interface PrepaidCode {
  id: string;
  _id?: string; // Support for MongoDB's _id
  code: string;
  amount: number;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
  createdBy?: string;
}
