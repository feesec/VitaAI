import React, { useState, useEffect } from "react";
import { useStyletron } from "baseui";
import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import { Checkbox } from "baseui/checkbox";
import { Select } from "baseui/select";
import { Notification } from "baseui/notification";
import { getProfile, createProfile, updateProfile } from "../api/profile";
import type { HealthProfileCreate } from "../api/profile";
import type { HealthProfile } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

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

const ProfilePage: React.FC = () => {
  const [css] = useStyletron();
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
  const [drinking, setDrinking] = useState([{ label: "不饮酒", id: "none" }]);
  const [exercise, setExercise] = useState([{ label: "偶尔运动", id: "occasional" }]);
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
        const drinkOpt = DRINKING_OPTIONS.find((o) => o.id === p.drinking);
        if (drinkOpt) setDrinking([drinkOpt]);
        const exOpt = EXERCISE_OPTIONS.find((o) => o.id === p.exercise);
        if (exOpt) setExercise([exOpt]);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      drinking: (drinking[0]?.id as string) || "none",
      exercise: (exercise[0]?.id as string) || "occasional",
      sleep_hours: sleepHours ? Number(sleepHours) : undefined,
      family_history: familyHistory || undefined,
      chronic_conditions: chronicConditions || undefined,
    };
    try {
      let saved: HealthProfile;
      if (isNew) {
        saved = await createProfile(data);
        setIsNew(false);
      } else {
        saved = await updateProfile(data);
      }
      setProfile(saved);
      setSuccess(true);
    } catch {
      setError("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="加载健康档案..." />;

  return (
    <div className={css({ padding: "32px", maxWidth: "640px" })}>
      <h1 className={css({ fontSize: "22px", fontWeight: "700", color: "#1A1A2E", marginBottom: "24px" })}>
        健康档案
      </h1>

      {success && (
        <Notification kind="positive" overrides={{ Body: { style: { width: "100%", marginBottom: "16px" } } }}>
          保存成功！
        </Notification>
      )}
      {error && (
        <Notification kind="negative" overrides={{ Body: { style: { width: "100%", marginBottom: "16px" } } }}>
          {error}
        </Notification>
      )}

      {isNew && (
        <Notification kind="info" overrides={{ Body: { style: { width: "100%", marginBottom: "16px" } } }}>
          您还没有健康档案，请填写以下信息创建档案。
        </Notification>
      )}

      <form onSubmit={handleSubmit}>
        <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" })}>
          <FormControl label="年龄">
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.currentTarget.value)}
              placeholder="岁"
              min={0}
              max={150}
            />
          </FormControl>

          <FormControl label="性别">
            <Input
              value={gender}
              onChange={(e) => setGender(e.currentTarget.value)}
              placeholder="男 / 女"
            />
          </FormControl>

          <FormControl label="身高 (cm)">
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.currentTarget.value)}
              placeholder="cm"
            />
          </FormControl>

          <FormControl label="体重 (kg)">
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.currentTarget.value)}
              placeholder="kg"
            />
          </FormControl>
        </div>

        <FormControl label="睡眠时长 (小时/天)">
          <Input
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.currentTarget.value)}
            placeholder="小时"
            min={0}
            max={24}
          />
        </FormControl>

        <FormControl label="饮酒情况">
          <Select
            options={DRINKING_OPTIONS}
            value={drinking}
            onChange={({ value }) => setDrinking(value as typeof drinking)}
            clearable={false}
          />
        </FormControl>

        <FormControl label="运动频率">
          <Select
            options={EXERCISE_OPTIONS}
            value={exercise}
            onChange={({ value }) => setExercise(value as typeof exercise)}
            clearable={false}
          />
        </FormControl>

        <FormControl label="">
          <Checkbox checked={smoking} onChange={() => setSmoking(!smoking)}>
            吸烟
          </Checkbox>
        </FormControl>

        <FormControl label="家族病史">
          <Input
            value={familyHistory}
            onChange={(e) => setFamilyHistory(e.currentTarget.value)}
            placeholder="如：高血压、糖尿病等"
          />
        </FormControl>

        <FormControl label="慢性病情况">
          <Input
            value={chronicConditions}
            onChange={(e) => setChronicConditions(e.currentTarget.value)}
            placeholder="如：高血压、糖尿病等"
          />
        </FormControl>

        <Button type="submit" isLoading={saving}>
          {isNew ? "创建档案" : "保存修改"}
        </Button>
      </form>

      {profile && (
        <div className={css({ marginTop: "16px", fontSize: "12px", color: "#999" })}>
          档案 ID: {profile.id}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
