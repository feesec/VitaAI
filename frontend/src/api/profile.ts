import { apiClient } from "./client";
import type { HealthProfile } from "../types";

export type HealthProfileCreate = Omit<HealthProfile, "id" | "user_id">;
export type HealthProfileUpdate = Partial<HealthProfileCreate>;

export async function getProfile(): Promise<HealthProfile> {
  const res = await apiClient.get<HealthProfile>("/profile");
  return res.data;
}

export async function createProfile(data: HealthProfileCreate): Promise<HealthProfile> {
  const res = await apiClient.post<HealthProfile>("/profile", data);
  return res.data;
}

export async function updateProfile(data: HealthProfileUpdate): Promise<HealthProfile> {
  const res = await apiClient.put<HealthProfile>("/profile", data);
  return res.data;
}
