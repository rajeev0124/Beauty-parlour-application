export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  description?: string;
  image?: string;
  rating?: number;
  bestseller?: boolean;
  isActive: boolean;
  createdAt: Date;
}
