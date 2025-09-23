import { ReactNode } from "react";
import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const defaultTitle = process.env.NEXT_PUBLIC_APP_NAME || "Biomed Solution";

  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("products")
      .select("name, is_active")
      .eq("id", id)
      .single();

    if (data?.name && data?.is_active !== false) {
      return { title: `${data.name} | ${defaultTitle}` };
    }
  } catch (_) {}

  return { title: defaultTitle };
}

export default function ProductLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}


