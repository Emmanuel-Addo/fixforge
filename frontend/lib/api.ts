// API helper to talk to the backend

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fixforge-phi.vercel.app" || "http://localhost:8000";

// Get the Google login URL from the backend
export async function getGoogleLoginUrl(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/google/url`);
  const data = await response.json();
  return data.url;
}
