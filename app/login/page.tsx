"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  useEffect(() => {
    supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });
  }, []);

  return <div>Redirecting to Discord…</div>;
}
