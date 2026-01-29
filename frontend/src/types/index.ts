//! types/index.ts
export type Product = {
  id: number;
  name: string;
  price: number;
  imagePath: string;
  labels?: string;
};

export type Tag = {
  id: number;
  name: string;
};
