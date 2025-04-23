import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the OAuth flow to function
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/notes", request.url));
}