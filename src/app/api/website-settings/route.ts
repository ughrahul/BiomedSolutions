import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      // Demo mode - return default settings
      const defaultSettings = {
        contact: {
          phone: "+977-980-120-335",
          email: "hingmang75@gmail.com",
          address:
            "Annapurna Neurological Institute & Allied Sciences, Maitighar Mandala-10, Kathmandu 44600, Nepal",
          whatsapp: "+977-980-120-335",
          businessHours:
            "Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 4:00 PM",
          hospitalPhone: "01-5356568",
          supportPhone: "980120335/61",
        },
      };

      return NextResponse.json(defaultSettings);
    }

    const { data, error } = await supabase.from("website_settings").select("*");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    // Transform data into structured format
    const settings: any = {
      contact: {
        phone: "+977-980-120-335",
        email: "hingmang75@gmail.com",
        address:
          "Annapurna Neurological Institute & Allied Sciences, Maitighar Mandala-10, Kathmandu 44600, Nepal",
        whatsapp: "+977-980-120-335",
        businessHours:
          "Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 4:00 PM",
        hospitalPhone: "01-5356568",
        supportPhone: "980120335/61",
      },
    };

    // Override with database values if they exist
    data?.forEach((setting: any) => {
      if (setting.key.startsWith("contact_")) {
        const field = setting.key.replace("contact_", "");
        if (Object.prototype.hasOwnProperty.call(settings.contact, field)) {
          settings.contact[field] = setting.value;
        }
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact } = body;

    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      // Demo mode - just return success
      return NextResponse.json({
        message: "Settings saved successfully (demo mode)",
      });
    }

    // Flatten settings object into key-value pairs
    const updates: Array<{
      key: string;
      value: string;
      updated_at: string;
    }> = [];

    // Contact settings
    if (contact) {
      Object.entries(contact).forEach(([key, value]) => {
        updates.push({
          key: `contact_${key}`,
          value: value as string,
          updated_at: new Date().toISOString(),
        });
      });
    }

    // Upsert all settings
    const { error } = await supabase
      .from("website_settings")
      .upsert(updates, { onConflict: "key" });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Settings saved successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
