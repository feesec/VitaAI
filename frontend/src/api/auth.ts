import { apiClient } from "./client";
import type { User } from "../types";

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  name: string;
  access_token: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/register", payload);
  return res.data;
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  const res = await apiClient.post<TokenResponse>("/auth/token", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>("/users/me");
  return res.data;
}
