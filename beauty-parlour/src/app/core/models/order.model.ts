export interface Order {
  _id: string;
  userId: string;
  userName?: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}
