// API Base URL
export const API_BASE_URL = 'http://localhost:8080/api';

// User Roles
export const USER_ROLES = {
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT',
  ADMIN: 'ADMIN'
};

// Property Types
export const PROPERTY_TYPES = [
  'APARTMENT',
  'HOUSE',
  'CONDO',
  'TOWNHOUSE',
  'STUDIO',
  'DUPLEX'
];

// Lease Status
export const LEASE_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
  PENDING: 'PENDING'
};

// Payment Status
export const PAYMENT_STATUS = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
  PARTIAL: 'PARTIAL'
};

// Maintenance Status
export const MAINTENANCE_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Maintenance Priority
export const MAINTENANCE_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// Document Types
export const DOCUMENT_TYPES = [
  'LEASE_AGREEMENT',
  'INSURANCE',
  'INSPECTION_REPORT',
  'RECEIPT',
  'IDENTITY_PROOF',
  'OTHER'
];

// Expense Categories
export const EXPENSE_CATEGORIES = [
  'MAINTENANCE',
  'UTILITIES',
  'INSURANCE',
  'TAXES',
  'REPAIRS',
  'IMPROVEMENTS',
  'LEGAL',
  'OTHER'
];