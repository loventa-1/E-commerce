import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="container py-5">
      <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold mb-1"><i class="bi bi-cart3 text-primary me-2"></i>{{ 'Shopping Cart' | translate }}</h2>
          <p class="text-muted mb-0">{{ 'Review items in your cart before checkout (saved in LocalStorage)' | translate }}</p>
        </div>
        <button
          *ngIf="cartService.cartItems().length > 0"
          class="btn btn-outline-danger btn-sm rounded-pill px-3"
          (click)="clearCart()"
        >
          <i class="bi bi-trash me-1"></i> {{ 'Clear Cart' | translate }}
        </button>
      </div>

      <!-- Empty Cart State -->
      <div *ngIf="cartService.cartItems().length === 0" class="text-center py-5 bg-white rounded-4 border shadow-sm p-5">
        <i class="bi bi-cart-x text-muted display-3 d-block mb-3"></i>
        <h4 class="fw-bold">{{ 'Your Cart is Currently Empty' | translate }}</h4>
        <p class="text-muted">{{ 'Explore our catalog and find the products you love!' | translate }}</p>
        <a routerLink="/" class="btn btn-primary rounded-pill px-4 mt-2">
          <i class="bi bi-bag-plus me-1"></i> {{ 'Start Shopping' | translate }}
        </a>
      </div>

      <!-- Cart Table & Checkout Summary -->
      <div *ngIf="cartService.cartItems().length > 0" class="row g-4">
        <!-- Items List -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th scope="col" class="ps-4">{{ 'Product' | translate }}</th>
                    <th scope="col">{{ 'Price' | translate }}</th>
                    <th scope="col" style="width: 140px;">{{ 'Quantity' | translate }}</th>
                    <th scope="col">{{ 'Subtotal' | translate }}</th>
                    <th scope="col" class="text-end pe-4">{{ 'Action' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let ci of cartService.cartItems()">
                    <td class="ps-4 py-3">
                      <div class="d-flex align-items-center gap-3">
                        <img
                          [src]="ci.item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'"
                          [alt]="translations.localized(ci.item, 'name')"
                          class="rounded-3 object-fit-cover shadow-sm"
                          style="width: 60px; height: 60px;"
                        />
                        <div>
                          <a [routerLink]="['/item', ci.item._id]" class="fw-bold text-dark text-decoration-none">
                            {{ translations.localized(ci.item, 'name') }}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>\${{ ci.item.price | number:'1.2-2' }}</td>
                    <td>
                      <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" type="button" (click)="decreaseQty(ci.item._id, ci.quantity)">-</button>
                        <span class="form-control text-center bg-white">{{ ci.quantity }}</span>
                        <button class="btn btn-outline-secondary" type="button" (click)="increaseQty(ci.item._id, ci.quantity)">+</button>
                      </div>
                    </td>
                    <td class="fw-bold text-primary">
                      \${{ (ci.item.price * ci.quantity) | number:'1.2-2' }}
                    </td>
                    <td class="text-end pe-4">
                      <button class="btn btn-link text-danger p-0 border-0" [title]="'Remove Item' | translate" (click)="removeItem(ci.item._id)">
                        <i class="bi bi-trash fs-5"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Summary & Checkout Card -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 sticky-top" style="top: 100px;">
            <h5 class="fw-bold text-dark mb-3">{{ 'Order Summary' | translate }}</h5>
            
            <div class="d-flex justify-content-between mb-2 text-muted">
              <span>{{ 'Total Items' | translate }}</span>
              <span class="fw-semibold text-dark">{{ cartService.totalItemsCount() }}</span>
            </div>

            <div class="d-flex justify-content-between mb-3 text-muted">
              <span>{{ 'Delivery Cost' | translate }}</span>
              <span class="text-success fw-semibold">{{ 'Calculated upon phone call' | translate }}</span>
            </div>

            <hr class="my-3">

            <div class="d-flex justify-content-between mb-4 align-items-center">
              <span class="fs-5 fw-bold text-dark">{{ 'Estimated Total' | translate }}</span>
              <span class="display-6 fw-extrabold text-primary">\${{ cartService.totalPrice() | number:'1.2-2' }}</span>
            </div>

            <!-- Phone Ordering Note -->
            <div class="alert alert-warning border-0 rounded-3 small mb-4">
              <i class="bi bi-info-circle-fill me-1"></i>
              <strong>{{ 'Notice:' | translate }}</strong> {{ 'All orders are confirmed and delivered directly through' | translate }} <strong>{{ 'phone calls' | translate }}</strong>.
            </div>

            <a routerLink="/buy" class="btn btn-primary btn-lg rounded-pill fw-bold w-100 shadow-sm">
              <i class="bi bi-bag-check-fill me-2"></i> {{ 'Proceed to Buy' | translate }}
            </a>

            <a routerLink="/" class="btn btn-link text-muted w-100 mt-2 text-decoration-none small">
              <i class="bi bi-arrow-left me-1"></i> {{ 'Continue Shopping' | translate }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent {
  constructor(public cartService: CartService, public translations: TranslationService) {}

  increaseQty(itemId: string, currentQty: number): void {
    this.cartService.updateQuantity(itemId, currentQty + 1);
  }

  decreaseQty(itemId: string, currentQty: number): void {
    if (currentQty > 1) {
      this.cartService.updateQuantity(itemId, currentQty - 1);
    } else {
      this.removeItem(itemId);
    }
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  clearCart(): void {
    if (confirm(this.translations.translate('Are you sure you want to empty your cart?'))) {
      this.cartService.clearCart();
    }
  }
}

