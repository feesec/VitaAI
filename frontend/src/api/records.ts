import { apiClient } from "./client";
import type { HealthRecord, IndicatorValue, InterpretationResult } from "../types";

export interface IndicatorCreate {
  name: string;
  value: number;
  unit?: string;
  ref_range_low?: number;
  ref_range_high?: number;
  organ_system?: string;
}

export interface CreateRecordPayload {
  record_date: string;
  indicators: IndicatorCreate[];
}

export async function getRecords(): Promise<HealthRecord[]> {
  const res = await apiClient.get<HealthRecord[]>("/records");
  return res.data;
}

export async function createRecord(data: CreateRecordPayload): Promise<HealthRecord> {
  const res = await apiClient.post<HealthRecord>("/records", data);
  return res.data;
}

export async function getRecord(id: number): Promise<HealthRecord> {
  const res = await apiClient.get<HealthRecord>(`/records/${id}`);
  return res.data;
}

export async function uploadReport(file: File): Promise<{ record_id: number }> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post<{ record_id: number }>("/records/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function parseRecord(id: number): Promise<IndicatorValue[]> {
  const res = await apiClient.post<IndicatorValue[]>(`/records/${id}/parse`);
  return res.data;
}

export async function interpretRecord(id: number): Promise<InterpretationResult> {
  const res = await apiClient.post<InterpretationResult>(`/records/${id}/interpret`);
  return res.data;
}
