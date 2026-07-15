import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const supabase = supabaseServer(); // ⭐ FIXED — no await

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const name = encodeURIComponent(user.user_metadata.full_name ?? "");
  const avatar = encodeURIComponent(user.user_metadata.avatar_url ?? "");

  return NextResponse.redirect(`${origin}/?name=${name}&avatar=${avatar}`);
}