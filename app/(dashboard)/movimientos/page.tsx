import { createClient } from "@/lib/supabase/server";
import MovimientosClient from "./MovimientosClient";

export const dynamic = "force-dynamic";

export default async function MovimientosPage() {
  const supabase = await createClient();

  // Cargar primeros 100 movimientos para SSR (luego se cargan más con scroll)
  const { data: movimientos, error } = await supabase
    .from("movimientos")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(100);

  // Total para mostrar
  const { count } = await supabase
    .from("movimientos")
    .select("*", { count: "exact", head: true });

  return (
    <MovimientosClient
      initialMovimientos={movimientos || []}
      totalCount={count || 0}
    />
  );
}
