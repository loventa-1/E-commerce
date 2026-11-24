import { Injectable, signal, computed } from '@angular/core';
import { Item, CartItem } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'shop_cart_items';
  private cartItemsSignal = signal<CartItem[]>([]);

  cartItems = computed(() => this.cartItemsSignal());
  totalItemsCount = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  totalPrice = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.item.price * item.quantity, 0)
  );

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.cartItemsSignal.set(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error loading cart from storage', e);
      this.cartItemsSignal.set([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cartItemsSignal()));
    } catch (e) {
      console.error('Error saving cart to storage', e);
    }
  }

  addToCart(item: Item, quantity: number = 1): void {
    const current = [...this.cartItemsSignal()];
    const index = current.findIndex(ci => ci.item._id === item._id);

    if (index > -1) {
      current[index].quantity += quantity;
    } else {
      current.push({ item, quantity });
    }

    this.cartItemsSignal.set(current);
    this.saveToStorage();
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const current = this.cartItemsSignal().map(ci => {
      if (ci.item._id === itemId) {
        return { ...ci, quantity };
      }
      return ci;
    });

    this.cartItemsSignal.set(current);
    this.saveToStorage();
  }

  removeFromCart(itemId: string): void {
    const updated = this.cartItemsSignal().filter(ci => ci.item._id !== itemId);
    this.cartItemsSignal.set(updated);
    this.saveToStorage();
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    localStorage.removeItem(this.storageKey);
  }
}

