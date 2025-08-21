export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  full_description?: string;
  image_url?: string;
  category?: string;
  category_id?: string;
  categories?: {
    name: string;
    slug: string;
  };
  sku?: string;
  images?: Array<{
    id: string;
    url: string;
    alt: string;
    isPrimary?: boolean;
    order?: number;
  }> | string[];
  features?: string[];
  specifications?: Record<string, string> | Array<{
    name: string;
    value: string;
  }>;
  benefits?: string[];
  warranty?: string;
  certifications?: string[];
  rating?: number;
  review_count?: number;
  tags?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  short_description?: string;
  full_description?: string;
  sku?: string;
  category_id: string;
  images?: string[];
  specifications?: Record<string, string>;
  features?: string[];
  benefits?: string[];
  warranty?: string;
  certifications?: string[];
  rating?: number;
  review_count?: number;
  tags?: string[];
  is_active?: boolean;
  is_featured?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface ProductDetailResponse {
  product: Product;
}

export interface ProductFilter {
  category?: string;
  categories?: string[];
  search?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface ProductSort {
  field: 'name' | 'created_at' | 'price';
  direction: 'asc' | 'desc';
}