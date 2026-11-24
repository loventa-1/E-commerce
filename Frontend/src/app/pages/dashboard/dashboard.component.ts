import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { ItemService } from '../../services/item.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/category.model';
import { Item } from '../../models/item.model';
import { Order } from '../../models/order.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="container-fluid py-4 px-md-5">
      <!-- Dashboard Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-4 border-bottom">
        <div>
          <span class="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold mb-1">
            <i class="bi bi-shield-lock-fill me-1"></i> {{ 'Manager Control Panel' | translate }}
          </span>
          <h2 class="fw-extrabold text-dark mb-0">{{ 'Store Operations Dashboard' | translate }}</h2>
          <p class="text-muted small mb-0">{{ 'Sprint 01 • Manage Categories, Items Inventory & Orders' | translate }}</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <a routerLink="/" class="btn btn-outline-secondary rounded-pill btn-sm px-3">
            <i class="bi bi-eye me-1"></i> {{ 'View Storefront' | translate }}
          </a>
          <button class="btn btn-outline-danger rounded-pill btn-sm px-3" (click)="authService.logout()">
            <i class="bi bi-box-arrow-right me-1"></i> {{ 'Log out' | translate }}
          </button>
        </div>
      </div>

      <!-- Feedback Alerts -->
      <div *ngIf="alertMessage" class="alert alert-dismissible fade show shadow-sm mb-4" [ngClass]="alertType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i class="bi" [ngClass]="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        <span class="ms-2">{{ alertMessage | translate }}</span>
        <button type="button" class="btn-close" (click)="alertMessage = null"></button>
      </div>

      <!-- Metrics Row -->
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted small fw-semibold text-uppercase">{{ 'Categories' | translate }}</div>
                <div class="display-6 fw-bold text-dark">{{ categories.length }}</div>
              </div>
              <div class="bg-primary-subtle text-primary p-3 rounded-circle">
                <i class="bi bi-tags-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted small fw-semibold text-uppercase">{{ 'Total Items' | translate }}</div>
                <div class="display-6 fw-bold text-dark">{{ items.length }}</div>
              </div>
              <div class="bg-success-subtle text-success p-3 rounded-circle">
                <i class="bi bi-box-seam-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted small fw-semibold text-uppercase">{{ 'Opened Orders' | translate }}</div>
                <div class="display-6 fw-bold text-primary">{{ openedOrdersCount }}</div>
              </div>
              <div class="bg-info-subtle text-primary p-3 rounded-circle">
                <i class="bi bi-telephone-inbound-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted small fw-semibold text-uppercase">{{ 'Closed Orders' | translate }}</div>
                <div class="display-6 fw-bold text-secondary">{{ closedOrdersCount }}</div>
              </div>
              <div class="bg-light text-secondary p-3 rounded-circle">
                <i class="bi bi-check-circle-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <ul class="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border" id="dashboardTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link rounded-pill fw-bold px-4"
            [class.active]="activeTab === 'orders'"
            (click)="activeTab = 'orders'"
            type="button"
          >
            <i class="bi bi-receipt-cutoff me-2"></i> {{ 'Orders' | translate }}
            <span *ngIf="openedOrdersCount > 0" class="badge bg-danger rounded-pill ms-2">{{ openedOrdersCount }} {{ 'opened' | translate }}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link rounded-pill fw-bold px-4"
            [class.active]="activeTab === 'items'"
            (click)="activeTab = 'items'"
            type="button"
          >
            <i class="bi bi-box-seam me-2"></i> {{ 'Items & Inventory' | translate }}
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link rounded-pill fw-bold px-4"
            [class.active]="activeTab === 'categories'"
            (click)="activeTab = 'categories'"
            type="button"
          >
            <i class="bi bi-tags me-2"></i> {{ 'Categories' | translate }}
          </button>
        </li>
      </ul>

      <!-- ========================================== -->
      <!-- TAB 1: ORDERS MANAGEMENT                   -->
      <!-- ========================================== -->
      <div *ngIf="activeTab === 'orders'">
        <!-- Filter Controls -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div class="d-flex gap-2">
            <button
              class="btn btn-sm rounded-pill fw-semibold"
              [ngClass]="orderStatusFilter === '' ? 'btn-dark' : 'btn-outline-secondary'"
              (click)="setOrderFilter('')"
            >
              {{ 'All Orders' | translate }} ({{ orders.length }})
            </button>
            <button
              class="btn btn-sm rounded-pill fw-semibold"
              [ngClass]="orderStatusFilter === 'opened' ? 'btn-primary' : 'btn-outline-primary'"
              (click)="setOrderFilter('opened')"
            >
              {{ 'Opened Only' | translate }} ({{ openedOrdersCount }})
            </button>
            <button
              class="btn btn-sm rounded-pill fw-semibold"
              [ngClass]="orderStatusFilter === 'closed' ? 'btn-secondary' : 'btn-outline-secondary'"
              (click)="setOrderFilter('closed')"
            >
              {{ 'Closed Only' | translate }} ({{ closedOrdersCount }})
            </button>
          </div>

          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="loadOrders()">
            <i class="bi bi-arrow-clockwise me-1"></i> {{ 'Refresh Orders' | translate }}
          </button>
        </div>

        <!-- Orders Empty -->
        <div *ngIf="filteredOrders.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i class="bi bi-inbox text-muted display-4 mb-3 d-block"></i>
          <h5>{{ 'No Orders Found' | translate }}</h5>
          <p class="text-muted small">{{ 'Orders placed by customers will appear here for phone confirmation and status tracking.' | translate }}</p>
        </div>

        <!-- Orders List -->
        <div *ngIf="filteredOrders.length > 0" class="row g-4">
          <div *ngFor="let order of filteredOrders" class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" [ngClass]="order.status === 'opened' ? 'border-start border-primary border-4' : 'border-start border-secondary border-4'">
              <!-- Order Header -->
              <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <div>
                  <span class="badge text-uppercase px-3 py-2 fw-bold rounded-pill" [ngClass]="order.status === 'opened' ? 'bg-primary' : 'bg-secondary'">
                    <i class="bi me-1" [ngClass]="order.status === 'opened' ? 'bi-clock-history' : 'bi-check2-all'"></i>
                    {{ order.status | translate }}
                  </span>
                  <span *ngIf="order.paymentMethod === 'stripe'" class="badge bg-info text-dark ms-2">
                    <i class="bi bi-credit-card me-1"></i>Stripe
                  </span>
                  <span class="text-muted small ms-2">{{ order.createdAt | date:'medium' }}</span>
                </div>
                <span class="text-muted small font-monospace">#{{ order._id.slice(-6) }}</span>
              </div>

              <div class="card-body p-4">
                <div class="mb-3">
                  <h6 class="fw-bold text-dark mb-1"><i class="bi bi-person-circle me-1 text-primary"></i>{{ order.customer.name }}</h6>
                  <a [href]="'tel:' + order.customer.phone" class="small text-decoration-none">{{ order.customer.phone }}</a>
                  <p class="small text-muted mb-0 mt-1">{{ order.customer.address }}</p>
                </div>
                <div class="d-flex justify-content-between border-top pt-3">
                  <span class="small text-muted"><i class="bi bi-bag me-1"></i>{{ order.items.length }} {{ (order.items.length === 1 ? 'item' : 'items') | translate }}</span>
                  <strong class="text-dark">\${{ order.totalAmount | number:'1.2-2' }}</strong>
                </div>
                <div *ngIf="order.paymentMethod === 'stripe'" class="small mt-2">
                  {{ 'Payment' | translate }}:
                  <span class="badge" [ngClass]="{
                    'bg-success': order.paymentStatus === 'paid',
                    'bg-warning text-dark': order.paymentStatus === 'pending' || order.paymentStatus === 'processing',
                    'bg-danger': order.paymentStatus === 'failed'
                  }">{{ order.paymentStatus | translate }}</span>
                </div>
                <p *ngIf="order.notes" class="small text-muted mt-3 mb-0 text-truncate">
                  <i class="bi bi-chat-left-text me-1"></i>{{ order.notes }}
                </p>
              </div>

              <!-- Card Footer: Status Action -->
              <div class="card-footer bg-white border-top p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <a [routerLink]="['/dashboard/orders', order._id]" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-box-arrow-up-right me-1"></i> {{ 'View details' | translate }}
                </a>

                <div class="d-flex gap-2">
                  <button
                    *ngIf="order.status === 'opened'"
                    class="btn btn-sm btn-success rounded-pill px-3 fw-bold"
                    (click)="updateStatus(order, 'closed')"
                  >
                    <i class="bi bi-check-circle me-1"></i> {{ 'Close Order' | translate }}
                  </button>

                  <button
                    *ngIf="order.status === 'closed'"
                    class="btn btn-sm btn-outline-warning text-dark rounded-pill px-3 fw-bold"
                    (click)="updateStatus(order, 'opened')"
                  >
                    <i class="bi bi-arrow-counterclockwise me-1"></i> {{ 'Reopen Order' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: ITEMS & QUANTITY (MANAGER VIEW)     -->
      <!-- ========================================== -->
      <div *ngIf="activeTab === 'items'">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h4 class="fw-bold text-dark mb-1">{{ 'Product Inventory' | translate }}</h4>
            <p class="text-muted small mb-0">{{ 'Notice:' | translate }} <strong>{{ 'Item Quantity' | translate }}</strong> {{ 'is only visible and editable in this Manager interface.' | translate }}</p>
          </div>

          <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" (click)="openAddItemModal()">
            <i class="bi bi-plus-lg me-1"></i> {{ 'Add New Item' | translate }}
          </button>
        </div>

        <!-- Item Modal / Form (Inline or Popup) -->
        <div *ngIf="isItemModalOpen" class="card border-0 shadow-lg rounded-4 p-4 mb-4 bg-white border-top border-primary border-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0">{{ (editingItemId ? 'Edit Product' : 'Add New Product') | translate }}</h5>
            <button class="btn btn-sm btn-link text-muted" (click)="closeItemModal()"><i class="bi bi-x-lg"></i></button>
          </div>

          <form (ngSubmit)="saveItem()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold">{{ 'English Name' | translate }} *</label>
                <input type="text" class="form-control" [(ngModel)]="itemForm.nameEn" name="nameEn" required />
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">{{ 'Arabic Name' | translate }} *</label>
                <input type="text" class="form-control" dir="rtl" [(ngModel)]="itemForm.nameAr" name="nameAr" required />
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">{{ 'Category' | translate }} *</label>
                <select class="form-select" [(ngModel)]="itemForm.category" name="category" required>
                  <option value="" disabled>{{ 'Select Category' | translate }}</option>
                  <option *ngFor="let cat of categories" [value]="cat._id">{{ translations.localized(cat, 'name') }}</option>
                </select>
              </div>

              <div class="col-md-3">
                  <label class="form-label small fw-bold">{{ 'Price' | translate }} (\$) *</label>
                <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="itemForm.price" name="price" required />
              </div>

              <!-- Quantity field - Manager View -->
              <div class="col-md-3">
                <label class="form-label small fw-bold text-dark d-flex align-items-center justify-content-between">
                  <span>{{ 'Stock Quantity' | translate }} *</span>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle small fw-normal">{{ 'Manager View' | translate }}</span>
                </label>
                <div class="input-group">
                  <button type="button" class="btn btn-outline-secondary" (click)="decreaseFormQty()" [title]="'Decrease quantity' | translate">
                    <i class="bi bi-dash"></i>
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    class="form-control text-center fw-semibold"
                    [(ngModel)]="itemForm.quantity"
                    name="quantity"
                    required
                    placeholder="0"
                  />
                  <button type="button" class="btn btn-outline-secondary" (click)="increaseFormQty()" [title]="'Increase quantity' | translate">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold text-dark">
                  <i class="bi bi-image text-primary me-1"></i> {{ 'Item Photo (Choose from Device)' | translate }}
                </label>
                
                <div class="d-flex flex-wrap align-items-center gap-3 p-3 bg-light rounded-3 border">
                  <!-- Hidden File Input -->
                  <input
                    type="file"
                    #fileInput
                    (change)="onDevicePhotoSelected($event)"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    class="d-none"
                  />

                  <!-- Device Selection Button -->
                  <button
                    type="button"
                    class="btn btn-outline-primary rounded-pill px-3 py-2 fw-semibold"
                    (click)="fileInput.click()"
                  >
                    <i class="bi bi-laptop me-1"></i> {{ 'Choose Photo from Device' | translate }}
                  </button>

                  <!-- Preview Thumbnail if Selected or Existing -->
                  <div *ngIf="itemForm.imageUrl" class="d-flex align-items-center gap-3">
                    <div class="position-relative" style="width: 60px; height: 60px;">
                      <img
                        [src]="itemForm.imageUrl"
                        [alt]="'Item Preview' | translate"
                        class="w-100 h-100 object-fit-cover rounded-3 border shadow-sm"
                      />
                    </div>
                    <div>
                      <span class="badge bg-success-subtle text-success border border-success small mb-1">
                        <i class="bi bi-check-circle-fill me-1"></i> {{ 'Photo Ready' | translate }}
                      </span>
                      <div class="small text-muted text-truncate" style="max-width: 220px;">
                        {{ (photoFileName || 'Photo selected from device') | translate }}
                      </div>
                    </div>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger rounded-circle p-1"
                      [title]="'Remove Photo' | translate"
                      (click)="removeSelectedPhoto(fileInput)"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>

                  <span *ngIf="!itemForm.imageUrl" class="text-muted small">
                    <i class="bi bi-info-circle me-1"></i> {{ 'Select any PNG, JPG, or WebP photo from your device.' | translate }}
                  </span>
                </div>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold">{{ 'English Description' | translate }} *</label>
                <textarea rows="3" class="form-control" [(ngModel)]="itemForm.descriptionEn" name="descriptionEn" required></textarea>
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">{{ 'Arabic Description' | translate }} *</label>
                <textarea rows="3" class="form-control" dir="rtl" [(ngModel)]="itemForm.descriptionAr" name="descriptionAr" required></textarea>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-secondary rounded-pill px-4" (click)="closeItemModal()">{{ 'Cancel' | translate }}</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">
                {{ (editingItemId ? 'Update Item' : 'Create Item') | translate }}
              </button>
            </div>
          </form>
        </div>

        <!-- Items Table -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">{{ 'Item' | translate }}</th>
                  <th>{{ 'Category' | translate }}</th>
                  <th>{{ 'Price' | translate }}</th>
                  <th class="text-danger fw-bold"><i class="bi bi-shield-fill-check me-1"></i> {{ 'Quantity' | translate }}</th>
                  <th class="text-end pe-4">{{ 'Actions' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items">
                  <td class="ps-4 py-3">
                    <div class="d-flex align-items-center gap-3">
                      <img
                        [src]="item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'"
                        [alt]="translations.localized(item, 'name')"
                        class="rounded-3 object-fit-cover shadow-sm"
                        style="width: 50px; height: 50px;"
                      />
                      <div>
                        <div class="fw-bold text-dark">{{ translations.localized(item, 'name') }}</div>
                        <div class="text-muted small text-truncate" style="max-width: 250px;">{{ translations.localized(item, 'description') }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border rounded-pill">{{ getCategoryName(item.category) }}</span>
                  </td>
                  <td class="fw-bold text-dark">\${{ item.price | number:'1.2-2' }}</td>
                  <td>
                    <!-- Item quantity appears only to Manager -->
                    <span class="badge px-3 py-2 rounded-pill fw-bold" [ngClass]="(item.quantity || 0) > 10 ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'">
                      {{ item.quantity ?? 0 }} {{ 'in stock' | translate }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary rounded-pill me-2" (click)="openEditItemModal(item)">
                      <i class="bi bi-pencil-square me-1"></i> {{ 'Edit' | translate }}
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill" (click)="deleteItem(item._id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 3: CATEGORIES MANAGEMENT               -->
      <!-- ========================================== -->
      <div *ngIf="activeTab === 'categories'">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h4 class="fw-bold text-dark mb-1">{{ 'Item Categories' | translate }}</h4>
            <p class="text-muted small mb-0">{{ 'Manage product categories displayed on the public storefront.' | translate }}</p>
          </div>

          <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" (click)="openAddCategoryModal()">
            <i class="bi bi-plus-lg me-1"></i> {{ 'Add Category' | translate }}
          </button>
        </div>

        <!-- Category Modal / Form -->
        <div *ngIf="isCategoryModalOpen" class="card border-0 shadow-lg rounded-4 p-4 mb-4 bg-white border-top border-primary border-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0">{{ (editingCategoryId ? 'Edit Category' : 'Add New Category') | translate }}</h5>
            <button class="btn btn-sm btn-link text-muted" (click)="closeCategoryModal()"><i class="bi bi-x-lg"></i></button>
          </div>

          <form (ngSubmit)="saveCategory()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold">{{ 'English Name' | translate }} *</label>
                <input type="text" class="form-control" [(ngModel)]="categoryForm.nameEn" name="categoryNameEn" required />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">{{ 'Arabic Name' | translate }} *</label>
                <input type="text" class="form-control" dir="rtl" [(ngModel)]="categoryForm.nameAr" name="categoryNameAr" required />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">{{ 'English Description' | translate }} *</label>
                <input type="text" class="form-control" [(ngModel)]="categoryForm.descriptionEn" name="categoryDescriptionEn" required />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">{{ 'Arabic Description' | translate }} *</label>
                <input type="text" class="form-control" dir="rtl" [(ngModel)]="categoryForm.descriptionAr" name="categoryDescriptionAr" required />
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-secondary rounded-pill px-4" (click)="closeCategoryModal()">{{ 'Cancel' | translate }}</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">
                {{ (editingCategoryId ? 'Update Category' : 'Create Category') | translate }}
              </button>
            </div>
          </form>
        </div>

        <!-- Categories Table -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">{{ 'Category Name' | translate }}</th>
                  <th>{{ 'Description' | translate }}</th>
                  <th>{{ 'Created Date' | translate }}</th>
                  <th class="text-end pe-4">{{ 'Actions' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cat of categories">
                  <td class="ps-4 py-3 fw-bold text-dark">
                    <i class="bi bi-folder2-open text-primary me-2"></i> {{ translations.localized(cat, 'name') }}
                  </td>
                  <td class="text-muted small">{{ translations.localized(cat, 'description') || ('No description provided' | translate) }}</td>
                  <td class="text-muted small">{{ cat.createdAt | date:'shortDate' }}</td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary rounded-pill me-2" (click)="openEditCategoryModal(cat)">
                      <i class="bi bi-pencil-square me-1"></i> {{ 'Edit' | translate }}
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill" (click)="deleteCategory(cat._id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  activeTab: 'orders' | 'items' | 'categories' = 'orders';
  orderStatusFilter: '' | 'opened' | 'closed' = '';

  categories: Category[] = [];
  items: Item[] = [];
  orders: Order[] = [];

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  // Category Modal State
  isCategoryModalOpen: boolean = false;
  editingCategoryId: string | null = null;
  categoryForm = { nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '' };

  // Item Modal State
  isItemModalOpen: boolean = false;
  editingItemId: string | null = null;
  photoFileName: string = '';
  itemForm = {
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    price: 0,
    quantity: 0,
    category: '',
    imageUrl: ''
  };

  constructor(
    private categoryService: CategoryService,
    private itemService: ItemService,
    private orderService: OrderService,
    public authService: AuthService,
    private translations: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
    this.loadOrders();
  }

  get openedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'opened').length;
  }

  get closedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'closed').length;
  }

  get filteredOrders(): Order[] {
    if (!this.orderStatusFilter) return this.orders;
    return this.orders.filter(o => o.status === this.orderStatusFilter);
  }

  private sortOrdersByStatus(orders: Order[]): Order[] {
    return [...orders].sort((first, second) => {
      if (first.status !== second.status) {
        return first.status === 'opened' ? -1 : 1;
      }

      return new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime();
    });
  }

  setOrderFilter(filter: '' | 'opened' | 'closed'): void {
    this.orderStatusFilter = filter;
  }

  showAlert(message: string, type: 'success' | 'danger' = 'success'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (this.alertMessage === message) {
        this.alertMessage = null;
        this.cdr.markForCheck();
      }
    }, 4000);
  }

  // --- ORDERS ---
  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = this.sortOrdersByStatus(res.data);
          this.cdr.markForCheck();
        }
      },
      error: (err) => this.showAlert(err.error?.message || 'Error loading orders', 'danger')
    });
  }

  updateStatus(order: Order, newStatus: 'opened' | 'closed'): void {
    this.orderService.updateOrderStatus(order._id, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          order.status = newStatus;
          this.orders = this.sortOrdersByStatus(this.orders);
          this.showAlert(`Order marked as ${newStatus}`, 'success');
        }
      },
      error: (err) => this.showAlert(err.error?.message || 'Failed to update order status', 'danger')
    });
  }

  // --- ITEMS ---
  loadItems(): void {
    this.itemService.getItems().subscribe({
      next: (res) => {
        if (res.success) {
          this.items = res.data;
          this.cdr.markForCheck();
        }
      },
      error: (err) => this.showAlert(err.error?.message || 'Error loading items', 'danger')
    });
  }

  openAddItemModal(): void {
    this.editingItemId = null;
    this.photoFileName = '';
    this.itemForm = {
      nameEn: '',
      nameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      price: 0,
      quantity: 10,
      category: this.categories.length > 0 ? this.categories[0]._id : '',
      imageUrl: ''
    };
    this.isItemModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditItemModal(item: Item): void {
    this.editingItemId = item._id;
    this.photoFileName = item.imageUrl ? 'Current photo saved' : '';
    const catId = typeof item.category === 'object' ? (item.category as any)._id : item.category;
    this.itemForm = {
      nameEn: item.nameEn || item.name || '',
      nameAr: item.nameAr || '',
      descriptionEn: item.descriptionEn || item.description || '',
      descriptionAr: item.descriptionAr || '',
      price: item.price,
      quantity: item.quantity ?? 0,
      category: catId,
      imageUrl: item.imageUrl || ''
    };
    this.isItemModalOpen = true;
    this.cdr.markForCheck();
  }

  closeItemModal(): void {
    this.isItemModalOpen = false;
    this.editingItemId = null;
    this.photoFileName = '';
    this.cdr.markForCheck();
  }

  onDevicePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.showAlert('Please select an image file (PNG, JPG, WebP, etc.)', 'danger');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.showAlert('Selected photo is too large. Please select a photo under 10MB.', 'danger');
        return;
      }

      this.photoFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.itemForm.imageUrl = reader.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedPhoto(fileInput?: HTMLInputElement): void {
    this.itemForm.imageUrl = '';
    this.photoFileName = '';
    if (fileInput) {
      fileInput.value = '';
    }
    this.cdr.markForCheck();
  }

  decreaseFormQty(): void {
    const current = Number(this.itemForm.quantity) || 0;
    if (current > 0) {
      this.itemForm.quantity = current - 1;
      this.cdr.markForCheck();
    }
  }

  increaseFormQty(): void {
    const current = Number(this.itemForm.quantity) || 0;
    this.itemForm.quantity = current + 1;
    this.cdr.markForCheck();
  }

  saveItem(): void {
    const qty = Number(this.itemForm.quantity);
    const price = Number(this.itemForm.price);

    if (!this.itemForm.nameEn.trim() || !this.itemForm.nameAr.trim()) {
      this.showAlert('Please provide both Arabic and English product names', 'danger');
      return;
    }

    if (!this.itemForm.descriptionEn.trim() || !this.itemForm.descriptionAr.trim()) {
      this.showAlert('Please provide both Arabic and English product descriptions', 'danger');
      return;
    }

    if (!this.itemForm.category) {
      this.showAlert('Please select a product category', 'danger');
      return;
    }

    if (isNaN(price) || price < 0) {
      this.showAlert('Please enter a valid price (0 or greater)', 'danger');
      return;
    }

    if (isNaN(qty) || qty < 0) {
      this.showAlert('Please enter a valid stock quantity (0 or greater)', 'danger');
      return;
    }

    const payload = {
      ...this.itemForm,
      price: price,
      quantity: Math.floor(qty)
    };

    if (this.editingItemId) {
      this.itemService.updateItem(this.editingItemId, payload as any).subscribe({
        next: (res) => {
          if (res.success) {
            this.showAlert('Item updated successfully', 'success');
            this.closeItemModal();
            this.loadItems();
          }
        },
        error: (err) => this.showAlert(err.error?.message || 'Failed to update item', 'danger')
      });
    } else {
      this.itemService.createItem(payload as any).subscribe({
        next: (res) => {
          if (res.success) {
            this.showAlert('Item created successfully', 'success');
            this.closeItemModal();
            this.loadItems();
          }
        },
        error: (err) => this.showAlert(err.error?.message || 'Failed to create item', 'danger')
      });
    }
  }

  deleteItem(id: string): void {
    if (confirm(this.translations.translate('Are you sure you want to delete this item?'))) {
      this.itemService.deleteItem(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.showAlert('Item deleted successfully', 'success');
            this.loadItems();
          }
        },
        error: (err) => this.showAlert(err.error?.message || 'Failed to delete item', 'danger')
      });
    }
  }

  getCategoryName(category: any): string {
    if (!category) return '';
    if (typeof category === 'object') return this.translations.localized(category, 'name');
    const found = this.categories.find(c => c._id === category);
    return found ? this.translations.localized(found, 'name') : '';
  }

  // --- CATEGORIES ---
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
          this.cdr.markForCheck();
        }
      },
      error: (err) => this.showAlert(err.error?.message || 'Error loading categories', 'danger')
    });
  }

  openAddCategoryModal(): void {
    this.editingCategoryId = null;
    this.categoryForm = { nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '' };
    this.isCategoryModalOpen = true;
  }

  openEditCategoryModal(cat: Category): void {
    this.editingCategoryId = cat._id;
    this.categoryForm = {
      nameEn: cat.nameEn || cat.name || '',
      nameAr: cat.nameAr || '',
      descriptionEn: cat.descriptionEn || cat.description || '',
      descriptionAr: cat.descriptionAr || ''
    };
    this.isCategoryModalOpen = true;
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen = false;
    this.editingCategoryId = null;
  }

  saveCategory(): void {
    if (!this.categoryForm.nameEn.trim() || !this.categoryForm.nameAr.trim() || !this.categoryForm.descriptionEn.trim() || !this.categoryForm.descriptionAr.trim()) {
      this.showAlert('Arabic and English category names and descriptions are required', 'danger');
      return;
    }

    if (this.editingCategoryId) {
      this.categoryService.updateCategory(this.editingCategoryId, this.categoryForm).subscribe({
        next: (res) => {
          if (res.success) {
            this.showAlert('Category updated successfully', 'success');
            this.closeCategoryModal();
            this.loadCategories();
          }
        },
        error: (err) => this.showAlert(err.error?.message || 'Failed to update category', 'danger')
      });
    } else {
      this.categoryService.createCategory(this.categoryForm).subscribe({
        next: (res) => {
          if (res.success) {
            this.showAlert('Category created successfully', 'success');
            this.closeCategoryModal();
            this.loadCategories();
          }
        },
        error: (err) => this.showAlert(err.error?.message || 'Failed to create category', 'danger')
      });
    }
  }

  deleteCategory(id: string): void {
    if (confirm(this.translations.translate('Are you sure you want to delete this category?'))) {
      this.categoryService.deleteCategory(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.showAlert('Category deleted successfully', 'success');
            this.loadCategories();
          }
        },
        error: (err) => this.showAlert(err.error?.message || 'Cannot delete category with associated items', 'danger')
      });
    }
  }
}

