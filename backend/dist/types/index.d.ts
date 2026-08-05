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
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: any | undefined;
    constructor(statusCode: number, code: string, message: string, details?: any | undefined);
}
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
//# sourceMappingURL=index.d.ts.map