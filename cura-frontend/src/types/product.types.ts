export interface Catalog {
  id: string;
  tenant_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  tenant_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  tenant_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  catalog_id: string | null;
  section_id: string | null;
  brand_id: string | null;
  name_ar: string;
  name_en: string | null;
  scientific_name: string | null;
  barcode: string | null;
  unit: string;
  sub_unit: string | null;
  sub_unit_qty: number | null;
  min_stock_alert: number;
  is_taxable: boolean;
  discount_value: number | null;
  discount_type: "percentage" | "fixed" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  catalog?: Catalog;
  section?: Section;
  brand?: Brand;
  batches?: Batch[];
}

export interface Batch {
  id: string;
  product_id: string;
  branch_id: string | null;
  warehouse_id: string | null;
  lot_number: string | null;
  manufacture_date: string | null;
  expiry_date: string | null;
  purchase_price: number;
  selling_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface CreateProductDto {
  name_ar: string;
  name_en?: string;
  scientific_name?: string;
  barcode?: string;
  unit: string;
  sub_unit?: string;
  sub_unit_qty?: number;
  min_stock_alert?: number;
  is_taxable?: boolean;
  catalog_id?: string;
  section_id?: string;
  brand_id?: string;
  discount_value?: number;
  discount_type?: "percentage" | "fixed";
}

export interface CreateBatchDto {
  product_id: string;
  branch_id?: string;
  warehouse_id?: string;
  lot_number?: string;
  manufacture_date?: string;
  expiry_date?: string;
  purchase_price: number;
  selling_price: number;
}
