export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'manager';
  token?: string;
}

