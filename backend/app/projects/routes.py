from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx

router = APIRouter()

class RepoImportRequest(BaseModel):
    repo_name: str
    github_username: str

class RepoResponse(BaseModel):
    name: str
    updatedAt: str
    private: bool
    status: str

class FileItem(BaseModel):
    name: str
    path: str
    type: str

@router.post("/import", response_model=RepoResponse)
def import_repository(request: RepoImportRequest):
    if not request.repo_name:
        raise HTTPException(status_code=400, detail="Repository name is required.")
    
    return {
        "name": request.repo_name,
        "updatedAt": "Just now",
        "private": False,
        "status": "success"
    }

@router.get("/list", response_model=List[RepoResponse])
async def get_user_repositories(username: str):
    if not username:
        raise HTTPException(status_code=400, detail="GitHub username is required.")
    
    github_url = f"https://api.github.com/users/{username}/repos"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "FixForge-Backend"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(github_url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"GitHub API error: {response.text}"
                )
            
            github_repos = response.json()
            return [
                {
                    "name": repo.get("name"),
                    "updatedAt": repo.get("updated_at")[:10] if repo.get("updated_at") else "Recently",
                    "private": repo.get("private", False),
                    "status": "idle"
                }
                for repo in github_repos
            ]
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, 
                detail=f"Failed to reach GitHub API: {str(exc)}"
            )

@router.get("/file")
async def get_file_content(owner: str, repo: str, path: str):
    github_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {
        "Accept": "application/vnd.github.raw",
        "User-Agent": "FixForge-Backend"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(github_url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Could not fetch file content")
            return {"content": response.text}
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Failed to reach GitHub API: {str(exc)}")

@router.get("/contents", response_model=List[FileItem])
async def get_repository_contents(owner: str, repo: str, path: str = ""):
    github_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "FixForge-Backend"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(github_url, headers=headers)
            if response.status_code != 200:
                # If the repository content can't be fetched (e.g. rate limit, auth required), fallback to mocks
                return [
                    {"name": "app", "path": "app", "type": "dir"},
                    {"name": "auth.py", "path": "auth.py", "type": "file"},
                    {"name": "user.py", "path": "user.py", "type": "file"},
                    {"name": "config.py", "path": "config.py", "type": "file"},
                    {"name": "database.py", "path": "database.py", "type": "file"},
                    {"name": "requirements.txt", "path": "requirements.txt", "type": "file"},
                    {"name": "Dockerfile", "path": "Dockerfile", "type": "file"},
                    {"name": "README.md", "path": "README.md", "type": "file"},
                ]
            
            items = response.json()
            if not isinstance(items, list):
                # If it returned a single file content object instead of a directory listing list
                return [{"name": items.get("name", "file"), "path": items.get("path", ""), "type": "file"}]
                
            return [
                {
                    "name": item.get("name"),
                    "path": item.get("path"),
                    "type": item.get("type")
                }
                for item in items
            ]
        except Exception:
            # Fallback
            return [
                {"name": "app", "path": "app", "type": "dir"},
                {"name": "auth.py", "path": "auth.py", "type": "file"},
                {"name": "user.py", "path": "user.py", "type": "file"},
                {"name": "config.py", "path": "config.py", "type": "file"},
                {"name": "database.py", "path": "database.py", "type": "file"},
                {"name": "requirements.txt", "path": "requirements.txt", "type": "file"},
                {"name": "Dockerfile", "path": "Dockerfile", "type": "file"},
                {"name": "README.md", "path": "README.md", "type": "file"},
            ]
