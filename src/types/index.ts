export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Booking {
  _id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  sport: 'football' | 'cricket' | 'both';
  date: string;
  timeSlot: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface TimeSlot {
  slot: string;
  isNight: boolean;
  price: number;
  available: boolean;
}