import { beforeEach, describe, expect, it } from 'vitest';
import { CartService } from './cart.service';
import { Item } from '../models/item.model';

describe('CartService', () => {
  let service: CartService;
  const headphones: Item = {
    _id: 'item-1',
    name: 'Headphones',
    description: 'Wireless headphones',
    price: 100,
    category: 'electronics'
  };

  beforeEach(() => {
    localStorage.clear();
    service = new CartService();
  });

  it('adds items and calculates cart totals', () => {
    service.addToCart(headphones, 2);

    expect(service.cartItems()).toHaveLength(1);
    expect(service.totalItemsCount()).toBe(2);
    expect(service.totalPrice()).toBe(200);
  });

  it('combines quantities for the same item and persists changes', () => {
    service.addToCart(headphones, 1);
    service.addToCart(headphones, 3);

    expect(service.cartItems()[0].quantity).toBe(4);
    expect(JSON.parse(localStorage.getItem('shop_cart_items')!)[0].quantity).toBe(4);
  });

  it('removes items when their quantity is set to zero', () => {
    service.addToCart(headphones);
    service.updateQuantity(headphones._id, 0);

    expect(service.cartItems()).toEqual([]);
    expect(service.totalItemsCount()).toBe(0);
  });
});