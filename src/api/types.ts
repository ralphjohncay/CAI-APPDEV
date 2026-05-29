export type OrderStatus =
  | 'pending_approval'
  | 'pending'
  | 'approved'
  | 'completed'
  | 'canceled';

export type OrderItemType = 'product' | 'service';

export interface ApiSuccessResponse {
  success?: boolean;
  message?: string;
}

export interface ApiResourceRef {
  '@id'?: string;
  '@type'?: string;
}

export interface Category extends ApiResourceRef {
  id: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface Product extends ApiResourceRef {
  id: number;
  name: string;
  price: string;
  description?: string | null;
  category?: Category | string | null;
  stock?: number;
  image?: string | null;
  isActive?: boolean;
}

export interface Service extends ApiResourceRef {
  id: number;
  name: string;
  description?: string | null;
  price: string;
  category?: Category | string | null;
  isActive?: boolean;
}

export interface OrderItem extends ApiResourceRef {
  id?: number;
  name: string;
  price: string;
  quantity: number;
  type: OrderItemType;
  product?: string | Product | null;
  service?: string | Service | null;
}

export interface Order extends ApiResourceRef {
  id: number;
  customer?: string | ApiResourceRef | null;
  customerId?: number;
  orderDate?: string;
  totalPrice?: string;
  total?: number | string;
  status: OrderStatus;
  orderItems?: OrderItem[];
}

export interface ApiUser {
  id: number;
  email: string;
  name: string;
  roles?: string[];
  isVerified?: boolean;
  isActive?: boolean;
}

export interface LoginResponse extends ApiSuccessResponse {
  token: string;
  user?: ApiUser;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponse extends ApiSuccessResponse {
  user?: ApiUser;
  token?: string;
  verificationToken?: string;
}

export interface MeResponse extends ApiSuccessResponse, ApiUser {}

export interface MyOrdersResponse extends ApiSuccessResponse {
  orders: Order[];
}

export interface CreateOrderResponse extends ApiSuccessResponse {
  order: Order;
}

export interface SingleOrderResponse extends ApiSuccessResponse {
  order: Order;
}

export interface HydraView {
  '@id'?: string;
  'hydra:first'?: string;
  'hydra:last'?: string;
  'hydra:next'?: string;
  'hydra:previous'?: string;
}

export interface HydraCollection<T> {
  '@context'?: string;
  '@id'?: string;
  '@type'?: string;
  'hydra:member'?: T[];
  member?: T[];
  'hydra:totalItems'?: number;
  totalItems?: number;
  'hydra:view'?: HydraView;
  orders?: T[];
}

export interface CartLine {
  key: string;
  type: OrderItemType;
  resourceId: number;
  iri: string;
  name: string;
  price: string;
  quantity: number;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface AppNotification {
  id: number;
  title?: string | null;
  message: string;
  type: NotificationType;
  audience?: 'all' | 'customers';
  priority?: number;
  startsAt?: string;
  expiresAt?: string | null;
  createdAt?: string;
}

export interface NotificationsResponse extends ApiSuccessResponse {
  notifications: AppNotification[];
}
