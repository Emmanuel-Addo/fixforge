---
name: fixforge_development
description: Guidelines and patterns for developing the FixForge AI Software Engineering Assistant
---

# FixForge Development Guidelines

FixForge is composed of a Next.js frontend and a FastAPI backend. Below are the patterns and standards used in this workspace.

## Project Structure
- **Frontend** (`/frontend`): Next.js 15+ App Router application. Main dashboard view is at `frontend/app/dashboard/page.tsx`.
- **Backend** (`/backend`): FastAPI application.
  - Entrypoint: `backend/main.py`
  - Routes and workspace operations: `backend/app/projects/routes.py`

## Technologies
- **Python Package Management**: Managed via `uv`.
- **FastAPI / Uvicorn**: Serving on port `8000`.
- **Next.js**: Running on port `3000`.
- **Supabase**: Auth mechanism and database integration.

## Key APIs
- GET `/api/projects/list`: Lists repositories for a GitHub user.
- GET `/api/projects/contents`: Lists repository folder contents.
- GET `/api/projects/file`: Gets a file's raw content.
- POST `/api/projects/save`: Save file updates.
- POST `/api/projects/chat`: AI Assistant chat via OpenRouter.
