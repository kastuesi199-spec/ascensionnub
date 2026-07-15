export default function Debug() {
  return (
    <pre>
      {JSON.stringify(
        {
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY?.slice(0, 10),
        },
        null,
        2
      )}
    </pre>
  );
}
