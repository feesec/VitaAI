import { useEffect, useState } from "react";
import { FormField } from "@/components/app/form-field";
import { PageShell } from "@/components/app/page-shell";
import { StatusBanner } from "@/components/app/status-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "../components/LoadingSpinner";
import { createProfile, getProfile, updateProfile, type HealthProfileCreate } from "../api/profile";
import type { HealthProfile } from "../types";

const DRINKING_OPTIONS = [
  { label: "不饮酒", id: "none" },
  { label: "偶尔", id: "occasional" },
  { label: "适量", id: "moderate" },
  { label: "经常", id: "frequent" },
];

const EXERCISE_OPTIONS = [
  { label: "不运动", id: "none" },
  { label: "偶尔运动", id: "occasional" },
  { label: "每周2-3次", id: "regular" },
  { label: "每天运动", id: "daily" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [smoking, setSmoking] = useState(false);
  const [drinking, setDrinking] = useState("none");
  const [exercise, setExercise] = useState("occasional");
  const [sleepHours, setSleepHours] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setIsNew(false);
        setAge(p.age?.toString() || "");
        setGender(p.gender || "");
        setHeight(p.height_cm?.toString() || "");
        setWeight(p.weight_kg?.toString() || "");
        setSmoking(p.smoking);
        setDrinking(p.drinking || "none");
        setExercise(p.exercise || "occasional");
        setSleepHours(p.sleep_hours?.toString() || "");
        setFamilyHistory(p.family_history || "");
        setChronicConditions(p.chronic_conditions || "");
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setIsNew(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    const data: HealthProfileCreate = {
      age: age ? Number(age) : undefined,
      gender: gender || undefined,
      height_cm: height ? Number(height) : undefined,
      weight_kg: weight ? Number(weight) : undefined,
      smoking,
      drinking,
      exercise,
      sleep_hours: sleepHours ? Number(sleepHours) : undefined,
      family_history: familyHistory || undefined,
      chronic_conditions: chronicConditions || undefined,
    };
    try {
      const saved = isNew ? await createProfile(data) : await updateProfile(data);
      setProfile(saved);
      setIsNew(false);
      setSuccess(true);
    } catch {
      setError("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="加载健康档案..." />;

  return (
    <PageShell
      title="健康档案"
      description="维护基础身体信息与生活习惯，后续 AI 解读会基于这些资料提供更贴近你的建议。"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        {success ? <StatusBanner variant="success" message="保存成功。" /> : null}
        {error ? <StatusBanner variant="error" message={error} /> : null}
        {isNew ? <StatusBanner variant="info" message="您还没有健康档案，请先完成创建。" /> : null}

        <Card>
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="年龄">
                  <Input type="number" value={age} onChange={(e) => setAge(e.currentTarget.value)} placeholder="岁" min={0} max={150} />
                </FormField>
                <FormField label="性别">
                  <Input value={gender} onChange={(e) => setGender(e.currentTarget.value)} placeholder="男 / 女" />
                </FormField>
                <FormField label="身高 (cm)">
                  <Input type="number" value={height} onChange={(e) => setHeight(e.currentTarget.value)} placeholder="cm" />
                </FormField>
                <FormField label="体重 (kg)">
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.currentTarget.value)} placeholder="kg" />
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="睡眠时长 (小时/天)">
                  <Input
                    type="number"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.currentTarget.value)}
                    placeholder="小时"
                    min={0}
                    max={24}
                  />
                </FormField>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={smoking} id="smoking" onCheckedChange={(checked) => setSmoking(checked === true)} />
                    <Label htmlFor="smoking">吸烟</Label>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">用于心血管、肺部等方向的风险评估。</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="饮酒情况">
                  <Select onValueChange={setDrinking} value={drinking}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择饮酒情况" />
                    </SelectTrigger>
                    <SelectContent>
                      {DRINKING_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="运动频率">
                  <Select onValueChange={setExercise} value={exercise}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择运动频率" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISE_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="家族病史">
                  <Input
                    value={familyHistory}
                    onChange={(e) => setFamilyHistory(e.currentTarget.value)}
                    placeholder="如：高血压、糖尿病等"
                  />
                </FormField>
                <FormField label="慢性病情况">
                  <Input
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.currentTarget.value)}
                    placeholder="如：高血压、糖尿病等"
                  />
                </FormField>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400">{profile ? `档案 ID: ${profile.id}` : "创建后会生成档案 ID"}</div>
                <Button type="submit" disabled={saving}>
                  {saving ? "保存中..." : isNew ? "创建档案" : "保存修改"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
