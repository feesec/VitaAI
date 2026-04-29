import { useEffect, useState } from "react";
import { ArrowRight, FileUp, PencilLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrgans } from "../api/organs";
import { getRecords } from "../api/records";
import { useAuthStore } from "../store/authStore";
import type { HealthRecord, OrganProfile, OrganSystem, RiskLevel } from "../types";

const ORGAN_NAMES: Record<OrganSystem, string> = {
  liver: "肝脏",
  cardiovascular: "心血管",
  digestive: "肠胃",
  lung: "肺部",
  other: "其他",
};

const RISK_COLORS: Record<RiskLevel, string> = {
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
  unknown: "未知",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [organs, setOrgans] = useState<OrganProfile[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    getOrgans().then(setOrgans).catch(() => {});
    getRecords().then(setRecords).catch(() => {});
  }, []);

  const recentRecords = records.slice(0, 3);

  return (
    <PageShell
      title={`你好，${user?.name || "用户"}`}
      description="今天适合回顾最近体检结果，看看哪些器官系统值得优先关注。"
    >
      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/records/new")}>
            <FileUp className="h-4 w-4" />
            上传体检报告
          </Button>
          <Button variant="secondary" onClick={() => navigate("/records/new")}>
            <PencilLine className="h-4 w-4" />
            手动录入
          </Button>
        </div>

        <section>
          <div className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">器官健康概览</div>
          <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
            {(["liver", "cardiovascular", "digestive", "lung"] as OrganSystem[]).map((organKey) => {
              const profile = organs.find((o) => o.organ === organKey);
              const risk = profile?.risk_level || "unknown";
              return (
                <Card key={organKey} className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate("/organs")}>
                  <CardContent className="p-5">
                    <div className="text-sm text-slate-500">专项管理</div>
                    <div className="mt-3 text-xl font-semibold text-slate-950">{ORGAN_NAMES[organKey]}</div>
                    <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${RISK_COLORS[risk]}`}>
                      {RISK_LABELS[risk]}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">最近记录</div>
            <Button variant="ghost" onClick={() => navigate("/records")}>
              查看全部
            </Button>
          </div>

          {recentRecords.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-sm text-slate-500">暂无健康记录，点击上方按钮添加第一条记录。</CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <Card key={record.id} className="cursor-pointer transition-transform hover:-translate-y-0.5" onClick={() => navigate(`/records/${record.id}`)}>
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <div className="font-semibold text-slate-900">{record.record_date}</div>
                      <div className="mt-2 text-sm text-slate-500">
                        {record.source === "manual" ? "手动录入" : "上传报告"}
                        {record.indicators ? ` · ${record.indicators.length} 项指标` : ""}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-sky-500" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
