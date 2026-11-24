import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <footer class="bg-dark text-light py-4 mt-auto border-top border-secondary">
      <div class="container">
        <div class="row align-items-center gy-3">
          <div class="col-md-6 text-center text-md-start">
            <h5 class="fw-bold mb-1 text-white">Modern<span class="text-primary">Shop</span></h5>
            <p class="text-secondary small mb-0">{{ 'Phone order and delivery service' | translate }}</p>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <span class="badge bg-secondary p-2 me-2">
              <i class="bi bi-telephone-outbound-fill text-warning me-1"></i> {{ 'Orders & Delivery via Phone Call' | translate }}
            </span>
            <span class="text-secondary small">&copy; 2026 {{ 'Shop Project' | translate }}</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}

