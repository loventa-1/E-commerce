import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:5000/api/items';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getItems(categoryId?: string, search?: string): Observable<{ success: boolean; count: number; data: Item[] }> {
    let params = new HttpParams();
    if (categoryId) params = params.set('category', categoryId);
    if (search) params = params.set('search', search);

    return this.http.get<{ success: boolean; count: number; data: Item[] }>(this.apiUrl, {
      params,
      headers: this.authService.getAuthHeaders()
    });
  }

  getItemById(id: string): Observable<{ success: boolean; data: Item }> {
    return this.http.get<{ success: boolean; data: Item }>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createItem(itemData: Partial<Item> & { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string }): Observable<{ success: boolean; data: Item }> {
    return this.http.post<{ success: boolean; data: Item }>(this.apiUrl, itemData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateItem(id: string, itemData: Partial<Item> & { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string }): Observable<{ success: boolean; data: Item }> {
    return this.http.put<{ success: boolean; data: Item }>(`${this.apiUrl}/${id}`, itemData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteItem(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}

