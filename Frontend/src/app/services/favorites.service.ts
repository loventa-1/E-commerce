import { Injectable, signal, computed } from '@angular/core';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly storageKey = 'shop_favorite_items';
  private favoritesSignal = signal<Item[]>([]);

  favorites = computed(() => this.favoritesSignal());
  favoritesCount = computed(() => this.favoritesSignal().length);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.favoritesSignal.set(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error loading favorites from storage', e);
      this.favoritesSignal.set([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favoritesSignal()));
    } catch (e) {
      console.error('Error saving favorites to storage', e);
    }
  }

  isFavorite(itemId: string): boolean {
    return this.favoritesSignal().some(item => item._id === itemId);
  }

  toggleFavorite(item: Item): boolean {
    const current = [...this.favoritesSignal()];
    const index = current.findIndex(f => f._id === item._id);

    let isFav = false;
    if (index > -1) {
      current.splice(index, 1);
      isFav = false;
    } else {
      current.push(item);
      isFav = true;
    }

    this.favoritesSignal.set(current);
    this.saveToStorage();
    return isFav;
  }

  removeFromFavorites(itemId: string): void {
    const updated = this.favoritesSignal().filter(f => f._id !== itemId);
    this.favoritesSignal.set(updated);
    this.saveToStorage();
  }
}

