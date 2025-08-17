export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  fullDescription?: string;
  image_url?: string;
  category: string;
  categoryId?: string;
  sku?: string;
  inStock?: boolean;
  stockQuantity?: number;
  images?: Array<{
    id: string;
    url: string;
    alt: string;
    isPrimary?: boolean;
    order?: number;
  }> | string[];
  features?: string[];
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  benefits?: string[];
  warranty?: string;
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  image_url: string;
  category: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}