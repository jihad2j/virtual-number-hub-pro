
export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: string;
  date: string;
  icon: React.ReactNode;
}
