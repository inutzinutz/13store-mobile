/**
 * API Service using RTK Query
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../config';
import { getApiKey } from './auth';
import {
  Customer,
  Deal,
  Product,
  Invoice,
  PaginatedResponse,
  ApiResponse,
  CustomerFilters,
  DealFilters,
  ProductFilters,
  InvoiceFilters,
} from '../types/api';

// Build query string from filters
const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
};

// Create the API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: async (headers) => {
      const apiKey = await getApiKey();
      if (apiKey) {
        headers.set('X-API-Key', apiKey);
      }
      return headers;
    },
    timeout: API_CONFIG.TIMEOUT,
  }),
  tagTypes: ['Customer', 'Deal', 'Product', 'Invoice'],
  endpoints: (builder) => ({
    // ============================================
    // CUSTOMERS
    // ============================================
    getCustomers: builder.query<PaginatedResponse<Customer>, CustomerFilters>({
      query: (filters) => `customers?${buildQueryString(filters)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Customer' as const, id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    getCustomer: builder.query<ApiResponse<Customer>, string>({
      query: (id) => `customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

    createCustomer: builder.mutation<
      ApiResponse<Customer>,
      Partial<Customer>
    >({
      query: (body) => ({
        url: 'customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),

    updateCustomer: builder.mutation<
      ApiResponse<Customer>,
      { id: string; data: Partial<Customer> }
    >({
      query: ({ id, data }) => ({
        url: `customers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    // ============================================
    // DEALS
    // ============================================
    getDeals: builder.query<PaginatedResponse<Deal>, DealFilters>({
      query: (filters) => `deals?${buildQueryString(filters)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Deal' as const, id })),
              { type: 'Deal', id: 'LIST' },
            ]
          : [{ type: 'Deal', id: 'LIST' }],
    }),

    getDeal: builder.query<ApiResponse<Deal>, string>({
      query: (id) => `deals/${id}`,
      providesTags: (result, error, id) => [{ type: 'Deal', id }],
    }),

    createDeal: builder.mutation<ApiResponse<Deal>, Partial<Deal>>({
      query: (body) => ({
        url: 'deals',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Deal', id: 'LIST' }],
    }),

    updateDeal: builder.mutation<
      ApiResponse<Deal>,
      { id: string; data: Partial<Deal> }
    >({
      query: ({ id, data }) => ({
        url: `deals/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Deal', id },
        { type: 'Deal', id: 'LIST' },
      ],
    }),

    deleteDeal: builder.mutation<void, string>({
      query: (id) => ({
        url: `deals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Deal', id },
        { type: 'Deal', id: 'LIST' },
      ],
    }),

    // ============================================
    // PRODUCTS
    // ============================================
    getProducts: builder.query<PaginatedResponse<Product>, ProductFilters>({
      query: (filters) => `products?${buildQueryString(filters)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProduct: builder.query<ApiResponse<Product>, string>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<ApiResponse<Product>, Partial<Product>>({
      query: (body) => ({
        url: 'products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; data: Partial<Product> }
    >({
      query: ({ id, data }) => ({
        url: `products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // ============================================
    // INVOICES
    // ============================================
    getInvoices: builder.query<PaginatedResponse<Invoice>, InvoiceFilters>({
      query: (filters) => `invoices?${buildQueryString(filters)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Invoice' as const, id })),
              { type: 'Invoice', id: 'LIST' },
            ]
          : [{ type: 'Invoice', id: 'LIST' }],
    }),

    getInvoice: builder.query<ApiResponse<Invoice>, string>({
      query: (id) => `invoices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),

    createInvoice: builder.mutation<ApiResponse<Invoice>, Partial<Invoice>>({
      query: (body) => ({
        url: 'invoices',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),

    updateInvoice: builder.mutation<
      ApiResponse<Invoice>,
      { id: string; data: Partial<Invoice> }
    >({
      query: ({ id, data }) => ({
        url: `invoices/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks
export const {
  // Customers
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,

  // Deals
  useGetDealsQuery,
  useGetDealQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,

  // Products
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Invoices
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = api;
