"use client";

import WebsiteSettings from "@/components/admin/WebsiteSettings";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

export default function AdminWebsiteSettingsPage() {
  return (
    <AdminPageWrapper title="Website Settings">
      <WebsiteSettings />
    </AdminPageWrapper>
  );
}