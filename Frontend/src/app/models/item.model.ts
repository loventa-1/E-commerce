import { Category } from './category.model';

export interface Item {
  _id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  description: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  quantity?: number; // Only returned/visible to Manager!
  category: Category | string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
}

