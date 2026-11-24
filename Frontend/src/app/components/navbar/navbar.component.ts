import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark py-3 sticky-top shadow-sm">
      <div class="container">
        <!-- Logo / Brand -->
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <i class="bi bi-bag-check-fill text-primary fs-3"></i>
          <span class="fs-4 text-white">Modern<span class="text-primary">Shop</span></span>
        </a>

        <!-- Mobile Toggle -->
        <button
          class="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          [attr.aria-label]="'Toggle navigation' | translate"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
          <!-- Main Links -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active text-white" [routerLinkActiveOptions]="{ exact: true }">
                <i class="bi bi-grid-fill me-1 text-primary"></i> {{ 'Browse Shop' | translate }}
              </a>
            </li>
          </ul>

          <!-- User actions: Favorites, Cart, Manager -->
          <div class="d-flex align-items-center gap-3">
            <!-- Favorites Link -->
            <a routerLink="/favorites" class="btn btn-outline-light position-relative btn-rounded px-3 py-2">
              <i class="bi bi-heart-fill text-danger me-1"></i>
              {{ 'Favorites' | translate }}
              <span *ngIf="favoritesService.favoritesCount() > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ favoritesService.favoritesCount() }}
              </span>
            </a>

            <!-- Cart Link -->
            <a routerLink="/cart" class="btn btn-primary position-relative btn-rounded px-3 py-2 fw-semibold">
              <i class="bi bi-cart3 me-1"></i>
              {{ 'Cart' | translate }}
              <span *ngIf="cartService.totalItemsCount() > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark fw-bold">
                {{ cartService.totalItemsCount() }}
              </span>
            </a>

            <!-- Manager Login or Dashboard -->
            <div class="d-flex align-items-center gap-2 border-start border-secondary ps-3 ms-2">
              <button type="button" class="btn btn-outline-light btn-sm" (click)="translationService.toggleLanguage()" [attr.aria-label]="(translationService.isArabic ? 'Switch to English' : 'Switch to Arabic') | translate">
                {{ translationService.isArabic ? 'English' : 'العربية' }}
              </button>
              <ng-container *ngIf="authService.isLoggedIn(); else loginBtn">
                <div class="dropdown">
                  <button class="btn btn-warning btn-rounded px-3 py-2 fw-bold dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-shield-lock-fill"></i>
                    {{ 'Manager' | translate }}
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow">
                    <li><span class="dropdown-header text-muted">{{ authService.currentUser()?.email }}</span></li>
                    <li><a class="dropdown-item py-2" routerLink="/dashboard"><i class="bi bi-speedometer2 me-2 text-primary"></i> {{ 'Dashboard' | translate }}</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item py-2 text-danger" (click)="authService.logout()"><i class="bi bi-box-arrow-right me-2"></i> {{ 'Log out' | translate }}</button></li>
                  </ul>
                </div>
              </ng-container>

              <ng-template #loginBtn>
                <a routerLink="/login" class="btn btn-outline-secondary text-light btn-rounded px-3 py-2">
                  <i class="bi bi-person-fill-lock me-1"></i> {{ 'Manager' | translate }}
                </a>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(
    public cartService: CartService,
    public favoritesService: FavoritesService,
    public authService: AuthService,
    public translationService: TranslationService
  ) {}
}

