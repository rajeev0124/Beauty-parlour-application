export interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  category: string;
  image?: string;
  popular?: boolean;
  isActive: boolean;
  createdAt: Date;
}
