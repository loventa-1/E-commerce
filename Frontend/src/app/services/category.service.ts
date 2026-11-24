import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:5000/api/categories';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getCategories(): Observable<{ success: boolean; count: number; data: Category[] }> {
    return this.http.get<{ success: boolean; count: number; data: Category[] }>(this.apiUrl);
  }

  getCategoryById(id: string): Observable<{ success: boolean; data: Category }> {
    return this.http.get<{ success: boolean; data: Category }>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string }): Observable<{ success: boolean; data: Category }> {
    return this.http.post<{ success: boolean; data: Category }>(this.apiUrl, category, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateCategory(id: string, category: { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string }): Observable<{ success: boolean; data: Category }> {
    return this.http.put<{ success: boolean; data: Category }>(`${this.apiUrl}/${id}`, category, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}

