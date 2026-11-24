import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSignal = signal<User | null>(null);

  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => !!this.currentUserSignal());

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem('shop_manager_user');
      if (stored) {
        this.currentUserSignal.set(JSON.parse(stored));
      }
    } catch (e) {
      localStorage.removeItem('shop_manager_user');
    }
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token || null;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ success: boolean; data: User }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUserSignal.set(res.data);
          localStorage.setItem('shop_manager_user', JSON.stringify(res.data));
        }
      })
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('shop_manager_user');
    this.router.navigate(['/']);
  }

  getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

