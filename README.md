# FixForge — Autonomous AI Software Engineering Assistant

**FixForge** is an intelligent platform that integrates with GitHub to help developers identify, analyze, and resolve software bugs efficiently. Connect your repositories, import GitHub issues, and let FixForge analyze your codebase, generate surgical patches, validate fixes inside an isolated Docker sandbox environment, and automatically open Pull Requests.

---

##  Features

- **GitHub Repository Sync**: Instant OAuth 2.0 integration to import and categorize repository issues.
- **Deep AI Diagnostics**: Analyzes stack traces, AST call-graphs, and pinpoints exact root causes without symptom patching.
- **Surgical Patch Generation**: Produces minimal, type-safe code diffs that conform to your repository's existing architecture.
- **Isolated Docker Sandbox**: Runs your full unit and integration test suite in isolated Docker containers before proposing fixes.
- **Automated Pull Requests**: Opens GitHub PRs complete with code rationale, test logs, and 1-click review/merge capabilities.

---

##  Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router) & React
- **Styling**: TailwindCSS & Vanilla CSS
- **Icons & UI**: Lucide / SVG

### Backend & AI Agent Engine
- **Core Engine**: Python / Node.js
- **Isolation Sandbox**: Docker Containers
- **Integration**: GitHub API & Webhooks

---

##  Repository Structure

```text
fixforge/
├── frontend/        # Next.js web app (Hero, Sticky Feature Stack, UI)
├── backend/         # AI analysis engine, Docker runner, & GitHub API handlers
└── README.md        # Project documentation
```

---

##  Getting Started

### Prerequisites
- Node.js >= 18.x
- Docker Desktop (for sandbox execution)
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Emmanuel-Addo/fixforge.git
   cd fixforge
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

3. **Backend Setup**
   ```bash
   cd ../backend
   # Install dependencies and start local backend service
   ```

---

##  Contributing

Contributions, issues, and feature requests are welcome!

---

##  License

This project is licensed under the MIT License.
