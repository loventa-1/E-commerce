import { beforeEach, describe, expect, it } from 'vitest';
import { FavoritesService } from './favorites.service';
import { Item } from '../models/item.model';

describe('FavoritesService', () => {
  let service: FavoritesService;
  const headphones: Item = {
    _id: 'item-1',
    name: 'Headphones',
    description: 'Wireless headphones',
    price: 100,
    category: 'electronics'
  };

  beforeEach(() => {
    localStorage.clear();
    service = new FavoritesService();
  });

  it('adds and removes a favorite when toggled', () => {
    expect(service.toggleFavorite(headphones)).toBe(true);
    expect(service.isFavorite(headphones._id)).toBe(true);
    expect(service.favoritesCount()).toBe(1);

    expect(service.toggleFavorite(headphones)).toBe(false);
    expect(service.favoritesCount()).toBe(0);
  });

  it('restores favorites from local storage', () => {
    localStorage.setItem('shop_favorite_items', JSON.stringify([headphones]));
    service = new FavoritesService();

    expect(service.isFavorite(headphones._id)).toBe(true);
    expect(service.favorites()).toEqual([headphones]);
  });
});