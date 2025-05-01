
export interface Service {
  id: string;
  name: string;
  price: number;
  available: boolean;
  count?: number;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  iso?: string;
  services: Service[];
  available?: boolean;
}
