import { useEffect, useState } from "react";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getOrgans } from "../api/organs";
import type { OrganProfile, OrganSystem, RiskLevel } from "../types";

const ORGAN_NAMES: Record<OrganSystem, string> = {
  liver: "肝脏",
  cardiovascular: "心血管",
  digestive: "肠胃",
  lung: "肺部",
  other: "其他",
};

const ORGAN_ICONS: Record<OrganSystem, string> = {
  liver: "🫀",
  cardiovascular: "❤️",
  digestive: "🫃",
  lung: "🫁",
  other: "🔬",
};

const RISK_STYLES: Record<RiskLevel, string> = {
  high: "text-rose-600 bg-rose-50",
  medium: "text-amber-600 bg-amber-50",
  low: "text-emerald-600 bg-emerald-50",
  normal: "text-emerald-600 bg-emerald-50",
  unknown: "text-slate-500 bg-slate-100",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
  normal: "正常",
  unknown: "未评估",
};

const MAIN_ORGANS: OrganSystem[] = ["liver", "cardiovascular", "digestive", "lung"];

export default function OrgansPage() {
  const [organs, setOrgans] = useState<OrganProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrgans()
      .then(setOrgans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="加载器官健康数据..." />;

  return (
    <PageShell
      title="器官健康"
      description="基于您的历史检测数据，AI 对各器官健康状况的综合评估。"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {MAIN_ORGANS.map((organKey) => {
          const profile = organs.find((o) => o.organ === organKey);
          const risk = profile?.risk_level || "unknown";
          return (
            <Card key={organKey}>
              <CardContent className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-3xl">{ORGAN_ICONS[organKey]}</div>
                    <div className="mt-3 text-2xl font-semibold text-slate-950">{ORGAN_NAMES[organKey]}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${RISK_STYLES[risk]}`}>{RISK_LABELS[risk]}</span>
                </div>

                {profile?.watch_items ? (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">关注项目</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{profile.watch_items}</div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">暂无趋势数据</div>
                )}

                {profile?.updated_at ? (
                  <div className="mt-5 text-xs text-slate-400">
                    更新于 {new Date(profile.updated_at).toLocaleDateString("zh-CN")}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
