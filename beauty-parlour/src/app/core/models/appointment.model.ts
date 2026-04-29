export interface Appointment {
  _id: string;
  userId: string;
  userName?: string;
  serviceId: string;
  serviceName?: string;
  staffId: string;
  staffName?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}
