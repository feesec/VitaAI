import { useEffect, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getRecords } from "../api/records";
import type { HealthRecord } from "../types";

export default function RecordsPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecords()
      .then(setRecords)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="加载记录..." />;

  return (
    <PageShell
      title="健康记录"
      description="查看历史体检、化验和 AI 解读结果。"
      action={
        <Button onClick={() => navigate("/records/new")}>
          <Plus className="h-4 w-4" />
          添加记录
        </Button>
      }
    >
      {records.length === 0 ? (
        <EmptyState
          icon="📋"
          title="暂无健康记录"
          description="添加您的第一条体检记录，开始 AI 健康分析。"
          action={<Button onClick={() => navigate("/records/new")}>立即添加</Button>}
        />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id} className="cursor-pointer transition-transform hover:-translate-y-0.5" onClick={() => navigate(`/records/${record.id}`)}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-base font-semibold text-slate-900">{record.record_date}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
                      {record.source === "manual" ? "手动录入" : "上传报告"}
                    </span>
                    {record.indicators?.length ? <span>{record.indicators.length} 项指标</span> : null}
                    {record.interpretation_json ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">已 AI 解读</span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-sky-500" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
