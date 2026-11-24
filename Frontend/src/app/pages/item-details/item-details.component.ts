import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { Item } from '../../models/item.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="container py-5">
      <!-- Breadcrumb / Back Navigation -->
      <nav [attr.aria-label]="'Breadcrumb' | translate" class="mb-4">
        <a routerLink="/" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i> {{ 'Back to Shop' | translate }}
        </a>
      </nav>

      <!-- Alert -->
      <div *ngIf="notification" class="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> {{ notification | translate }}
        <button type="button" class="btn-close" (click)="notification = null"></button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ 'Loading product...' | translate }}</span>
        </div>
      </div>

      <!-- Item Not Found -->
      <div *ngIf="!isLoading && !item" class="text-center py-5 bg-white rounded-4 shadow-sm border p-5">
        <i class="bi bi-exclamation-triangle text-warning fs-1 mb-3 d-block"></i>
        <h3>{{ 'Product Not Found' | translate }}</h3>
        <p class="text-muted">{{ 'The requested product could not be found or has been removed.' | translate }}</p>
        <a routerLink="/" class="btn btn-primary rounded-pill px-4">{{ 'Browse All Products' | translate }}</a>
      </div>

      <!-- Item Details Card -->
      <div *ngIf="!isLoading && item" class="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div class="row g-0">
          <!-- Item Image -->
          <div class="col-lg-6 bg-light d-flex align-items-center justify-content-center p-4">
            <div class="position-relative w-100 text-center" style="max-height: 480px;">
              <img
                [src]="item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'"
                [alt]="translations.localized(item, 'name')"
                class="img-fluid rounded-3 shadow-sm object-fit-contain"
                style="max-height: 440px;"
              />
            </div>
          </div>

          <!-- Item Information -->
          <div class="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-between">
            <div>
              <!-- Category Badge -->
              <span *ngIf="getCategoryName(item.category)" class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 mb-3">
                <i class="bi bi-tag-fill me-1"></i> {{ getCategoryName(item.category) }}
              </span>

              <!-- Title & Price -->
              <h2 class="fw-extrabold text-dark mb-2">{{ translations.localized(item, 'name') }}</h2>
              <div class="display-6 fw-bold text-primary mb-4">
                \${{ item.price | number:'1.2-2' }}
              </div>

              <!-- Phone Call Delivery Highlight -->
              <div class="alert alert-info border-0 rounded-3 d-flex align-items-center gap-3 py-2 px-3 mb-4">
                <i class="bi bi-telephone-inbound fs-4 text-info"></i>
                <div class="small">
                  <strong>{{ 'Easy Ordering:' | translate }}</strong> {{ 'Place order via cart. We will contact you by' | translate }} <strong>{{ 'phone call' | translate }}</strong> {{ 'to verify and arrange fast delivery!' | translate }}
                </div>
              </div>

              <!-- Description -->
              <h5 class="fw-bold text-dark mb-2">{{ 'Product Description' | translate }}</h5>
              <p class="text-secondary lead fs-6 mb-4" style="white-space: pre-line;">
                {{ translations.localized(item, 'description') }}
              </p>
            </div>

            <!-- Action Controls (Quantity to buy, Add to Cart, Favorite) -->
            <div class="pt-4 border-top">
              <div class="row g-3 align-items-center">
                <div class="col-auto">
                  <label class="form-label small text-muted fw-bold mb-1">{{ 'Quantity' | translate }}</label>
                  <div class="input-group quantity-ctrl">
                    <button class="btn btn-outline-secondary" type="button" (click)="decreaseQty()">-</button>
                    <input
                      type="number"
                      class="form-control text-center shadow-none"
                      [(ngModel)]="selectedQuantity"
                      min="1"
                    />
                    <button class="btn btn-outline-secondary" type="button" (click)="increaseQty()">+</button>
                  </div>
                </div>

                <div class="col">
                  <label class="form-label d-none d-sm-block small text-transparent mb-1">&nbsp;</label>
                  <button class="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm" (click)="addToCart()">
                    <i class="bi bi-cart-plus-fill me-2"></i> Add to Cart
                  </button>
                </div>

                <div class="col-auto">
                  <label class="form-label d-none d-sm-block small text-transparent mb-1">&nbsp;</label>
                  <button
                    class="btn btn-outline-danger btn-lg rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center"
                    style="width: 52px; height: 52px;"
                    [title]="(favoritesService.isFavorite(item._id) ? 'Remove from favorites' : 'Add to favorites') | translate"
                    (click)="toggleFavorite()"
                  >
                    <i class="bi" [ngClass]="favoritesService.isFavorite(item._id) ? 'bi-heart-fill' : 'bi-heart'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ItemDetailsComponent implements OnInit {
  item: Item | null = null;
  selectedQuantity: number = 1;
  isLoading: boolean = false;
  notification: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    public cartService: CartService,
    public favoritesService: FavoritesService,
    public translations: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadItem(id);
    }
  }

  loadItem(id: string): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.itemService.getItemById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.item = res.data;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading item details', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getCategoryName(category: any): string {
    if (!category) return '';
    return typeof category === 'object' ? this.translations.localized(category, 'name') : category;
  }

  increaseQty(): void {
    this.selectedQuantity++;
    this.cdr.markForCheck();
  }

  decreaseQty(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
      this.cdr.markForCheck();
    }
  }

  addToCart(): void {
    if (!this.item) return;
    const qty = Math.max(1, Number(this.selectedQuantity) || 1);
    this.cartService.addToCart(this.item, qty);
    const itemName = this.translations.localized(this.item, 'name');
    this.notification = this.translations.isArabic ? `تمت إضافة ${qty} من «${itemName}» إلى السلة.` : `Added ${qty} × "${itemName}" to cart!`;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.notification = null;
      this.cdr.markForCheck();
    }, 3000);
  }

  toggleFavorite(): void {
    if (!this.item) return;
    const isFav = this.favoritesService.toggleFavorite(this.item);
    this.notification = isFav ? `Added to favorites` : `Removed from favorites`;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.notification = null;
      this.cdr.markForCheck();
    }, 2500);
  }
}
