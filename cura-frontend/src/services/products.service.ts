import api from "./api";
import type { CreateProductDto, CreateBatchDto } from "../types/product.types";

export const productsService = {
  // Catalogs
  getCatalogs: async (tenant_id: string) => {
    const response = await api.get("/products/catalogs", {
      params: { tenant_id },
    });
    return response.data;
  },
  createCatalog: async (data: { tenant_id: string; name: string }) => {
    const response = await api.post("/products/catalogs", data);
    return response.data;
  },
  updateCatalog: async (
    id: string,
    data: { name?: string; is_active?: boolean },
  ) => {
    const response = await api.patch(`/products/catalogs/${id}`, data);
    return response.data;
  },
  deleteCatalog: async (id: string) => {
    const response = await api.delete(`/products/catalogs/${id}`);
    return response.data;
  },

  // Sections
  getSections: async (tenant_id: string) => {
    const response = await api.get("/products/sections", {
      params: { tenant_id },
    });
    return response.data;
  },
  createSection: async (data: { tenant_id: string; name: string }) => {
    const response = await api.post("/products/sections", data);
    return response.data;
  },
  updateSection: async (
    id: string,
    data: { name?: string; is_active?: boolean },
  ) => {
    const response = await api.patch(`/products/sections/${id}`, data);
    return response.data;
  },
  deleteSection: async (id: string) => {
    const response = await api.delete(`/products/sections/${id}`);
    return response.data;
  },

  // Brands
  getBrands: async (tenant_id: string) => {
    const response = await api.get("/products/brands", {
      params: { tenant_id },
    });
    return response.data;
  },
  createBrand: async (data: { tenant_id: string; name: string }) => {
    const response = await api.post("/products/brands", data);
    return response.data;
  },
  updateBrand: async (
    id: string,
    data: { name?: string; is_active?: boolean },
  ) => {
    const response = await api.patch(`/products/brands/${id}`, data);
    return response.data;
  },
  deleteBrand: async (id: string) => {
    const response = await api.delete(`/products/brands/${id}`);
    return response.data;
  },

  // Products
  getProducts: async (tenant_id: string) => {
    const response = await api.get("/products", { params: { tenant_id } });
    return response.data;
  },
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (data: CreateProductDto & { tenant_id: string }) => {
    const response = await api.post("/products", data);
    return response.data;
  },
  updateProduct: async (id: string, data: Partial<CreateProductDto>) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Batches
  getBatches: async (tenant_id: string) => {
    const response = await api.get("/products/batches", {
      params: { tenant_id },
    });
    return response.data;
  },
  createBatch: async (data: CreateBatchDto) => {
    const response = await api.post("/products/batches", data);
    return response.data;
  },
  updateBatch: async (id: string, data: Partial<CreateBatchDto>) => {
    const response = await api.patch(`/products/batches/${id}`, data);
    return response.data;
  },
};
