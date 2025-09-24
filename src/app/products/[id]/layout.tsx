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
  const defaultTitle = "Biomed Solution";

  try {
    const supabase = await createServerSupabase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let data: any = null;
    if (isUuid) {
      const result = await supabase
        .from("products")
        .select("name, is_active")
        .eq("id", id)
        .single();
      data = result.data;
    } else {
      const decoded = decodeURIComponent(id);
      const nameCandidate = decoded.replace(/-/g, " ");
      const result = await supabase
        .from("products")
        .select("name, is_active")
        .or(`name.ilike.%${nameCandidate}%,name.ilike.%${decoded}%`)
        .limit(1);
      data = result.data?.[0];
    }

    if (data?.name && data?.is_active !== false) {
      return { title: `${data.name} | ${defaultTitle}` };
    }
  } catch (_) {}

  return { title: defaultTitle };
}

export default function ProductLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}


