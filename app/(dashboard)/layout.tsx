import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Obtener info del usuario
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("nombre_completo, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        userName={usuario?.nombre_completo || user.email || "Usuario"}
        userRole={usuario?.role || "viewer"}
      />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
