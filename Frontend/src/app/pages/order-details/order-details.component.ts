import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  template: `
    <main class="container py-4 py-lg-5" *ngIf="order as currentOrder; else loadingState">
      <a routerLink="/dashboard" class="btn btn-sm btn-outline-secondary mb-4">
        <i class="bi bi-arrow-left me-1"></i> {{ 'Back to orders' | translate }}
      </a>

      <header class="d-flex flex-wrap justify-content-between align-items-start gap-3 border-bottom pb-3 mb-4">
        <div>
          <div class="text-muted small">Order #{{ currentOrder._id.slice(-8) }}</div>
          <h1 class="h3 fw-bold mb-1">{{ 'Order details' | translate }}</h1>
          <div class="text-muted">{{ 'Placed' | translate }} {{ currentOrder.createdAt | date:'medium' }}</div>
        </div>
        <span class="badge text-uppercase px-3 py-2"
          [ngClass]="currentOrder.status === 'opened' ? 'bg-primary' : 'bg-secondary'">
          {{ currentOrder.status | translate }}
        </span>
        <span *ngIf="currentOrder.paymentMethod === 'stripe'" class="badge bg-info text-dark px-3 py-2">
          Stripe: {{ currentOrder.paymentStatus | translate }}
        </span>
      </header>

      <div *ngIf="message" class="alert" [ngClass]="isError ? 'alert-danger' : 'alert-success'" role="status">
        {{ message }}
      </div>

      <div class="row g-4">
        <section class="col-lg-7">
          <div class="border-bottom pb-3 mb-3">
            <h2 class="h5 fw-bold"><i class="bi bi-bag-check me-2 text-primary"></i>{{ 'Items' | translate }}</h2>
            <div class="table-responsive">
              <table class="table align-middle">
                <thead class="table-light">
                  <tr><th>{{ 'Product' | translate }}</th><th class="text-center">{{ 'Qty' | translate }}</th><th class="text-end">{{ 'Price' | translate }}</th><th class="text-end">{{ 'Subtotal' | translate }}</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of currentOrder.items">
                    <td>{{ translations.localized(item, 'name') }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-end">{{ item.price | currency }}</td>
                    <td class="text-end fw-semibold">{{ item.price * item.quantity | currency }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr><th colspan="3" class="text-end">{{ 'Order total' | translate }}</th><th class="text-end text-primary">{{ currentOrder.totalAmount | currency }}</th></tr>
                </tfoot>
              </table>
            </div>
          </div>

          <section *ngIf="currentOrder.notes" class="mb-4">
            <h2 class="h6 fw-bold">{{ 'Customer note' | translate }}</h2>
            <p class="mb-0 p-3 bg-light border-start border-3 border-info">{{ currentOrder.notes }}</p>
          </section>

          <section aria-labelledby="manager-notes-heading">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 id="manager-notes-heading" class="h5 fw-bold mb-0">{{ 'Manager notes' | translate }}</h2>
              <span class="text-muted small">{{ currentOrder.managerNoteEntries?.length || (currentOrder.managerNotes ? 1 : 0) }} {{ 'notes' | translate }}</span>
            </div>

            <ol class="list-unstyled mb-3" *ngIf="currentOrder.managerNoteEntries?.length || currentOrder.managerNotes">
              <li *ngIf="currentOrder.managerNotes" class="border-start border-2 ps-3 py-2 mb-2">
                <p class="mb-1">{{ currentOrder.managerNotes }}</p>
                <time class="small text-muted">{{ 'Previous note' | translate }}</time>
              </li>
              <li *ngFor="let note of currentOrder.managerNoteEntries" class="border-start border-2 border-primary ps-3 py-2 mb-2">
                <p class="mb-1 text-break">{{ note.text }}</p>
                <time class="small text-muted">{{ note.createdAt | date:'medium' }}</time>
              </li>
            </ol>
            <p *ngIf="!currentOrder.managerNoteEntries?.length && !currentOrder.managerNotes" class="text-muted">{{ 'No manager notes yet.' | translate }}</p>

            <form (ngSubmit)="addManagerNote()" class="d-flex align-items-start gap-2">
              <textarea
                class="form-control"
                rows="2"
                maxlength="1000"
                [placeholder]="'Write a call update or delivery note' | translate"
                name="newManagerNote"
                [(ngModel)]="newManagerNote"
                required
              ></textarea>
              <button class="btn btn-primary" type="submit" [disabled]="saving || !newManagerNote.trim()" [attr.aria-label]="'Add manager note' | translate" [title]="'Add note' | translate">
                <i class="bi bi-plus-lg"></i>
              </button>
            </form>
          </section>
        </section>

        <aside class="col-lg-5">
          <section class="border rounded p-4">
            <h2 class="h5 fw-bold mb-3"><i class="bi bi-person-vcard me-2 text-primary"></i>{{ 'Customer' | translate }}</h2>
            <dl class="mb-0">
              <dt class="small text-muted">{{ 'Name' | translate }}</dt>
              <dd>{{ currentOrder.customer.name }}</dd>
              <dt *ngIf="currentOrder.customer.email" class="small text-muted">{{ 'Email Address' | translate }}</dt>
              <dd *ngIf="currentOrder.customer.email"><a [href]="'mailto:' + currentOrder.customer.email">{{ currentOrder.customer.email }}</a></dd>
              <dt class="small text-muted">{{ 'Phone' | translate }}</dt>
              <dd><a [href]="'tel:' + currentOrder.customer.phone">{{ currentOrder.customer.phone }}</a></dd>
              <dt class="small text-muted">{{ 'Delivery address' | translate }}</dt>
              <dd class="mb-0">{{ currentOrder.customer.address }}</dd>
            </dl>
          </section>
        </aside>
      </div>
    </main>

    <ng-template #loadingState>
      <main class="container py-5">
        <p *ngIf="!loadError" class="text-muted">{{ 'Loading order...' | translate }}</p>
        <div *ngIf="loadError" class="alert alert-danger">{{ loadError | translate }}</div>
        <a routerLink="/dashboard" class="btn btn-outline-secondary">{{ 'Back to orders' | translate }}</a>
      </main>
    </ng-template>
  `
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  newManagerNote = '';
  saving = false;
  message = '';
  isError = false;
  loadError = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    public translations: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.loadError = 'Order not found.';
      return;
    }

    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        this.order = response.data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loadError = error.error?.message || 'Could not load this order.';
        this.cdr.markForCheck();
      }
    });
  }

  addManagerNote(): void {
    const text = this.newManagerNote.trim();
    if (!this.order || !text || this.saving) return;

    this.saving = true;
    this.orderService.updateOrderStatus(this.order._id, { managerNote: text }).subscribe({
      next: (response) => {
        this.order = response.data;
        this.newManagerNote = '';
        this.message = 'Note added.';
        this.isError = false;
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.message || 'Could not add the note.';
        this.isError = true;
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}