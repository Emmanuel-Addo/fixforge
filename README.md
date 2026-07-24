# FixForge — Autonomous AI Software Engineering Assistant

**FixForge** is an intelligent platform that integrates with GitHub to help developers identify, analyze, and resolve software bugs efficiently. Connect your repositories, import GitHub issues, and let FixForge analyze your codebase, generate surgical patches, validate fixes inside an isolated Docker sandbox, and automatically open Pull Requests.

---

## Features

- **GitHub Repository Sync** — Instant OAuth 2.0 integration to import and categorize repository issues.
- **Deep AI Diagnostics** — Analyzes stack traces, AST call-graphs, and pinpoints exact root causes without symptom patching.
- **Surgical Patch Generation** — Produces minimal, type-safe code diffs that conform to your repository's existing architecture.
- **Isolated Docker Sandbox** — Runs your full unit and integration test suite in isolated Docker containers before proposing fixes.
- **Automated Pull Requests** — Opens GitHub PRs complete with code rationale, test logs, and 1-click review/merge capabilities.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router) & React
- **Styling**: TailwindCSS
- **Package Manager**: Yarn

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **Server**: Uvicorn
- **Isolation Sandbox**: Docker

---

## Repository Structure

```
fixforge/
├── frontend/        # Next.js web app
│   ├── app/
│   ├── components/
│   ├── Dockerfile
│   └── docker-compose.yml
├── backend/         # FastAPI AI engine & GitHub handlers
│   ├── main.py
│   ├── Dockerfile
│   └── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js >= 20.x & Yarn
- Python >= 3.12 & [uv](https://docs.astral.sh/uv/getting-started/installation/)
- Docker Desktop

### Frontend

```bash
cd frontend
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

Open [http://localhost:8000](http://localhost:8000)

---

## Docker

### Frontend
```bash
cd frontend
docker compose up --build
```

### Backend
```bash
cd backend
docker compose up --build
```

---

## Contributing

Contributions, issues, and feature requests are welcome!

---

## License

This project is licensed under the MIT License.
