"use client";

import { RutaProtegida } from "@/components/RutaProtegida";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RutaProtegida rolRequerido="admin">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </RutaProtegida>
  );
}