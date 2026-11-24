import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { ItemService } from '../../services/item.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { Category } from '../../models/category.model';
import { Item } from '../../models/item.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  template: `
    <div>
      <!-- Hero Banner -->
      <section class="bg-primary text-white py-5 shadow-sm" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);">
        <div class="container text-center py-4">
          <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3 shadow-sm">
            <i class="bi bi-telephone-inbound-fill me-1"></i> {{ 'Fast Delivery & Phone Call Confirmation' | translate }}
          </span>
          <h1 class="display-4 fw-extrabold mb-3 text-white">{{ 'Discover Quality Products' | translate }}</h1>
          <p class="lead mb-4 mx-auto text-light" style="max-width: 680px; opacity: 0.95;">
            {{ 'Browse our top-rated collections. Add your favorite items to cart and check out easily. We will call you directly to confirm and arrange immediate delivery!' | translate }}
          </p>

          <!-- Search Bar -->
          <div class="mx-auto" style="max-width: 580px;">
            <div class="input-group input-group-lg shadow-lg rounded-pill overflow-hidden bg-white p-1">
              <span class="input-group-text bg-transparent border-0 text-muted ps-3">
                <i class="bi bi-search fs-5"></i>
              </span>
              <input
                type="text"
                class="form-control border-0 shadow-none ps-2"
                [placeholder]="'Search products by name or keywords...' | translate"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
              />
              <button *ngIf="searchQuery" class="btn btn-link text-muted border-0 pe-3" (click)="clearSearch()">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Shop Section -->
      <section class="container py-5">
        <!-- Notification Alert -->
        <div *ngIf="notification" class="alert alert-success alert-dismissible fade show shadow-sm mb-4 d-flex align-items-center gap-2" role="alert">
          <i class="bi bi-check-circle-fill fs-5"></i>
          <div>{{ notification | translate }}</div>
          <button type="button" class="btn-close ms-auto" (click)="notification = null"></button>
        </div>

        <!-- Categories Filter Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h3 class="fw-bold mb-1 text-dark">{{ 'Explore Categories' | translate }}</h3>
            <p class="text-muted small mb-0">{{ 'Filter our catalog by category to find exactly what you need' | translate }}</p>
          </div>

          <!-- Total Count -->
          <div class="text-muted small">
            {{ 'Showing' | translate }} <strong class="text-dark">{{ items.length }}</strong> {{ 'products' | translate }}
          </div>
        </div>

        <!-- Category Pills -->
        <div class="d-flex flex-wrap gap-2 mb-5">
          <button
            class="category-pill"
            [class.active]="selectedCategoryId === ''"
            (click)="selectCategory('')"
          >
            <i class="bi bi-grid me-1"></i> {{ 'All Categories' | translate }}
          </button>
          <button
            *ngFor="let cat of categories"
            class="category-pill"
            [title]="translations.localized(cat, 'description')"
            [class.active]="selectedCategoryId === cat._id"
            (click)="selectCategory(cat._id)"
          >
            {{ translations.localized(cat, 'name') }}
          </button>
        </div>

        <!-- Loading Spinner -->
        <div *ngIf="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ 'Loading...' | translate }}</span>
          </div>
          <p class="text-muted mt-2">{{ 'Loading items...' | translate }}</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && items.length === 0" class="text-center py-5 bg-white rounded-4 shadow-sm border p-5">
          <i class="bi bi-box-seam text-secondary fs-1 d-block mb-3"></i>
          <h4 class="fw-bold">{{ 'No Products Found' | translate }}</h4>
          <p class="text-muted">{{ 'Try choosing another category or clearing your search filter.' | translate }}</p>
          <button class="btn btn-outline-primary btn-rounded px-4" (click)="resetFilters()">
            {{ 'Reset Filters' | translate }}
          </button>
        </div>

        <!-- Items Grid -->
        <div *ngIf="!isLoading && items.length > 0" class="row g-4">
          <div *ngFor="let item of items" class="col-sm-6 col-md-4 col-lg-3">
            <div class="card h-100 card-hover border-0 shadow-sm overflow-hidden d-flex flex-column">
              <!-- Item Image & Favorite Button -->
              <div class="position-relative overflow-hidden bg-light" style="height: 220px;">
                <img
                  [src]="item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'"
                  [alt]="translations.localized(item, 'name')"
                  class="w-100 h-100 object-fit-cover"
                />
                
                <!-- Favorite Toggle Icon Button -->
                <button
                  type="button"
                  class="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
                  style="width: 36px; height: 36px;"
                  [title]="(favoritesService.isFavorite(item._id) ? 'Remove from favorites' : 'Add to favorites') | translate"
                  (click)="toggleFavorite(item)"
                >
                  <i class="bi" [ngClass]="favoritesService.isFavorite(item._id) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'"></i>
                </button>

                <!-- Category Pill Overlay -->
                <span *ngIf="getCategoryName(item.category)" class="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75 rounded-pill px-2 py-1 text-white small">
                  {{ getCategoryName(item.category) }}
                </span>
              </div>

              <!-- Card Body -->
              <div class="card-body d-flex flex-column p-3">
                <h6 class="card-title fw-bold text-dark mb-1 text-truncate" [title]="translations.localized(item, 'name')">
                  <a [routerLink]="['/item', item._id]" class="text-decoration-none text-dark hover-primary">
                    {{ translations.localized(item, 'name') }}
                  </a>
                </h6>
                <p class="card-text text-muted small mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  {{ translations.localized(item, 'description') }}
                </p>

                <!-- Price and Add to Cart (Notice: Item quantity is NEVER displayed for public!) -->
                <div class="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                  <div class="price-tag text-primary">
                    \${{ item.price | number:'1.2-2' }}
                  </div>
                  <div class="d-flex gap-2">
                    <a [routerLink]="['/item', item._id]" class="btn btn-sm btn-outline-secondary rounded-pill px-2" [title]="'View Details' | translate">
                      <i class="bi bi-eye"></i>
                    </a>
                    <button class="btn btn-sm btn-primary rounded-pill px-3 fw-semibold" (click)="addToCart(item)">
                      <i class="bi bi-cart-plus me-1"></i> {{ 'Add' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  items: Item[] = [];
  selectedCategoryId: string = '';
  searchQuery: string = '';
  isLoading: boolean = false;
  notification: string | null = null;
  private searchTimeout: any;

  constructor(
    private categoryService: CategoryService,
    private itemService: ItemService,
    public cartService: CartService,
    public favoritesService: FavoritesService,
    public translations: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.cdr.markForCheck();
      }
    });
  }

  loadItems(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.itemService.getItems(this.selectedCategoryId, this.searchQuery).subscribe({
      next: (res) => {
        if (res.success) {
          this.items = res.data;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading items', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategoryId = categoryId;
    this.loadItems();
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadItems();
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadItems();
  }

  resetFilters(): void {
    this.selectedCategoryId = '';
    this.searchQuery = '';
    this.loadItems();
  }

  getCategoryName(category: any): string {
    if (!category) return '';
    if (typeof category === 'object') return this.translations.localized(category, 'name');
    const found = this.categories.find(c => c._id === category);
    return found ? this.translations.localized(found, 'name') : '';
  }

  addToCart(item: Item): void {
    this.cartService.addToCart(item, 1);
    const itemName = this.translations.localized(item, 'name');
    this.showNotification(this.translations.isArabic ? `تمت إضافة «${itemName}» إلى السلة.` : `"${itemName}" added to cart!`);
  }

  toggleFavorite(item: Item): void {
    const isFav = this.favoritesService.toggleFavorite(item);
    const itemName = this.translations.localized(item, 'name');
    if (isFav) {
      this.showNotification(this.translations.isArabic ? `تمت إضافة «${itemName}» إلى المفضلة.` : `Added "${itemName}" to favorites`);
    } else {
      this.showNotification(this.translations.isArabic ? `تمت إزالة «${itemName}» من المفضلة.` : `Removed "${itemName}" from favorites`);
    }
  }

  showNotification(msg: string): void {
    this.notification = msg;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (this.notification === msg) {
        this.notification = null;
        this.cdr.markForCheck();
      }
    }, 3000);
  }
}
