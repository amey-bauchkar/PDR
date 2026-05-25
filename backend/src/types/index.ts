// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Product Types
export interface Product {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: string;
  environment: string;
  mountType: string;
  capacity: number;
  specifications: Record<string, any>;
  imageUrl: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  environment?: string;
  mountType?: string;
  minCapacity?: number;
  maxCapacity?: number;
  category?: string;
}

// Quote/RFQ Types
export interface QuoteItem {
  productId: string;
  productName: string;
  quantity: number;
  configuration?: Record<string, any>;
}

export interface QuoteRequest {
  id: string;
  sessionHash: string;
  name: string;
  email: string;
  company: string;
  notes?: string;
  items: QuoteItem[];
  status: 'pending' | 'submitted' | 'processed';
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// User/Admin Types
export type AdminRole = 'admin' | 'super_admin';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: AdminRole;
  iat: number;
  exp: number;
}

// Configurator Types
export interface ConfiguratorStep {
  step: number;
  parameter: string;
  options: ConfiguratorOption[];
}

export interface ConfiguratorOption {
  value: string;
  label: string;
  description?: string;
}

export interface ConfiguratorSelection {
  fiberType: string;
  connectorType: string;
  cableLength: number;
  jacketType: string;
}

// Calculator Types
export interface OpticalLinkBudgetInput {
  distance: number;
  fiberLoss: number;
  connectorCount: number;
}

export interface OpticalLinkBudgetResult {
  totalLoss: number;
  signalQuality: string;
  recommendation: string;
}

// Error Types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Pagination Query
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ContactInquiryPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: string;
  message: string;
}
