# ─── Stage 1: Build dependencies with uv ─────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency manifests first (better layer caching)
COPY pyproject.toml uv.lock* ./

# Install only production deps into a local venv
RUN uv sync --frozen --no-dev

# ─── Stage 2: Lean runtime image ─────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy the pre-built virtualenv from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application source
COPY . .

# Use the venv's binaries
ENV PATH="/app/.venv/bin:$PATH"
ENV PORT=8000

EXPOSE 8000

# Health-check so Docker / CI can monitor readiness
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
