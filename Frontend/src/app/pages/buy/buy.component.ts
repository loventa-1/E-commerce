import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="container py-5">
      <!-- Order Placed Success Screen -->
      <div *ngIf="placedOrder" class="mx-auto bg-white rounded-4 shadow-sm border p-4 p-md-5 text-center" style="max-width: 680px;">
        <div class="mb-4">
          <div class="badge bg-success rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 80px; height: 80px;">
            <i class="bi bi-check-lg text-white display-4"></i>
          </div>
        </div>

                <h2 class="fw-extrabold text-dark mb-2">{{ (placedOrder.paymentMethod === 'stripe' ? 'Payment Received!' : 'Order Received!') | translate }}</h2>
        <p class="lead text-muted mb-4">
          {{ 'Thank you,' | translate }} <strong class="text-dark">{{ placedOrder.customer.name }}</strong>! {{ 'Your order has been successfully placed with status:' | translate }}
          <span class="badge bg-primary text-uppercase px-3 py-2 ms-1">{{ (placedOrder.paymentMethod === 'stripe' ? placedOrder.paymentStatus : placedOrder.status) | translate }}</span>
        </p>
        <p *ngIf="placedOrder.customer.email && placedOrder.paymentMethod !== 'stripe'" class="small text-success mb-4">
          <i class="bi bi-envelope-check me-1"></i>{{ 'Order confirmation email sent to' | translate }} {{ placedOrder.customer.email }}
        </p>

        <!-- Phone Delivery Announcement -->
        <div *ngIf="placedOrder.paymentMethod !== 'stripe'" class="alert alert-warning border-0 rounded-4 text-start p-4 mb-4 shadow-sm">
          <div class="d-flex gap-3 align-items-start">
            <i class="bi bi-telephone-inbound-fill fs-2 text-warning flex-shrink-0"></i>
            <div>
              <h5 class="fw-bold mb-1">{{ 'Phone Call Confirmation & Delivery' | translate }}</h5>
              <p class="mb-0 small text-secondary">
                {{ 'Our sales team will contact you shortly on' | translate }} <strong>{{ placedOrder.customer.phone }}</strong> {{ 'to confirm your order details and schedule immediate delivery to:' | translate }}
                <br><em>{{ placedOrder.customer.address }}</em>
              </p>
            </div>
          </div>
        </div>

        <!-- Order Summary Details -->
        <div class="bg-light rounded-3 p-3 text-start mb-4">
          <div class="d-flex justify-content-between text-muted small mb-2">
            <span>{{ 'Order Reference ID:' | translate }}</span>
            <span class="font-monospace fw-bold text-dark">{{ placedOrder._id }}</span>
          </div>
          <div class="d-flex justify-content-between text-muted small mb-2">
            <span>{{ 'Items Count:' | translate }}</span>
            <span class="fw-semibold text-dark">{{ placedOrder.items.length }} {{ 'products' | translate }}</span>
          </div>
          <div class="d-flex justify-content-between text-muted small mb-2">
            <span>{{ 'Total Payable:' | translate }}</span>
            <span class="fw-bold text-primary fs-6">\${{ placedOrder.totalAmount | number:'1.2-2' }}</span>
          </div>
          <div *ngIf="placedOrder.notes" class="text-muted small mt-2 pt-2 border-top">
            <strong>{{ 'Customer Notes:' | translate }}</strong> {{ placedOrder.notes }}
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/" class="btn btn-primary rounded-pill px-4 fw-bold">
            <i class="bi bi-shop me-1"></i> {{ 'Back to Shop' | translate }}
          </a>
        </div>
      </div>

      <!-- Checkout Form Screen -->
      <div *ngIf="!placedOrder">
        <!-- If cart is empty -->
        <div *ngIf="cartService.cartItems().length === 0" class="text-center py-5 bg-white rounded-4 border shadow-sm p-5 mx-auto" style="max-width: 600px;">
          <i class="bi bi-cart-x text-muted display-4 d-block mb-3"></i>
          <h4 class="fw-bold">{{ 'No Items in Cart to Buy' | translate }}</h4>
          <p class="text-muted">{{ 'Please add products to your cart before proceeding to the checkout page.' | translate }}</p>
          <a routerLink="/" class="btn btn-primary rounded-pill px-4 mt-2">{{ 'Browse Shop' | translate }}</a>
        </div>

        <div *ngIf="cartService.cartItems().length > 0">
          <div class="mb-4">
            <a routerLink="/cart" class="btn btn-outline-secondary btn-sm rounded-pill px-3 mb-2">
              <i class="bi bi-arrow-left me-1"></i> {{ 'Back to Cart' | translate }}
            </a>
            <h2 class="fw-extrabold text-dark mb-1">{{ 'Buy & Delivery Checkout' | translate }}</h2>
            <p class="text-muted">{{ 'Complete your details. We finalize delivery and confirmation via phone call.' | translate }}</p>
          </div>

          <div class="row g-4">
            <!-- Customer Form -->
            <div class="col-lg-7">
              <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <div class="alert alert-info border-0 rounded-3 d-flex align-items-center gap-3 py-2 px-3 mb-4">
                  <i class="bi bi-telephone-forward-fill fs-3 text-info"></i>
                  <div class="small">
                    <strong>{{ 'Important:' | translate }}</strong> {{ 'Buy and delivery are finalized via' | translate }} <strong>{{ 'direct phone call' | translate }}</strong>. {{ 'Please provide a valid active phone number.' | translate }}
                  </div>
                </div>

                <!-- Error Message -->
                <div *ngIf="cancelledPayment" class="alert alert-warning rounded-3 small py-2 px-3 mb-3" role="status">
                  {{ 'Payment was cancelled. Your cart is unchanged; you can choose another payment method or try again.' | translate }}
                </div>
                <div *ngIf="errorMessage" class="alert alert-danger rounded-3 small py-2 px-3 mb-3">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage | translate }}
                </div>

                <form (ngSubmit)="submitOrder()">
                  <div class="mb-3">
                    <label class="form-label fw-bold text-dark">{{ 'Full Name' | translate }} <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        [placeholder]="'e.g. John Doe' | translate"
                        [(ngModel)]="customerName"
                        name="customerName"
                        required
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold text-dark">{{ 'Email Address' | translate }} <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        class="form-control"
                        [placeholder]="'you@example.com' | translate"
                        [(ngModel)]="customerEmail"
                        name="customerEmail"
                        autocomplete="email"
                        required
                      />
                    </div>
                    <div class="form-text small">{{ 'We will email your order confirmation.' | translate }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold text-dark">{{ 'Phone Number (For Call & Delivery)' | translate }} <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-telephone"></i></span>
                      <input
                        type="tel"
                        class="form-control"
                        [placeholder]="'e.g. +1 555-0199 or 01012345678' | translate"
                        [(ngModel)]="customerPhone"
                        name="customerPhone"
                        required
                      />
                    </div>
                    <div class="form-text small">{{ 'Our agent will call this number to verify the order.' | translate }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold text-dark">{{ 'Delivery Address' | translate }} <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-geo-alt"></i></span>
                      <textarea
                        class="form-control"
                        rows="3"
                        [placeholder]="'Street name, building, apartment/floor, city, state' | translate"
                        [(ngModel)]="customerAddress"
                        name="customerAddress"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-bold text-dark">{{ 'Order Notes' | translate }} <span class="text-muted fw-normal">{{ '(Optional)' | translate }}</span></label>
                    <textarea
                      class="form-control"
                      rows="2"
                      [placeholder]="'Special instructions for delivery, preferred call time, etc.' | translate"
                      [(ngModel)]="orderNotes"
                      name="orderNotes"
                    ></textarea>
                  </div>

                  <fieldset class="mb-4" *ngIf="stripeEnabled">
                    <legend class="form-label fw-bold text-dark">{{ 'Payment method' | translate }}</legend>
                    <label class="form-check border rounded-3 p-3 ps-5 mb-2">
                      <input class="form-check-input" type="radio" name="paymentMethod" value="cash" [(ngModel)]="paymentMethod" />
                      <span class="fw-semibold">{{ 'Pay on delivery' | translate }}</span>
                    </label>
                    <label class="form-check border rounded-3 p-3 ps-5">
                      <input class="form-check-input" type="radio" name="paymentMethod" value="stripe" [(ngModel)]="paymentMethod" />
                      <span class="fw-semibold">{{ 'Credit or debit card' | translate }}</span>
                      <span class="small text-muted d-block">{{ 'Secure payment hosted by Stripe' | translate }}</span>
                    </label>
                  </fieldset>

                  <button
                    type="submit"
                    class="btn btn-primary btn-lg rounded-pill fw-bold w-100 shadow-sm"
                    [disabled]="isSubmitting"
                  >
                    <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    <i *ngIf="!isSubmitting" class="bi bi-bag-check-fill me-2"></i>
                    {{ (isSubmitting ? 'Placing Order...' : (paymentMethod === 'stripe' ? 'Continue to Stripe' : 'Confirm & Place Order')) | translate }}
                  </button>
                </form>
              </div>
            </div>

            <!-- Mini Cart Review -->
            <div class="col-lg-5">
              <div class="card border-0 shadow-sm rounded-4 p-4 sticky-top" style="top: 100px;">
                <h5 class="fw-bold mb-3">{{ 'Items in This Order' | translate }}</h5>

                <div class="list-group list-group-flush mb-3 overflow-auto" style="max-height: 320px;">
                  <div *ngFor="let ci of cartService.cartItems()" class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-bottom">
                    <div class="d-flex align-items-center gap-2">
                      <img
                        [src]="ci.item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'"
                        [alt]="translations.localized(ci.item, 'name')"
                        class="rounded-2 object-fit-cover"
                        style="width: 44px; height: 44px;"
                      />
                      <div>
                        <div class="fw-semibold text-dark small text-truncate" style="max-width: 170px;">{{ translations.localized(ci.item, 'name') }}</div>
                        <div class="text-muted small">{{ 'Qty:' | translate }} {{ ci.quantity }} &times; \${{ ci.item.price | number:'1.2-2' }}</div>
                      </div>
                    </div>
                    <span class="fw-bold text-primary small">\${{ (ci.item.price * ci.quantity) | number:'1.2-2' }}</span>
                  </div>
                </div>

                <div class="d-flex justify-content-between mb-2 text-muted">
                  <span>{{ 'Total Items' | translate }}</span>
                  <span class="fw-semibold text-dark">{{ cartService.totalItemsCount() }}</span>
                </div>

                <div class="d-flex justify-content-between mb-3 text-muted">
                  <span>{{ 'Order Initial Status' | translate }}</span>
                  <span class="badge bg-primary text-uppercase">{{ 'Opened' | translate }}</span>
                </div>

                <hr class="my-3">

                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fs-5 fw-bold text-dark">{{ 'Total Amount' | translate }}</span>
                  <span class="display-6 fw-extrabold text-primary">\${{ cartService.totalPrice() | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BuyComponent implements OnInit {
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  customerAddress: string = '';
  orderNotes: string = '';
  isSubmitting: boolean = false;
  errorMessage: string | null = null;
  placedOrder: Order | null = null;
  paymentMethod: 'cash' | 'stripe' = 'cash';
  stripeEnabled = false;
  cancelledPayment = false;

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    public translations: TranslationService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.orderService.getStripeConfig().subscribe({
      next: (response) => {
        this.stripeEnabled = response.enabled;
        this.cdr.markForCheck();
      }
    });

    this.route.queryParamMap.subscribe((params) => {
      this.cancelledPayment = params.get('cancelled') === 'true';
      const orderId = params.get('orderId');
      const sessionId = params.get('session_id');
      if (!orderId || !sessionId) return;

      this.orderService.verifyCheckoutStatus(orderId, sessionId).subscribe({
        next: (response) => {
          if (response.data.paymentStatus === 'paid') {
            this.placedOrder = response.data;
            this.cartService.clearCart();
          } else {
            this.errorMessage = 'Payment is not complete yet. Please wait a moment and refresh this page.';
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Could not verify the payment status.';
          this.cdr.markForCheck();
        }
      });
    });
  }

  submitOrder(): void {
    if (!this.customerName.trim() || !this.customerEmail.trim() || !this.customerPhone.trim() || !this.customerAddress.trim()) {
      this.errorMessage = 'Please complete all required fields (Name, Email, Phone, and Address).';
      this.cdr.markForCheck();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.customerEmail.trim())) {
      this.errorMessage = 'Please provide a valid email address';
      this.cdr.markForCheck();
      return;
    }

    if (this.cartService.cartItems().length === 0) {
      this.errorMessage = 'Your cart is empty.';
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const payload = {
      items: this.cartService.cartItems().map(ci => ({
        itemId: ci.item._id,
        quantity: ci.quantity
      })),
      customer: {
        name: this.customerName.trim(),
        email: this.customerEmail.trim().toLowerCase(),
        phone: this.customerPhone.trim(),
        address: this.customerAddress.trim()
      },
      notes: this.orderNotes.trim(),
      paymentMethod: this.paymentMethod
    };

    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success && res.data) {
          if (this.paymentMethod === 'stripe') {
            if (res.checkoutUrl) {
              window.location.href = res.checkoutUrl;
              return;
            }
            this.errorMessage = 'Stripe did not return a Checkout URL.';
            this.cdr.markForCheck();
            return;
          }
          this.placedOrder = res.data;
          this.cartService.clearCart(); // Clear local storage cart
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to place order. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }
}

