
export interface PrepaidCode {
  id: string;
  code: string;
  amount: number;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  expiryDate?: string;
  createdAt: string;
}
