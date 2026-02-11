import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function createServerClient() {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
    .join('; ');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Cookie: cookieHeader,
        },
      },
    }
  );
}
