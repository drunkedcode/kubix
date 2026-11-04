import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Index() {
  return (
    <AdminLayout title="Vitrina PWA">
      <Head title="Vitrina PWA" />
      <div>aqui show case</div>
    </AdminLayout>
  );
}