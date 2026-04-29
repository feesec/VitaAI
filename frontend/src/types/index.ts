export interface User {
  id: number;
  email: string;
  name: string;
}

export interface HealthProfile {
  id: number;
  user_id: number;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  smoking: boolean;
  drinking: string;
  exercise: string;
  sleep_hours?: number;
  family_history?: string;
  chronic_conditions?: string;
}

export type IndicatorStatus = "normal" | "high" | "low" | "abnormal";
export type OrganSystem = "liver" | "cardiovascular" | "digestive" | "lung" | "other";
export type RiskLevel = "low" | "medium" | "high" | "unknown" | "normal";

export interface IndicatorValue {
  id: number;
  record_id: number;
  name: string;
  value: number;
  unit?: string;
  ref_range_low?: number;
  ref_range_high?: number;
  status: IndicatorStatus;
  organ_system?: OrganSystem;
}

export interface HealthRecord {
  id: number;
  user_id: number;
  source: "manual" | "upload";
  record_date: string;
  file_path?: string;
  interpretation_json?: string;
  created_at: string;
  indicators?: IndicatorValue[];
}

export interface OrganProfile {
  id: number;
  user_id: number;
  organ: OrganSystem;
  risk_level: RiskLevel;
  watch_items?: string;
  updated_at: string;
}

export interface InterpretationResult {
  summary: string;
  abnormal_indicators: {
    name: string;
    value: number;
    severity: "high" | "medium" | "low";
    meaning: string;
  }[];
  organ_risks: Record<OrganSystem, { level: RiskLevel; summary: string }>;
  recommendations: string[];
  urgent_actions: string[];
}
