import { getSupabase } from "./supabase";

interface UserSettings {
  github_connected: boolean;
  github_owner: string;
  github_token: string;
  active_repo: string;
}

const DEFAULTS: UserSettings = {
  github_connected: false,
  github_owner: "",
  github_token: "",
  active_repo: "",
};

export async function getUserSettings(): Promise<UserSettings> {
  const { data: { user } } = await getSupabase().auth.getUser();
  const meta = (user?.user_metadata as Partial<UserSettings>) || {};
  return { ...DEFAULTS, ...meta };
}

export async function updateUserSettings(patch: Partial<UserSettings>): Promise<void> {
  await getSupabase().auth.updateUser({ data: patch });
}

export async function clearUserSettings(): Promise<void> {
  await updateUserSettings({
    github_connected: false,
    github_owner: "",
    github_token: "",
    active_repo: "",
  });
}
