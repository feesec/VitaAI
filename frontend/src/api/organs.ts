import { apiClient } from "./client";
import type { OrganProfile, OrganSystem } from "../types";

export async function getOrgans(): Promise<OrganProfile[]> {
  const res = await apiClient.get<OrganProfile[]>("/organs");
  return res.data;
}

export async function getOrgan(organ: OrganSystem): Promise<OrganProfile> {
  const res = await apiClient.get<OrganProfile>(`/organs/${organ}`);
  return res.data;
}
