export interface LoginRequest {
  email: string;
  password: string;
}

export const USER_ROLE = {
  SUPER_ADMIN: "super_admin",
  TENANT_ADMIN: "tenant_admin",
  BRANCH_MANAGER: "branch_manager",
  CASHIER: "cashier",
  WAREHOUSE: "warehouse",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  branch_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
