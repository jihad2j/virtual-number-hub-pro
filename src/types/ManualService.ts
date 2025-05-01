
export interface ManualService {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  available: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
