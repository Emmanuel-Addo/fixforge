from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.supabase.auth import router as auth_router
from app.projects.routes import router as projects_router

app = FastAPI(title="FixForge API", version="0.1.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])


@app.get("/")
def root():
    return {"message": "FixForge backend is running."}


@app.get("/health")
def health():
    return {"status": "ok"}

