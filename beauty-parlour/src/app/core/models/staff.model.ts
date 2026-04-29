export interface Staff {
  _id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  specialization?: string;
  availability: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
}
