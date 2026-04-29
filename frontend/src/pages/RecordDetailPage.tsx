import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { PageShell } from "@/components/app/page-shell";
import { StatusBanner } from "@/components/app/status-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getRecord, interpretRecord } from "../api/records";
import type { HealthRecord, InterpretationResult, OrganSystem, RiskLevel } from "../types";

const ORGAN_NAMES: Record<OrganSystem, string> = {
  liver: "肝脏",
  cardiovascular: "心血管",
  digestive: "肠胃",
  lung: "肺部",
  other: "其他",
};

const RISK_COLORS: Record<RiskLevel, string> = {
  high: "text-rose-700 bg-rose-50",
  medium: "text-amber-700 bg-amber-50",
  low: "text-emerald-700 bg-emerald-50",
  normal: "text-emerald-700 bg-emerald-50",
  unknown: "text-slate-600 bg-slate-100",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
  normal: "正常",
  unknown: "未评估",
};

const SEVERITY_COLORS = {
  high: "text-rose-700 bg-rose-50",
  medium: "text-amber-700 bg-amber-50",
  low: "text-yellow-700 bg-yellow-50",
};

const STATUS_STYLES = {
  normal: "text-emerald-700 bg-emerald-50",
  high: "text-rose-700 bg-rose-50",
  low: "text-amber-700 bg-amber-50",
  abnormal: "text-violet-700 bg-violet-50",
};

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [interpreting, setInterpreting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getRecord(Number(id))
      .then((r) => {
        setRecord(r);
        if (r.interpretation_json) {
          try {
            setInterpretation(JSON.parse(r.interpretation_json) as InterpretationResult);
          } catch {
            // ignore malformed payloads
          }
        }
      })
      .catch(() => setError("加载记录失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInterpret = async () => {
    if (!id) return;
    setInterpreting(true);
    setError("");
    try {
      const result = await interpretRecord(Number(id));
      setInterpretation(result);
      const updated = await getRecord(Number(id));
      setRecord(updated);
    } catch {
      setError("AI解读失败，请稍后重试");
    } finally {
      setInterpreting(false);
    }
  };

  if (loading) return <LoadingSpinner message="加载记录..." />;
  if (!record) {
    return (
      <PageShell title="检查记录详情">
        <StatusBanner variant="error" message="记录未找到" />
      </PageShell>
    );
  }

  return (
    <PageShell title="检查记录详情" description={`记录日期 ${record.record_date}`}>
      <div className="mx-auto max-w-5xl space-y-6">
        {error ? <StatusBanner variant="error" message={error} /> : null}

        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-6">
            <span className="text-base font-semibold text-slate-900">{record.record_date}</span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              {record.source === "manual" ? "手动录入" : "上传报告"}
            </span>
          </CardContent>
        </Card>

        {record.indicators?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>检测指标 ({record.indicators.length} 项)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden p-0">
              <div className="grid grid-cols-[2fr_1fr_1fr_1.4fr_1fr] gap-3 bg-slate-100/80 px-5 py-3 text-xs font-semibold text-slate-500">
                <div>指标名称</div>
                <div>检测值</div>
                <div>单位</div>
                <div>参考范围</div>
                <div>状态</div>
              </div>
              {record.indicators.map((ind) => (
                <div
                  key={ind.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1.4fr_1fr] items-center gap-3 border-t border-slate-100 bg-white px-5 py-3"
                >
                  <div className="text-sm text-slate-700">{ind.name}</div>
                  <div className="text-sm font-semibold text-slate-900">{ind.value}</div>
                  <div className="text-xs text-slate-500">{ind.unit || "—"}</div>
                  <div className="text-xs text-slate-400">
                    {ind.ref_range_low !== undefined && ind.ref_range_high !== undefined
                      ? `${ind.ref_range_low} ~ ${ind.ref_range_high}`
                      : "—"}
                  </div>
                  <div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[ind.status]}`}>
                      {ind.status === "normal" ? "正常" : ind.status === "high" ? "偏高" : ind.status === "low" ? "偏低" : "异常"}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {!interpretation ? (
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">AI 健康解读</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">让 AI 分析您的检测指标，给出专业健康建议。</p>
              <Button className="mt-6" disabled={interpreting} onClick={handleInterpret}>
                {interpreting ? "AI 正在分析..." : "开始 AI 解读"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            <StatusBanner variant="info" title="AI 综合分析" message={interpretation.summary} />

            {interpretation.urgent_actions?.length ? (
              <StatusBanner variant="error" title="需要立即关注" message={interpretation.urgent_actions.join("；")} />
            ) : null}

            {interpretation.abnormal_indicators?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>异常指标</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {interpretation.abnormal_indicators.map((ind, i) => (
                    <div key={`${ind.name}-${i}`} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SEVERITY_COLORS[ind.severity]}`}>
                          {ind.severity === "high" ? "严重" : ind.severity === "medium" ? "中度" : "轻度"}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {ind.name}: {ind.value}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{ind.meaning}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {interpretation.organ_risks ? (
              <Card>
                <CardHeader>
                  <CardTitle>器官风险评估</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {(Object.entries(interpretation.organ_risks) as [OrganSystem, { level: RiskLevel; summary: string }][]).map(
                    ([organ, data]) => (
                      <div key={organ} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-900">{ORGAN_NAMES[organ] || organ}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${RISK_COLORS[data.level]}`}>
                            {RISK_LABELS[data.level]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{data.summary}</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            ) : null}

            {interpretation.recommendations?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>健康建议</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 pl-5 text-sm leading-6 text-slate-600">
                    {interpretation.recommendations.map((rec, i) => (
                      <li key={`${rec}-${i}`} className="list-disc">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </PageShell>
  );
}
