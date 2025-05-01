
export interface Service {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  iso?: string;  // Added iso property as optional
  services: Service[];
  available?: boolean;
}
