import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';
import { Item } from '../../models/item.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="container py-5">
      <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold mb-1"><i class="bi bi-heart-fill text-danger me-2"></i>{{ 'My Favorites' | translate }}</h2>
          <p class="text-muted mb-0">{{ 'Items you saved for later (saved in LocalStorage)' | translate }}</p>
        </div>
        <span class="badge bg-secondary rounded-pill px-3 py-2">
          {{ favoritesService.favoritesCount() }} {{ 'Saved' | translate }}
        </span>
      </div>

      <!-- Empty State -->
      <div *ngIf="favoritesService.favoritesCount() === 0" class="text-center py-5 bg-white rounded-4 border shadow-sm p-5">
        <i class="bi bi-heart text-muted display-3 d-block mb-3"></i>
        <h4 class="fw-bold">{{ 'Your Wishlist is Empty' | translate }}</h4>
        <p class="text-muted">{{ "You haven't saved any items to your favorites yet." | translate }}</p>
        <a routerLink="/" class="btn btn-primary rounded-pill px-4 mt-2">
          <i class="bi bi-shop me-1"></i> {{ 'Start Shopping' | translate }}
        </a>
      </div>

      <!-- Favorites Grid -->
      <div *ngIf="favoritesService.favoritesCount() > 0" class="row g-4">
        <div *ngFor="let item of favoritesService.favorites()" class="col-sm-6 col-md-4 col-lg-3">
          <div class="card h-100 card-hover border-0 shadow-sm overflow-hidden d-flex flex-column">
            <div class="position-relative overflow-hidden bg-light" style="height: 200px;">
              <img
                [src]="item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'"
                [alt]="translations.localized(item, 'name')"
                class="w-100 h-100 object-fit-cover"
              />
              <button
                type="button"
                class="btn btn-danger position-absolute top-0 end-0 m-2 rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
                style="width: 34px; height: 34px;"
                [title]="'Remove from favorites' | translate"
                (click)="removeFromFavorites(item._id)"
              >
                <i class="bi bi-trash-fill fs-6"></i>
              </button>
            </div>

            <div class="card-body d-flex flex-column p-3">
              <h6 class="card-title fw-bold text-dark mb-1 text-truncate">
                <a [routerLink]="['/item', item._id]" class="text-decoration-none text-dark">
                  {{ translations.localized(item, 'name') }}
                </a>
              </h6>
              <p class="card-text text-muted small mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                {{ translations.localized(item, 'description') }}
              </p>

              <div class="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                <div class="price-tag text-primary">
                  \${{ item.price | number:'1.2-2' }}
                </div>
                <button class="btn btn-sm btn-primary rounded-pill px-3" (click)="moveToCart(item)">
                  <i class="bi bi-cart-plus me-1"></i> {{ 'Add to Cart' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FavoritesComponent {
  constructor(
    public favoritesService: FavoritesService,
    public cartService: CartService,
    public translations: TranslationService
  ) {}

  removeFromFavorites(itemId: string): void {
    this.favoritesService.removeFromFavorites(itemId);
  }

  moveToCart(item: Item): void {
    this.cartService.addToCart(item, 1);
  }
}

