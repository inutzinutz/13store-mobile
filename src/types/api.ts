/**
 * TypeScript types matching API v1 models
 */

// Customer types
export type CustomerType = 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT';
export type CustomerStatus = 'LEAD' | 'PROSPECT' | 'CUSTOMER' | 'PARTNER' | 'INACTIVE';
export type PotentialLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'KEY_ACCOUNT';

export interface Customer {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: CustomerType;
  status: CustomerStatus;
  potential: PotentialLevel;
  assignedToId: string | null;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Deal types
export type DealStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

export interface Deal {
  id: string;
  title: string;
  description: string | null;
  value: number;
  probability: number;
  stage: DealStage;
  customerId: string;
  assignedToId: string | null;
  expectedCloseDate: string | null;
  closedDate: string | null;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Product types
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'DISCONTINUED';
export type ProductType = 'PRODUCT' | 'SERVICE' | 'SUBSCRIPTION';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  type: ProductType;
  status: ProductStatus;
  price: number;
  cost: number | null;
  currency: string;
  taxRate: number;
  stock: number;
  lowStockThreshold: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Invoice types
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLineItem {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string | null;
  lineItems: InvoiceLineItem[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: any;
}

// Filter and sort types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CustomerFilters extends PaginationParams {
  status?: CustomerStatus;
  type?: CustomerType;
  potential?: PotentialLevel;
  assignedToId?: string;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DealFilters extends PaginationParams {
  stage?: DealStage;
  customerId?: string;
  assignedToId?: string;
  minValue?: number;
  maxValue?: number;
  search?: string;
  sortBy?: 'title' | 'value' | 'createdAt' | 'expectedCloseDate';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilters extends PaginationParams {
  status?: ProductStatus;
  type?: ProductType;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceFilters extends PaginationParams {
  status?: InvoiceStatus;
  customerId?: string;
  search?: string;
  sortBy?: 'invoiceNumber' | 'issueDate' | 'total';
  sortOrder?: 'asc' | 'desc';
}
