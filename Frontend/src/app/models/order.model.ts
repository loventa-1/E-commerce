export interface OrderItem {
  item: string | any;
  name: string;
  nameEn?: string;
  nameAr?: string;
  price: number;
  quantity: number;
  _id?: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ManagerOrderNote {
  _id?: string;
  text: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  customer: CustomerDetails;
  totalAmount: number;
  status: 'opened' | 'closed';
  paymentMethod?: 'cash' | 'stripe';
  paymentStatus?: 'pending' | 'processing' | 'paid' | 'failed';
  stripeDetails?: {
    sessionId?: string;
    paymentIntentId?: string;
    customerEmail?: string;
  };
  notes?: string;
  managerNotes?: string;
  managerNoteEntries?: ManagerOrderNote[];
  createdAt?: string;
  updatedAt?: string;
}

