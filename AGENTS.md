# Repository Guidelines

## Project Structure & Module Organization
VitaAI is split into `backend/` and `frontend/`. The FastAPI service lives in `backend/app/`, with routers in `app/routers/`, shared settings and auth helpers in `app/core/`, data models in `app/models/`, and domain logic in `app/services/`. Backend tests live in `backend/tests/`. The React app lives in `frontend/src/`, with page-level routes in `src/pages/`, reusable UI in `src/components/`, API clients in `src/api/`, and Zustand state in `src/store/`. Static assets belong in `frontend/public/` or `frontend/src/assets/`.

## Build, Test, and Development Commands
Backend:
- `cd backend && uv sync` installs Python dependencies.
- `cd backend && uv run uvicorn app.main:app --reload` starts the API locally.
- `cd backend && uv run --group dev pytest -q` runs the backend test suite.

Frontend:
- `cd frontend && pnpm install` installs Node dependencies.
- `cd frontend && pnpm dev` starts the Vite dev server.
- `cd frontend && pnpm build` creates the production bundle.
- `cd frontend && pnpm lint` runs ESLint on `src/`.

## Coding Style & Naming Conventions
Follow the existing style in each app. Python uses 4-space indentation, type-aware models, and `snake_case` for modules, functions, and variables. Keep FastAPI routers thin and move business rules into `app/services/`. TypeScript uses the repo’s ESLint config and 2-space-prettified output is not enforced; match the current source style, which uses semicolons and double quotes in `src/`. Use `PascalCase` for React components and page files, `camelCase` for hooks, helpers, and API modules.

## Testing Guidelines
Backend tests use `pytest`, `fastapi.testclient`, and in-memory SQLite fixtures from `backend/tests/conftest.py`. Add tests beside related API behavior in files named `test_<feature>.py`. Cover auth, record ownership, and interpretation flows when changing backend behavior. The frontend currently has no automated tests, so changes there should at minimum pass `pnpm lint` and a manual smoke check in the browser.

## Commit & Pull Request Guidelines
Recent commits use short imperative subjects such as `implement VitaAI minimal demo` and `add README.md for VitaAI project overview and features`. Keep commits focused and similarly concise. PRs should explain the user-facing change, list verification steps, link relevant tasks, and include screenshots for frontend UI updates.

## Security & Configuration Tips
Do not commit real secrets or uploaded health data. Keep local overrides in `backend/.env`, use `backend/.env.example` as the template, and treat `backend/uploads/` and `vitaai.db` as local development artifacts unless a change explicitly targets them.
