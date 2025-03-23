export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface User {
  id: number;
  first_name: string | null;
  last_name: string;
  initials: string | null;
  email: string;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export interface UserFormData {
  first_name?: string;
  last_name: string;
  initials?: string;
  email: string;
  status: UserStatus;
}
