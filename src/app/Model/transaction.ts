export interface Transaction {
    id?: number;
    userId: string;
  amount: number;
  currency: string;
  merchant: string;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  aiAnalysis: string;
}
