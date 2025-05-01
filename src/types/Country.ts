
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
  services: Service[];
  available?: boolean;
}
