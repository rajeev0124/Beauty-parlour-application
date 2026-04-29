export interface Payment {
  _id: string;
  orderId: string;
  method: 'cash' | 'card' | 'upi' | 'online';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
}
