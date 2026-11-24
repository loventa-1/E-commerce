import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Public: Checkout order
  createOrder(orderData: {
    items: { itemId: string; quantity: number }[];
    customer: { name: string; email: string; phone: string; address: string };
    notes?: string;
    paymentMethod?: 'cash' | 'stripe';
  }): Observable<{ success: boolean; message: string; emailSent?: boolean; checkoutUrl?: string; data: Order }> {
    return this.http.post<{ success: boolean; message: string; emailSent?: boolean; checkoutUrl?: string; data: Order }>(this.apiUrl, orderData);
  }

  getStripeConfig(): Observable<{ success: boolean; enabled: boolean }> {
    return this.http.get<{ success: boolean; enabled: boolean }>('http://localhost:5000/api/stripe/config');
  }

  verifyCheckoutStatus(orderId: string, sessionId: string): Observable<{ success: boolean; data: Order }> {
    const params = new HttpParams().set('session_id', sessionId);
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/${orderId}/status`, { params });
  }

  // Manager: Get all orders
  getOrders(status?: 'opened' | 'closed'): Observable<{ success: boolean; count: number; data: Order[] }> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ success: boolean; count: number; data: Order[] }>(this.apiUrl, {
      params,
      headers: this.authService.getAuthHeaders()
    });
  }

  // Manager: Get order by ID
  getOrderById(id: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Manager: Update order status & notes
  updateOrderStatus(id: string, updateData: { status?: 'opened' | 'closed'; notes?: string; managerNotes?: string; managerNote?: string }): Observable<{ success: boolean; message: string; data: Order }> {
    return this.http.patch<{ success: boolean; message: string; data: Order }>(`${this.apiUrl}/${id}`, updateData, {
      headers: this.authService.getAuthHeaders()
    });
  }
}

