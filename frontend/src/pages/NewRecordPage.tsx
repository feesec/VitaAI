import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStyletron } from "baseui";
import { Tabs, Tab } from "baseui/tabs-motion";
import { Button } from "baseui/button";
import { Input } from "baseui/input";
import { FormControl } from "baseui/form-control";
import { Notification } from "baseui/notification";
import { createRecord, uploadReport, parseRecord } from "../api/records";
import type { IndicatorCreate } from "../api/records";

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

const NewRecordPage: React.FC = () => {
  const [css] = useStyletron();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeKey, setActiveKey] = useState<React.Key>("manual");
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

  const handleManualSubmit = async (e: React.FormEvent) => {
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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
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
    <div className={css({ padding: "32px" })}>
      <h1 className={css({ fontSize: "22px", fontWeight: "700", color: "#1A1A2E", marginBottom: "24px" })}>
        添加健康记录
      </h1>

      {error && (
        <Notification kind="negative" overrides={{ Body: { style: { width: "100%", marginBottom: "16px" } } }}>
          {error}
        </Notification>
      )}

      <Tabs
        activeKey={activeKey}
        onChange={({ activeKey: k }) => setActiveKey(k)}
        activateOnFocus
      >
        <Tab key="manual" title="手动录入">
          <form onSubmit={handleManualSubmit}>
            <FormControl label="检查日期">
              <Input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.currentTarget.value)}
                required
              />
            </FormControl>

            <div
              className={css({
                backgroundColor: "#fff",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                marginBottom: "20px",
              })}
            >
              {/* Table header */}
              <div
                className={css({
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
                  backgroundColor: "#F7F8FA",
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  gap: "8px",
                })}
              >
                <div>指标名称</div>
                <div>检测值</div>
                <div>单位</div>
                <div>参考范围</div>
              </div>

              {indicators.map((row, idx) => (
                <div
                  key={row.name}
                  className={css({
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
                    padding: "8px 16px",
                    alignItems: "center",
                    borderTop: "1px solid #F0F0F0",
                    gap: "8px",
                  })}
                >
                  <div className={css({ fontSize: "13px", color: "#333" })}>{row.name}</div>
                  <Input
                    type="number"
                    size="mini"
                    value={row.value}
                    onChange={(e) => handleValueChange(idx, e.currentTarget.value)}
                    placeholder="—"
                    step="any"
                  />
                  <div className={css({ fontSize: "12px", color: "#666" })}>{row.unit}</div>
                  <div className={css({ fontSize: "12px", color: "#999" })}>
                    {row.ref_range_low} ~ {row.ref_range_high}
                  </div>
                </div>
              ))}
            </div>

            <div className={css({ display: "flex", gap: "12px" })}>
              <Button type="submit" isLoading={submitting}>
                提交记录
              </Button>
              <Button kind="tertiary" type="button" onClick={() => navigate("/records")}>
                取消
              </Button>
            </div>
          </form>
        </Tab>

        <Tab key="upload" title="上传报告">
          <div className={css({ maxWidth: "480px" })}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={css({
                border: `2px dashed ${dragOver ? "#4FC3F7" : "#D0D0D0"}`,
                borderRadius: "12px",
                padding: "48px 32px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: dragOver ? "#F0FAFF" : "#FAFAFA",
                transition: "all 0.2s",
                marginBottom: "20px",
              })}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <div className={css({ fontSize: "40px", marginBottom: "12px" })}>📄</div>
              {uploadFile ? (
                <div>
                  <div className={css({ fontSize: "14px", fontWeight: "600", color: "#333" })}>
                    {uploadFile.name}
                  </div>
                  <div className={css({ fontSize: "12px", color: "#999", marginTop: "4px" })}>
                    {(uploadFile.size / 1024).toFixed(0)} KB
                  </div>
                </div>
              ) : (
                <div>
                  <div className={css({ fontSize: "14px", color: "#555", marginBottom: "4px" })}>
                    点击或拖拽文件到此处
                  </div>
                  <div className={css({ fontSize: "12px", color: "#999" })}>
                    支持 PDF、JPG、PNG 格式
                  </div>
                </div>
              )}
            </div>

            {uploadStatus === "uploading" && (
              <Notification kind="info" overrides={{ Body: { style: { width: "100%", marginBottom: "16px" } } }}>
                正在上传文件...
              </Notification>
            )}
            {uploadStatus === "parsing" && (
              <Notification kind="info" overrides={{ Body: { style: { width: "100%", marginBottom: "16px" } } }}>
                AI正在解析报告，请稍候...
              </Notification>
            )}

            <div className={css({ display: "flex", gap: "12px" })}>
              <Button
                onClick={handleUploadSubmit}
                isLoading={uploadStatus !== "idle"}
                disabled={!uploadFile || uploadStatus !== "idle"}
              >
                上传并解析
              </Button>
              <Button kind="tertiary" onClick={() => navigate("/records")}>
                取消
              </Button>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default NewRecordPage;
