import os
from fastapi import APIRouter
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")

# The URL Supabase uses to start a Google login
GOOGLE_LOGIN_URL = f"{SUPABASE_URL}/auth/v1/authorize?provider=google"


@router.get("/google/url")
def get_google_url():
    """
    Returns the Google login URL.
    The frontend will redirect the user to this URL.
    Supabase + Google handles the rest automatically.
    """
    return {"url": GOOGLE_LOGIN_URL}