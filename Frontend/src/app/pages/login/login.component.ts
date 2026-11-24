import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-7 col-lg-5">
          <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
            <!-- Header -->
            <div class="bg-dark text-white p-4 text-center">
              <div class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
                <i class="bi bi-shield-lock-fill me-1"></i> {{ 'Manager Access Only' | translate }}
              </div>
              <h3 class="fw-bold text-white mb-0">{{ 'Manager Portal' | translate }}</h3>
              <p class="text-secondary small mb-0 mt-1">{{ 'Sprint 01 Management Dashboard' | translate }}</p>
            </div>

            <!-- Body -->
            <div class="card-body p-4 p-md-5">
              <!-- Error message -->
              <div *ngIf="errorMessage" class="alert alert-danger rounded-3 small py-2 px-3 mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-circle-fill fs-5"></i>
                <div>{{ errorMessage | translate }}</div>
              </div>

              <form (ngSubmit)="onLogin()">
                <div class="mb-3">
                  <label class="form-label fw-bold text-dark">{{ 'Manager Email' | translate }}</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light"><i class="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      class="form-control"
                      [placeholder]="'manager@shop.com' | translate"
                      [(ngModel)]="email"
                      name="email"
                      required
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold text-dark">{{ 'Password' | translate }}</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light"><i class="bi bi-key"></i></span>
                    <input
                      type="password"
                      class="form-control"
                      placeholder="••••••••"
                      [(ngModel)]="password"
                      name="password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg rounded-pill fw-bold w-100 shadow-sm mb-3"
                  [disabled]="isLoading"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i *ngIf="!isLoading" class="bi bi-box-arrow-in-right me-2"></i>
                  {{ (isLoading ? 'Authenticating' : 'Log In to Dashboard') | translate }}
                </button>
              </form>

              <!-- Demo Credentials Box -->
              <div class="card bg-light border-0 rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="small fw-bold text-dark"><i class="bi bi-info-circle me-1 text-primary"></i> {{ 'Default Manager:' | translate }}</span>
                  <button class="btn btn-sm btn-link p-0 text-decoration-none" (click)="fillDemoCredentials()">{{ 'Fill Demo' | translate }}</button>
                </div>
                <div class="text-muted small">{{ 'Email' | translate }}: <code>manager&#64;shop.com</code></div>
                <div class="text-muted small">{{ 'Password' | translate }}: <code>manager123</code></div>
              </div>
            </div>

            <!-- Footer link -->
            <div class="card-footer bg-white border-top-0 text-center pb-4">
              <a routerLink="/" class="text-muted small text-decoration-none">
                <i class="bi bi-arrow-left me-1"></i> {{ 'Return to Public Store' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email: string = 'manager@shop.com';
  password: string = 'manager123';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  fillDemoCredentials(): void {
    this.email = 'manager@shop.com';
    this.password = 'manager123';
    this.cdr.markForCheck();
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please provide both email and password';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid manager credentials';
        this.cdr.markForCheck();
      }
    });
  }
}

