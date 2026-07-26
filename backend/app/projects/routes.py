import os
import json
import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
from google import genai
from google.genai import types
from app.supabase.client import get_supabase

router = APIRouter()

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

def get_local_path(path: str) -> str:
    # Prevent directory traversal attacks
    normalized_path = os.path.normpath(path)
    if normalized_path.startswith("..") or os.path.isabs(normalized_path):
        raise HTTPException(status_code=400, detail="Invalid path")
    return os.path.join(WORKSPACE_ROOT, normalized_path)

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

class SaveFileRequest(BaseModel):
    owner: str
    repo: str
    path: str
    content: str

class ChatMessageInput(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    owner: str
    repo: str
    message: str
    selected_file: Optional[str] = None
    file_content: Optional[str] = None
    history: Optional[List[ChatMessageInput]] = None

class SaveEditRequest(BaseModel):
    user_id: str
    owner: str
    repo: str
    file_path: str
    original_content: Optional[str] = None
    modified_content: str

class PushRequest(BaseModel):
    user_id: str
    owner: str
    repo: str
    file_path: str
    content: str          # final file content to push
    commit_message: str
    original_content: Optional[str] = None

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
async def get_user_repositories(username: str, authorization: Optional[str] = None):
    if not username:
        raise HTTPException(status_code=400, detail="GitHub username is required.")

    headers: dict = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "FixForge-Backend"
    }
    # Forward the user's GitHub token so they can see private repos too
    if authorization and authorization.startswith("Bearer "):
        headers["Authorization"] = f"token {authorization[7:]}"

    github_url = "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(github_url, headers=headers)
            if response.status_code == 200:
                github_repos = response.json()
                repos = []
                for repo in github_repos:
                    name = repo.get("name")
                    repos.append({
                        "name": name,
                        "updatedAt": repo.get("updated_at")[:10] if repo.get("updated_at") else "Recently",
                        "private": repo.get("private", False),
                        "status": "idle"
                    })
                return repos
            return []
        except Exception:
            return []

@router.get("/file")
async def get_file_content(owner: str, repo: str, path: str, authorization: Optional[str] = None):
    github_token = os.getenv("GITHUB_TOKEN", "")
    headers: dict = {
        "Accept": "application/vnd.github.raw",
        "User-Agent": "FixForge-Backend",
    }
    user_token = None
    if authorization and authorization.startswith("Bearer "):
        user_token = authorization[7:]
    if user_token:
        headers["Authorization"] = f"token {user_token}"
    elif github_token and github_token != "your_github_personal_access_token_here":
        headers["Authorization"] = f"token {github_token}"

    github_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(github_url, headers=headers)
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"File not found: {path}")
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"GitHub API error: {response.text}")
            return {"content": response.text}
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Failed to reach GitHub API: {str(exc)}")

@router.get("/contents", response_model=List[FileItem])
async def get_repository_contents(owner: str, repo: str, path: str = "", authorization: Optional[str] = None):
    github_token = os.getenv("GITHUB_TOKEN", "")
    headers: dict = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "FixForge-Backend",
    }
    # Prefer the user's OAuth token from the request, fall back to env
    user_token = None
    if authorization and authorization.startswith("Bearer "):
        user_token = authorization[7:]
    if user_token:
        headers["Authorization"] = f"token {user_token}"
    elif github_token and github_token != "your_github_personal_access_token_here":
        headers["Authorization"] = f"token {github_token}"

    github_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(github_url, headers=headers)
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"Path not found: /{path or ''} in {owner}/{repo}")
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"GitHub API error: {response.text}")

            items = response.json()
            if not isinstance(items, list):
                return [{"name": items.get("name", "file"), "path": items.get("path", ""), "type": "file"}]

            result = [
                {
                    "name": item.get("name"),
                    "path": item.get("path"),
                    "type": item.get("type"),
                }
                for item in items
            ]
            result.sort(key=lambda x: (x["type"] != "dir", x["name"].lower()))
            return result
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Failed to reach GitHub API: {str(exc)}")

@router.post("/save")
async def save_file_content(request: SaveFileRequest, authorization: Optional[str] = None):
    """Save a file to GitHub using the user's token."""
    github_token = os.getenv("GITHUB_TOKEN", "")
    headers: dict = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "FixForge-Backend",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    user_token = None
    if authorization and authorization.startswith("Bearer "):
        user_token = authorization[7:]
    if user_token:
        headers["Authorization"] = f"token {user_token}"
    elif github_token and github_token != "your_github_personal_access_token_here":
        headers["Authorization"] = f"token {github_token}"
    else:
        raise HTTPException(status_code=401, detail="No GitHub token provided. Please reconnect your GitHub account.")

    api_url = f"https://api.github.com/repos/{request.owner}/{request.repo}/contents/{request.path}"

    async with httpx.AsyncClient() as client:
        # Get the current file SHA (required by GitHub to update)
        sha_resp = await client.get(api_url, headers=headers)
        sha = None
        if sha_resp.status_code == 200:
            sha = sha_resp.json().get("sha")

        import base64
        encoded = base64.b64encode(request.content.encode("utf-8")).decode("utf-8")
        payload: dict = {
            "message": f"chore: update {request.path} via FixForge",
            "content": encoded,
        }
        if sha:
            payload["sha"] = sha

        put_resp = await client.put(api_url, headers=headers, json=payload, timeout=30.0)
        if put_resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=put_resp.status_code,
                detail=f"GitHub save failed: {put_resp.text}"
            )

    return {"status": "success", "message": f"Saved {request.path} to GitHub"}

@router.post("/chat")
async def chat_with_assistant(request: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured in backend .env")

    # Load system prompt from skill.md
    skill_path = os.path.join(os.path.dirname(__file__), "skill.md")
    system_prompt = "You are a helpful coding assistant. Always respond in valid JSON."
    if os.path.exists(skill_path):
        try:
            with open(skill_path, "r", encoding="utf-8") as f:
                system_prompt = f.read()
        except Exception:
            pass

    # Append README context
    readme_path = os.path.join(WORKSPACE_ROOT, "README.md")
    if os.path.exists(readme_path):
        try:
            with open(readme_path, "r", encoding="utf-8") as f:
                system_prompt += f"\n\nProject README:\n{f.read()}"
        except Exception:
            pass

    # Build the user message with file context
    user_message_content = request.message
    if request.selected_file and request.file_content:
        user_message_content += (
            f"\n\nActive Document: {request.selected_file}\n"
            f"Current File Content:\n"
            f"```\n{request.file_content}\n```"
        )

    # Build Gemini conversation history
    contents: list[types.Content] = []
    if request.history:
        for msg in request.history:
            gemini_role = "user" if msg.role == "user" else "model"
            contents.append(
                types.Content(role=gemini_role, parts=[types.Part(text=msg.content)])
            )

    # Append the current user message
    contents.append(
        types.Content(role="user", parts=[types.Part(text=user_message_content)])
    )

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
            ),
        )

        content_str = response.text or "{}"

        # Strip any accidental markdown code fences
        clean_content = content_str.strip()
        if clean_content.startswith("```json"):
            clean_content = clean_content[7:]
        elif clean_content.startswith("```"):
            clean_content = clean_content[3:]
        if clean_content.endswith("```"):
            clean_content = clean_content[:-3]
        clean_content = clean_content.strip()

        try:
            ai_response_data = json.loads(clean_content)
        except Exception:
            ai_response_data = {
                "description": content_str,
                "bullets": [],
                "modifiedContent": None,
                "followUp": ""
            }

        return ai_response_data

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API error: {str(exc)}"
        )


@router.post("/save-edit")
async def save_edit(request: SaveEditRequest):
    """Record an accepted AI edit into Supabase file_edits table."""
    try:
        sb = get_supabase()
        sb.table("file_edits").insert({
            "user_id": request.user_id,
            "owner": request.owner,
            "repo": request.repo,
            "file_path": request.file_path,
            "original_content": request.original_content,
            "modified_content": request.modified_content,
            "status": "applied",
        }).execute()
        return {"status": "saved"}
    except Exception as exc:
        # Non-fatal — don't block the UI if DB write fails
        print(f"[save-edit] Supabase error: {exc}")
        return {"status": "skipped", "reason": str(exc)}


@router.post("/push")
async def push_to_github(request: PushRequest):
    """Push a file change to GitHub and log it in Supabase push_history."""
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token or github_token == "your_github_personal_access_token_here":
        raise HTTPException(
            status_code=500,
            detail="GITHUB_TOKEN is not configured. Add it to backend/.env (https://github.com/settings/tokens — repo scope required)."
        )

    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    api_base = f"https://api.github.com/repos/{request.owner}/{request.repo}/contents/{request.file_path}"

    async with httpx.AsyncClient() as client:
        # 1. Get current file SHA (required by GitHub API to update)
        sha_response = await client.get(api_base, headers=headers)
        if sha_response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"File '{request.file_path}' not found on GitHub.")
        if sha_response.status_code != 200:
            raise HTTPException(status_code=sha_response.status_code, detail=f"GitHub error: {sha_response.text}")

        current_sha = sha_response.json().get("sha")
        if not current_sha:
            raise HTTPException(status_code=500, detail="Could not retrieve file SHA from GitHub.")

        # 2. Push the updated file
        encoded_content = base64.b64encode(request.content.encode("utf-8")).decode("utf-8")
        push_response = await client.put(
            api_base,
            headers=headers,
            json={
                "message": request.commit_message,
                "content": encoded_content,
                "sha": current_sha,
            },
            timeout=30.0,
        )

        if push_response.status_code not in (200, 201):
            raise HTTPException(
                status_code=push_response.status_code,
                detail=f"GitHub push failed: {push_response.text}"
            )

        new_sha = push_response.json().get("content", {}).get("sha", "")

    # 3. Log to Supabase push_history
    try:
        sb = get_supabase()
        sb.table("file_edits").update({"status": "pushed"}).eq("user_id", request.user_id).eq("file_path", request.file_path).eq("status", "applied").execute()
        sb.table("push_history").insert({
            "user_id": request.user_id,
            "owner": request.owner,
            "repo": request.repo,
            "commit_message": request.commit_message,
            "files_changed": [{"path": request.file_path}],
            "github_sha": new_sha,
            "status": "success",
        }).execute()
    except Exception as exc:
        print(f"[push] Supabase log error: {exc}")

    return {
        "status": "pushed",
        "sha": new_sha,
        "message": f"Successfully pushed '{request.file_path}' with commit: {request.commit_message}"
    }
