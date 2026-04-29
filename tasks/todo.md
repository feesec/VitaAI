# VitaAI Task List

**Tech Stack:** React + TypeScript + Vite + Base UI（pnpm）/ FastAPI + SQLModel + PostgreSQL（uv）/ Claude API（Python SDK）

---

## Phase 1: Foundation（基础骨架）

- [ ] **Task 1:** 项目初始化（`uv init` FastAPI + `pnpm create vite` React + Base UI + CORS）
- [ ] **Task 2:** 完整数据库 Schema（SQLModel 模型 + `alembic revision --autogenerate`）
- [ ] **Task 3:** 用户注册与登录（JWT auth，passlib bcrypt，前端 ProtectedRoute）

### Checkpoint 1
- [ ] `uv run uvicorn` + `pnpm dev` 同时运行无报错，`uv run alembic upgrade head` 成功，注册/登录流程可用

---

## Phase 2: 健康数据录入

- [ ] **Task 4:** 用户健康档案问卷（年龄/性别/生活习惯/家族史，`POST /profile`）
- [ ] **Task 5:** 手动健康指标录入（血压/血糖/血脂/转氨酶等，`POST /records` source=manual）

### Checkpoint 2
- [ ] 问卷 + 手动录入完整流程可用，数据正确落库，`indicator_value.organ_system` 正确映射

---

## Phase 3: AI 体检报告解读（MVP 核心）

- [ ] **Task 6:** 体检报告文件上传（FastAPI multipart，JPG/PNG/PDF，10MB 限制）
- [ ] **Task 7:** AI 报告解析与指标提取（Claude Python SDK，prompt caching，结构化 JSON 输出）
- [ ] **Task 8:** AI 综合解读 — 异常识别 + 器官风险映射 + 处理建议（结果持久化）

### Checkpoint 3
- [ ] 上传 → 解析 → 综合解读完整链路跑通，人工审核解读质量，ANTHROPIC_API_KEY 不硬编码

---

## Phase 4: 器官专题管理

- [ ] **Task 9:** 器官专题档案页（liver / cardiovascular / digestive / lung，风险等级联动）
- [ ] **Task 10:** 指标趋势追踪（recharts 折线图，参考范围色带，多次记录对比）

### Checkpoint 4
- [ ] 4 个器官档案均可访问，趋势图正确渲染，`uv run pytest` 器官 API 通过

---

## Phase 5: 风险提醒与建议

- [ ] **Task 11:** 风险提醒生成（连续 2 次异常触发 RiskAlert，dismiss 功能）
- [ ] **Task 12:** 器官专项生活方式建议（Claude API，结合用户档案定制，结果持久化）

### Checkpoint 5
- [ ] 完整用户流程端到端验证，所有 Claude 调用有 loading + 错误处理，`uv run pytest` 全通过

---

## Phase 6: 首页 Dashboard（整合层）

- [ ] **Task 13:** 用户 Dashboard（器官概览 + 活跃提醒 + 最近记录 + 快捷入口，新用户引导）

### Checkpoint 6
- [ ] 所有核心流程端到端验证通过，`pnpm build` 成功，无 console error / unhandled exception
