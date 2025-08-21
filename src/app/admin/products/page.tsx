"use client";

import ProductManagement from "@/components/admin/ProductManagement";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

export default function AdminProductsPage() {
  return (
    <AdminPageWrapper title="Product Management">
      <ProductManagement />
    </AdminPageWrapper>
  );
}