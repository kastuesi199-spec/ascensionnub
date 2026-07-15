import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function supabaseServer() {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookies();
          return store.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          const store = await cookies();
          store.set(name, value, options);
        },
        async remove(name: string, options: any) {
          const store = await cookies();
          store.set(name, "", options);
        },
      },
    }
  );
}