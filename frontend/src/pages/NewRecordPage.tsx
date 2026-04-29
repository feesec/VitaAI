import { useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/app/form-field";
import { PageShell } from "@/components/app/page-shell";
import { StatusBanner } from "@/components/app/status-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createRecord, parseRecord, uploadReport, type IndicatorCreate } from "../api/records";

interface IndicatorRow {
  name: string;
  value: string;
  unit: string;
  ref_range_low: number;
  ref_range_high: number;
  organ_system: string;
}

const PRESET_INDICATORS: IndicatorRow[] = [
  { name: "ALT（谷丙转氨酶）", value: "", unit: "U/L", ref_range_low: 7, ref_range_high: 56, organ_system: "liver" },
  { name: "AST（谷草转氨酶）", value: "", unit: "U/L", ref_range_low: 10, ref_range_high: 40, organ_system: "liver" },
  { name: "总胆固醇", value: "", unit: "mmol/L", ref_range_low: 2.8, ref_range_high: 5.2, organ_system: "cardiovascular" },
  { name: "甘油三酯", value: "", unit: "mmol/L", ref_range_low: 0.56, ref_range_high: 1.7, organ_system: "cardiovascular" },
  { name: "血糖", value: "", unit: "mmol/L", ref_range_low: 3.9, ref_range_high: 6.1, organ_system: "cardiovascular" },
  { name: "收缩压", value: "", unit: "mmHg", ref_range_low: 90, ref_range_high: 140, organ_system: "cardiovascular" },
  { name: "舒张压", value: "", unit: "mmHg", ref_range_low: 60, ref_range_high: 90, organ_system: "cardiovascular" },
  { name: "幽门螺杆菌", value: "", unit: "U/mL", ref_range_low: 0, ref_range_high: 30, organ_system: "digestive" },
];

export default function NewRecordPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("manual");
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [indicators, setIndicators] = useState<IndicatorRow[]>(PRESET_INDICATORS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "parsing">("idle");
  const [dragOver, setDragOver] = useState(false);

  const handleValueChange = (idx: number, val: string) => {
    setIndicators((prev) => prev.map((row, i) => (i === idx ? { ...row, value: val } : row)));
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filled = indicators.filter((row) => row.value.trim() !== "");
    if (filled.length === 0) {
      setError("请至少填写一项指标值");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload: IndicatorCreate[] = filled.map((row) => ({
        name: row.name,
        value: Number(row.value),
        unit: row.unit,
        ref_range_low: row.ref_range_low,
        ref_range_high: row.ref_range_high,
        organ_system: row.organ_system,
      }));
      const record = await createRecord({ record_date: recordDate, indicators: payload });
      navigate(`/records/${record.id}`);
    } catch {
      setError("提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setUploadFile(file);
    setError("");
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setError("请先选择文件");
      return;
    }
    setError("");
    setUploadStatus("uploading");
    try {
      const { record_id } = await uploadReport(uploadFile);
      setUploadStatus("parsing");
      await parseRecord(record_id);
      navigate(`/records/${record_id}`);
    } catch {
      setError("上传失败，请稍后重试");
      setUploadStatus("idle");
    }
  };

  return (
    <PageShell title="添加健康记录" description="支持手动录入关键指标，也支持直接上传体检报告。">
      <div className="mx-auto max-w-6xl space-y-4">
        {error ? <StatusBanner variant="error" message={error} /> : null}
        {uploadStatus === "uploading" ? <StatusBanner variant="info" message="正在上传文件..." /> : null}
        {uploadStatus === "parsing" ? <StatusBanner variant="info" message="AI 正在解析报告，请稍候..." /> : null}

        <Tabs onValueChange={setActiveTab} value={activeTab}>
          <TabsList>
            <TabsTrigger value="manual">手动录入</TabsTrigger>
            <TabsTrigger value="upload">上传报告</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card>
              <CardContent className="p-6">
                <form className="space-y-6" onSubmit={handleManualSubmit}>
                  <div className="max-w-xs">
                    <FormField label="检查日期">
                      <Input type="date" value={recordDate} onChange={(e) => setRecordDate(e.currentTarget.value)} required />
                    </FormField>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-slate-200">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1.4fr] gap-3 bg-slate-100/80 px-5 py-3 text-xs font-semibold text-slate-500">
                      <div>指标名称</div>
                      <div>检测值</div>
                      <div>单位</div>
                      <div>参考范围</div>
                    </div>
                    {indicators.map((row, idx) => (
                      <div key={row.name} className="grid grid-cols-[2fr_1fr_1fr_1.4fr] items-center gap-3 border-t border-slate-100 bg-white px-5 py-3">
                        <div className="text-sm text-slate-700">{row.name}</div>
                        <Input
                          className="h-9"
                          type="number"
                          value={row.value}
                          onChange={(e) => handleValueChange(idx, e.currentTarget.value)}
                          placeholder="—"
                          step="any"
                        />
                        <div className="text-xs text-slate-500">{row.unit}</div>
                        <div className="text-xs text-slate-400">
                          {row.ref_range_low} ~ {row.ref_range_high}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button disabled={submitting} type="submit">
                      {submitting ? "提交中..." : "提交记录"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate("/records")}>
                      取消
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardContent className="max-w-2xl p-6">
                <div
                  className={`rounded-[28px] border-2 border-dashed p-10 text-center transition ${
                    dragOver ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-slate-50/70"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragLeave={() => setDragOver(false)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileSelect(file);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    {uploadFile ? <FileUp className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
                  </div>
                  {uploadFile ? (
                    <>
                      <div className="text-base font-semibold text-slate-900">{uploadFile.name}</div>
                      <div className="mt-2 text-sm text-slate-500">{(uploadFile.size / 1024).toFixed(0)} KB</div>
                    </>
                  ) : (
                    <>
                      <div className="text-base font-semibold text-slate-900">点击或拖拽文件到此处</div>
                      <div className="mt-2 text-sm text-slate-500">支持 PDF、JPG、PNG 格式</div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button disabled={!uploadFile || uploadStatus !== "idle"} onClick={handleUploadSubmit}>
                    {uploadStatus === "idle" ? "上传并解析" : "处理中..."}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/records")}>
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}
