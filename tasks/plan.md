# Implementation Plan: VitaAI

## Overview

VitaAI 是一个 AI 驱动的健康管理 Web 应用，核心功能是体检报告解读、器官专题健康管理、个性化风险提醒和生活方式建议生成。本计划将产品从零构建到 MVP，采用垂直切片方式，每个任务交付可测试的完整路径。

## Architecture Decisions

| 层 | 技术选型 | 理由 |
|---|---|---|
| 前端框架 | React 18 + TypeScript + Vite | SPA，快速热更新 |
| 前端 UI | Base UI（Uber）| 无主题约束，组件齐全 |
| 前端包管理 | pnpm | 节省磁盘，速度快 |
| 后端框架 | FastAPI | 异步，自动 OpenAPI，与 SQLModel 天然配合 |
| 后端包管理 | uv | 极快的依赖解析，lockfile 稳定 |
| ORM | SQLModel | SQLAlchemy + Pydantic 一体，模型同时用于 DB 和 API schema |
| 数据库迁移 | Alembic（通过 SQLModel）| SQLModel 底层仍用 Alembic 管理迁移 |
| 数据库 | PostgreSQL | 结构化健康数据，支持复杂关系查询 |
| AI | Claude API（Python SDK，claude-sonnet-4-6）| 报告解析、指标解读、建议生成 |
| Auth | JWT（python-jose + passlib）| 无状态，前端 localStorage 存 token |
| 文件存储 | 本地 `backend/uploads/` 目录 | MVP 阶段，预留 S3 接口 |

## 项目目录结构

```
VitaAI/
├── frontend/                  # React + TS + Vite
│   ├── src/
│   │   ├── api/               # axios 封装，类型化请求函数
│   │   ├── components/        # 共享 UI 组件
│   │   ├── pages/             # 页面组件（按路由）
│   │   ├── store/             # 全局状态（zustand）
│   │   └── types/             # 共享 TypeScript 类型
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                   # FastAPI + SQLModel
    ├── app/
    │   ├── main.py            # FastAPI 入口，CORS，路由挂载
    │   ├── models/            # SQLModel 模型（DB + schema 共用）
    │   ├── routers/           # 各业务路由模块
    │   ├── services/          # 业务逻辑（AI 调用、alert 生成等）
    │   ├── core/              # JWT auth、config、deps
    │   └── db.py              # DB engine + session
    ├── alembic/               # 迁移文件
    ├── alembic.ini
    ├── pyproject.toml         # uv 管理依赖
    └── uploads/               # 上传文件存储目录
```

## Dependency Graph

```
PostgreSQL Schema（SQLModel 模型）
    │
    ├── User（id, email, hashed_password, name）
    │       │
    │       └── HealthProfile（age, gender, habits, family_history）
    │
    ├── HealthRecord（source: manual|upload, record_date）
    │       │
    │       ├── FileUpload（file_path, file_type）
    │       └── IndicatorValue[]（name, value, unit, ref_range, status, organ_system）
    │
    ├── OrganProfile（organ: liver|cardiovascular|digestive|lung, risk_level, watch_items）
    │       │
    │       └── 关联 IndicatorValue（通过 organ_system 字段）
    │
    ├── RiskAlert（organ, urgency, message, action, dismissed）
    │       └── 由 IndicatorValue 趋势或 AI 解读触发
    │
    └── Recommendation（organ, content_json, generated_at）
            └── 由 Claude API 生成，持久化存储
```

**实现顺序（从底向上）：**
Schema → Auth → Health Profile → 数据录入 → AI 解读 → 器官档案 → 风险提醒 → 建议生成 → Dashboard

---

## Phase 1: Foundation（基础骨架）

### Task 1: 项目初始化

**Description:** 同时搭建前后端骨架。后端用 `uv init` 初始化 FastAPI 项目，配置 SQLModel + PostgreSQL + Alembic + CORS。前端用 `pnpm create vite` 初始化 React + TypeScript，安装 Base UI、react-router-dom、axios、zustand。

**Acceptance criteria:**
- [ ] `cd backend && uv run uvicorn app.main:app --reload` 启动成功，`/docs` 可访问
- [ ] `cd frontend && pnpm dev` 启动成功，主页可访问
- [ ] `uv run alembic upgrade head` 无报错（空迁移）
- [ ] 前端 `/` 页面可渲染 Base UI 的 Button 组件
- [ ] CORS 配置允许前端 `localhost:5173` 访问后端 `localhost:8000`

**Verification:**
- [ ] `curl http://localhost:8000/health` 返回 `{"status": "ok"}`
- [ ] 前端页面无 console error

**Dependencies:** None

**Files likely touched:**
- `backend/pyproject.toml`（uv 依赖：fastapi, uvicorn, sqlmodel, alembic, psycopg2, python-jose, passlib, anthropic）
- `backend/app/main.py`, `backend/app/db.py`, `backend/app/core/config.py`
- `backend/alembic.ini`, `backend/alembic/env.py`
- `frontend/package.json`（pnpm 依赖：baseui, styletron-engine-atomic, react-router-dom, axios, zustand, recharts）
- `frontend/vite.config.ts`
- `frontend/src/main.tsx`, `frontend/src/App.tsx`
- `.env`（DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY）

**Estimated scope:** M

---

### Task 2: 完整数据库 Schema

**Description:** 用 SQLModel 定义所有模型：User、HealthProfile、HealthRecord、IndicatorValue、OrganProfile、RiskAlert、Recommendation。生成 Alembic 初始迁移并执行。SQLModel 模型同时充当 Pydantic schema，供 FastAPI 直接用于请求/响应类型。

**Acceptance criteria:**
- [ ] 所有 SQLModel 模型定义完毕，`Relationship` 字段正确
- [ ] `uv run alembic revision --autogenerate -m "initial"` 生成迁移文件无报错
- [ ] `uv run alembic upgrade head` 成功创建所有表
- [ ] `psql` 中 `\dt` 可看到全部 7 张表

**Verification:**
- [ ] `uv run alembic upgrade head` 成功
- [ ] `psql -c "\dt"` 显示 7 张表

**Dependencies:** Task 1

**Files likely touched:**
- `backend/app/models/user.py`
- `backend/app/models/health_record.py`
- `backend/app/models/organ_profile.py`
- `backend/app/models/alert.py`
- `backend/app/models/recommendation.py`
- `backend/alembic/versions/xxxx_initial.py`

**Estimated scope:** S

---

### Task 3: 用户注册与登录

**Description:** JWT 邮箱/密码 Auth。后端提供 `POST /auth/register` 和 `POST /auth/token`（OAuth2 password flow），密码用 passlib bcrypt 哈希。前端实现注册页、登录页、token 存储（localStorage）、axios interceptor 注入 Bearer token、受保护路由守卫。

**Acceptance criteria:**
- [ ] `POST /auth/register` 创建用户，密码哈希存储，重复邮箱返回 409
- [ ] `POST /auth/token` 返回 JWT access token
- [ ] 前端登录后 token 存入 localStorage，后续请求自动带 `Authorization: Bearer` header
- [ ] 未登录访问 `/dashboard` 自动跳转 `/login`
- [ ] `GET /users/me` 返回当前用户信息（需 Bearer token）

**Verification:**
- [ ] `curl -X POST /auth/token -d "username=x&password=y"` 返回 token
- [ ] 完整注册 → 登录 → 刷新页面仍保持登录状态

**Dependencies:** Task 2

**Files likely touched:**
- `backend/app/routers/auth.py`
- `backend/app/core/security.py`（JWT 签发/验证）
- `backend/app/core/deps.py`（`get_current_user` dependency）
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/store/authStore.ts`
- `frontend/src/api/client.ts`（axios 实例 + interceptor）
- `frontend/src/components/ProtectedRoute.tsx`

**Estimated scope:** M

---

### Checkpoint 1: Foundation
- [ ] `uv run uvicorn app.main:app --reload` + `pnpm dev` 同时运行无报错
- [ ] `uv run alembic upgrade head` 成功，7 张表全部创建
- [ ] 注册 → 登录 → 退出完整流程可用
- [ ] 与用户确认 Tech Stack 无问题后继续

---

## Phase 2: 健康数据录入

### Task 4: 用户健康档案问卷

**Description:** 用户首次登录后填写基础健康档案，包含年龄、性别、身高体重、生活习惯（吸烟/饮酒/运动/睡眠）、家族史、慢病史。后端 `POST /profile`，前端问卷页 `/profile/setup`，完成后可在 `/profile` 查看编辑。

**Acceptance criteria:**
- [ ] `POST /profile` 创建 / `PUT /profile` 更新 HealthProfile
- [ ] `GET /profile` 返回当前用户档案
- [ ] 前端问卷表单包含所有字段，分步展示（基本信息 / 生活习惯 / 家族史）
- [ ] 提交后数据正确落库，`/profile` 页面显示已填内容

**Verification:**
- [ ] 填写问卷提交后，`GET /profile` 返回刚填的数据
- [ ] 修改字段后 `PUT /profile`，页面显示更新值

**Dependencies:** Task 3

**Files likely touched:**
- `backend/app/routers/profile.py`
- `frontend/src/pages/ProfileSetupPage.tsx`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/api/profile.ts`

**Estimated scope:** M

---

### Task 5: 手动健康指标录入

**Description:** 允许用户手动录入关键健康指标（血压、血糖、血脂、转氨酶、BMI 等），创建 `HealthRecord`（source=manual）并关联多个 `IndicatorValue`。前端按指标分组展示输入表单。

**Acceptance criteria:**
- [ ] `POST /records`（source=manual）创建记录 + 指标列表
- [ ] `GET /records` 返回当前用户所有记录列表
- [ ] 前端 `/records/new` 提供分组输入（肝功能 / 血脂 / 血糖 / 血压 / 血常规）
- [ ] 录入后 `/records` 列表显示该记录（日期、来源、指标数量）

**Verification:**
- [ ] 录入一组指标后，`GET /records` 返回新记录
- [ ] `indicator_value` 表有对应条目，`organ_system` 已按指标名自动映射

**Dependencies:** Task 4

**Files likely touched:**
- `backend/app/routers/records.py`
- `backend/app/services/indicator_mapper.py`（指标名 → 器官系统映射表）
- `frontend/src/pages/NewRecordPage.tsx`
- `frontend/src/pages/RecordsPage.tsx`
- `frontend/src/api/records.ts`

**Estimated scope:** M

---

### Checkpoint 2: 数据录入完成
- [ ] 问卷 + 手动录入完整流程可用
- [ ] `indicator_value.organ_system` 字段正确映射
- [ ] `uv run pytest` 通过基础 API 测试

---

## Phase 3: AI 体检报告解读（MVP 核心）

### Task 6: 体检报告文件上传

**Description:** FastAPI 接收 multipart/form-data，支持上传 JPG/PNG/PDF（限 10MB），文件保存至 `backend/uploads/{user_id}/`，创建 `HealthRecord`（source=upload）并记录文件路径。

**Acceptance criteria:**
- [ ] `POST /records/upload` 接收文件，保存磁盘，返回 record id
- [ ] 支持 JPG / PNG / PDF，超 10MB 返回 400
- [ ] 前端 `/records/new` 上传模式有拖拽区域 + 进度反馈
- [ ] 上传图片后前端显示预览，PDF 显示文件名

**Verification:**
- [ ] `curl -F "file=@report.jpg" /records/upload` 返回 `{"record_id": "..."}`
- [ ] `backend/uploads/{user_id}/` 目录下有对应文件

**Dependencies:** Task 4

**Files likely touched:**
- `backend/app/routers/records.py`（新增 upload endpoint）
- `backend/app/services/file_storage.py`
- `frontend/src/components/FileUpload.tsx`
- `frontend/src/pages/NewRecordPage.tsx`（更新）

**Estimated scope:** S

---

### Task 7: AI 报告解析与指标提取

**Description:** 调用 Claude API（Python SDK）对上传图片/PDF 内容解析，提取结构化指标 JSON，批量创建 `IndicatorValue`。使用 prompt caching 减少费用。

**Acceptance criteria:**
- [ ] `POST /records/{id}/parse` 触发 AI 解析，返回提取的指标列表
- [ ] Claude 返回结构化 JSON：`[{name, value, unit, ref_range, status}]`
- [ ] 批量写入 `IndicatorValue`，`organ_system` 自动映射
- [ ] 解析失败返回友好错误而非 500
- [ ] system prompt 使用 prompt caching（`cache_control: ephemeral`）

**Verification:**
- [ ] 上传含血常规图片后调用 parse，`indicator_value` 表有多条新记录
- [ ] `status` 字段正确标记（normal / high / low / abnormal）

**Dependencies:** Task 6

**Files likely touched:**
- `backend/app/routers/records.py`（新增 parse endpoint）
- `backend/app/services/claude/parse_report.py`
- `backend/app/services/claude/prompts.py`

**Estimated scope:** M

---

### Task 8: AI 综合解读 — 异常识别 + 器官风险映射

**Description:** 对一条记录的所有指标调用 Claude API 生成综合解读：异常指标列表、器官风险归类、处理建议（复查/观察/正常）。结果持久化，刷新不重新调用。前端 `/records/{id}` 展示解读报告，同时更新 `OrganProfile.risk_level`。

**Acceptance criteria:**
- [ ] `POST /records/{id}/interpret` 生成解读，结果存入 `health_record.interpretation_json`
- [ ] `GET /records/{id}` 返回包含解读的完整记录
- [ ] 前端解读页展示：异常指标高亮（按风险级别）、器官风险归类、处理建议
- [ ] 已有解读时直接返回缓存，不重复调用 Claude
- [ ] 解读同时更新对应 `OrganProfile.risk_level`

**Verification:**
- [ ] 含异常转氨酶的指标解读后，前端肝脏风险标红
- [ ] 重复调用 `GET /records/{id}` 不触发新 Claude 调用

**Dependencies:** Task 7

**Files likely touched:**
- `backend/app/routers/records.py`（新增 interpret endpoint）
- `backend/app/services/claude/interpret_record.py`
- `frontend/src/pages/RecordDetailPage.tsx`
- `frontend/src/components/InterpretationView.tsx`

**Estimated scope:** L（分两步：Claude service + 前端 UI）

---

### Checkpoint 3: AI 核心功能可用
- [ ] 上传 → 解析 → 综合解读完整链路跑通
- [ ] `ANTHROPIC_API_KEY` 在 `.env` 中，代码无硬编码
- [ ] 解读结果持久化，刷新不重复调用
- [ ] 人工审核至少 2 份真实报告的解读质量后继续

---

## Phase 4: 器官专题管理

### Task 9: 器官专题档案页

**Description:** 维护 4 个器官档案（liver / cardiovascular / digestive / lung）。`OrganProfile` 由 Task 8 解读时自动更新风险等级。前端 `/organs` 展示 4 卡片，`/organs/{organ}` 展示详情。

**Acceptance criteria:**
- [ ] `GET /organs` 返回 4 个器官档案（不存在时 risk_level=unknown）
- [ ] `GET /organs/{organ}` 返回详情 + 最近异常指标
- [ ] 前端卡片按风险等级显示不同颜色
- [ ] 详情页显示关联异常指标列表

**Verification:**
- [ ] Task 8 解读后，`GET /organs/liver` 返回正确 `risk_level`
- [ ] 前端 `/organs` 4 张卡片均正常渲染

**Dependencies:** Task 8

**Files likely touched:**
- `backend/app/routers/organs.py`
- `frontend/src/pages/OrgansPage.tsx`
- `frontend/src/pages/OrganDetailPage.tsx`
- `frontend/src/components/OrganCard.tsx`
- `frontend/src/api/organs.ts`

**Estimated scope:** M

---

### Task 10: 指标趋势追踪

**Description:** 器官详情页展示关键指标历史趋势折线图（recharts），X 轴为检查日期，Y 轴为数值，参考范围以背景色带标注。

**Acceptance criteria:**
- [ ] `GET /organs/{organ}/trends?indicator={name}` 返回时序数据
- [ ] 前端趋势图支持该器官 3 个以上关键指标
- [ ] 参考范围上下限在图表中可见
- [ ] 少于 2 条记录时显示占位提示

**Verification:**
- [ ] 手动创建 2 条含相同指标的记录，折线图正常显示
- [ ] 趋势线数值与录入值一致

**Dependencies:** Task 9

**Files likely touched:**
- `backend/app/routers/organs.py`（新增 trends endpoint）
- `frontend/src/components/TrendChart.tsx`
- `frontend/src/pages/OrganDetailPage.tsx`（更新）

**Estimated scope:** M

---

### Checkpoint 4: 器官管理可用
- [ ] 4 个器官档案均可访问，风险等级正确联动
- [ ] 趋势图在有多条记录时正确渲染
- [ ] `uv run pytest` 通过器官相关 API 测试

---

## Phase 5: 风险提醒与建议

### Task 11: 风险提醒生成

**Description:** 指标连续 2 次异常时自动生成 `RiskAlert`，在录入新记录时触发检测。Dashboard 展示未处理提醒，用户可 dismiss。

**Acceptance criteria:**
- [ ] 新建记录时触发 alert 检测逻辑
- [ ] 指标连续 2 次 status != normal 时生成 RiskAlert
- [ ] `GET /alerts` 返回未 dismiss 提醒，按 urgency 排序
- [ ] `POST /alerts/{id}/dismiss` 标记为已处理
- [ ] 前端 Dashboard 顶部展示活跃提醒

**Verification:**
- [ ] 创建 2 条含异常转氨酶记录，`GET /alerts` 返回 1 条肝脏提醒
- [ ] dismiss 后 `GET /alerts` 不再返回该条

**Dependencies:** Task 10

**Files likely touched:**
- `backend/app/services/alert_engine.py`
- `backend/app/routers/alerts.py`
- `frontend/src/components/AlertCard.tsx`
- `frontend/src/pages/DashboardPage.tsx`（更新）
- `frontend/src/api/alerts.ts`

**Estimated scope:** M

---

### Task 12: 器官专项生活方式建议

**Description:** 调用 Claude API 为每个器官生成个性化生活方式建议，结合用户健康档案和当前风险等级。结果持久化，用户可手动触发重新生成。

**Acceptance criteria:**
- [ ] `POST /organs/{organ}/recommendations` 生成建议并存储
- [ ] `GET /organs/{organ}/recommendations` 返回最新建议
- [ ] 前端器官详情页有"生活方式建议"区块，分类展示（饮食/运动/作息/复查）
- [ ] 对有吸烟史用户，肺部建议含戒烟相关内容
- [ ] 已有建议直接返回，点击"重新生成"才重新调用 Claude

**Verification:**
- [ ] 吸烟史=true 用户，`GET /organs/lung/recommendations` 含"戒烟"
- [ ] 连续两次 `GET` 不触发新 Claude 调用

**Dependencies:** Task 11

**Files likely touched:**
- `backend/app/services/claude/generate_recommendations.py`
- `backend/app/routers/organs.py`（新增 recommendations endpoints）
- `frontend/src/components/RecommendationPanel.tsx`
- `frontend/src/pages/OrganDetailPage.tsx`（更新）

**Estimated scope:** M

---

### Checkpoint 5: MVP 完成
- [ ] 完整流程：注册 → 录入 → AI 解读 → 器官档案 → 风险提醒 → 建议
- [ ] 所有 Claude 调用有 loading 状态 + 错误处理
- [ ] `uv run pytest` 全部通过
- [ ] 人工走通完整流程，验证 AI 解读质量

---

## Phase 6: 首页 Dashboard（整合层）

### Task 13: 用户 Dashboard

**Description:** 构建 `/dashboard` 整合页，汇总展示 4 个器官风险等级、活跃风险提醒、最近体检摘要、快捷操作入口。

**Acceptance criteria:**
- [ ] `GET /dashboard/summary` 返回器官概览 + 活跃提醒数 + 最近记录摘要
- [ ] 前端器官卡片、提醒区块、最近记录卡均正确展示
- [ ] 新用户无数据时显示引导提示
- [ ] 快捷按钮可直达 `/records/new` 和 `/organs`

**Verification:**
- [ ] 完成 Task 1-12 后，Dashboard 所有模块数据正确
- [ ] 新注册用户看到引导提示而非空白页

**Dependencies:** Task 11, Task 12

**Files likely touched:**
- `backend/app/routers/dashboard.py`
- `frontend/src/pages/DashboardPage.tsx`（重构）
- `frontend/src/components/dashboard/`

**Estimated scope:** M

---

### Checkpoint 6: 完整产品可用
- [ ] 所有核心流程端到端验证通过
- [ ] 无 console error / unhandled exception
- [ ] `pnpm build` 构建成功，`uv run pytest` 全部通过

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude API 解析报告准确性不稳定 | High | 提供手动编辑功能，允许用户修正 AI 提取的指标 |
| 报告图片质量差导致 AI 无法提取 | High | 增加错误提示，fallback 到手动录入 |
| 健康数据安全（行级隔离） | High | 所有 endpoint 通过 `get_current_user` dep 校验，查询强制过滤 `user_id` |
| SQLModel migration 与模型不同步 | Medium | 每次模型变更都执行 `alembic revision --autogenerate`，不手写 SQL |
| Claude API 调用费用超预期 | Medium | prompt caching，解读结果持久化，避免重复调用 |
| PDF 解析复杂（非图片）| Medium | MVP 优先支持图片，PDF→图片转换作为后续任务 |

## Open Questions

1. **部署方式：** Docker Compose 本地 / 自托管服务器 / 云平台？影响文件存储方案
2. **中文/英文 UI：** 全中文还是支持切换？
3. **用户规模：** 单用户 Demo 还是多用户生产？影响安全加固优先级
4. **报告格式：** 主要是手机拍照图片还是医院 PDF？影响 Task 7 解析策略
