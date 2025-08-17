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
          email: "info@annapurnahospitals.com",
          address:
            "Annapurna Neurological Institute, Maitighar, Kathmandu, Nepal",
          website: "https://annapurnahospitals.com",
          whatsapp: "+977-980-120-335",
          businessHours:
            "Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 4:00 PM",
        },
        social: {
          facebook: "https://facebook.com/annapurnahospitals",
          twitter: "https://twitter.com/annapurnahospitals",
          instagram: "https://instagram.com/annapurnahospitals",
          linkedin: "https://linkedin.com/company/annapurnahospitals",
        },
        company: {
          name: "Biomed Solutions",
          tagline: "Advanced Medical Equipment for Healthcare Excellence",
          description:
            "Leading provider of cutting-edge medical equipment and healthcare solutions at Annapurna Neurological Institute.",
          logo: "/assets/images/logo.png",
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
        email: "info@annapurnahospitals.com",
        address:
          "Annapurna Neurological Institute, Maitighar, Kathmandu, Nepal",
        website: "https://annapurnahospitals.com",
        whatsapp: "+977-980-120-335",
        businessHours:
          "Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 4:00 PM",
      },
      social: {
        facebook: "https://facebook.com/annapurnahospitals",
        twitter: "https://twitter.com/annapurnahospitals",
        instagram: "https://instagram.com/annapurnahospitals",
        linkedin: "https://linkedin.com/company/annapurnahospitals",
      },
      company: {
        name: "Biomed Solutions",
        tagline: "Advanced Medical Equipment for Healthcare Excellence",
        description:
          "Leading provider of cutting-edge medical equipment and healthcare solutions at Annapurna Neurological Institute.",
        logo: "/assets/images/logo.png",
      },
    };

    // Override with database values if they exist
    data?.forEach((setting: any) => {
      if (setting.key.startsWith("contact_")) {
        const field = setting.key.replace("contact_", "");
        if (Object.prototype.hasOwnProperty.call(settings.contact, field)) {
          settings.contact[field] = setting.value;
        }
      } else if (setting.key.startsWith("social_")) {
        const field = setting.key.replace("social_", "");
        if (Object.prototype.hasOwnProperty.call(settings.social, field)) {
          settings.social[field] = setting.value;
        }
      } else if (setting.key.startsWith("company_")) {
        const field = setting.key.replace("company_", "");
        if (Object.prototype.hasOwnProperty.call(settings.company, field)) {
          settings.company[field] = setting.value;
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
    const { settings } = body;

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
    if (settings.contact) {
      Object.entries(settings.contact).forEach(([key, value]) => {
        updates.push({
          key: `contact_${key}`,
          value: value as string,
          updated_at: new Date().toISOString(),
        });
      });
    }

    // Social settings
    if (settings.social) {
      Object.entries(settings.social).forEach(([key, value]) => {
        updates.push({
          key: `social_${key}`,
          value: value as string,
          updated_at: new Date().toISOString(),
        });
      });
    }

    // Company settings
    if (settings.company) {
      Object.entries(settings.company).forEach(([key, value]) => {
        updates.push({
          key: `company_${key}`,
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
