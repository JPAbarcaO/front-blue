export interface User {
  email: string;
  name: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}
