"use client";

import ContactMessages from "@/components/admin/ContactMessages";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

export default function AdminContactMessagesPage() {
  return (
    <AdminPageWrapper title="Contact Messages">
      <ContactMessages />
    </AdminPageWrapper>
  );
}