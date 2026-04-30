"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, RefreshCw, Edit2, Check, X } from "lucide-react";

interface Movimiento {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  cuenta: string;
  concepto: string | null;
  unidad: string;
  split_un1: number;
  validado_por_usuario: boolean;
  auto_clasificado: boolean;
}

interface Props {
  initialMovimientos: Movimiento[];
  totalCount: number;
}

const CONCEPTOS = {
  INGRESOS: {
    ventas_club_membresias: "Membresías Club",
    ventas_club_clases: "Clases Club",
    ventas_club_torneos: "Torneos Club",
    ventas_club_otros: "Otros Ingresos Club",
    ventas_mazatlan_alimentos: "Alimentos Mazatlán",
    ventas_mazatlan_bebidas: "Bebidas Mazatlán",
    ventas_mazatlan_otros: "Otros Ingresos Mazatlán",
  },
  COGS: {
    insumos_club: "Insumos Club",
    insumos_mazatlan: "Insumos Mazatlán",
    gastos_operacion: "Gastos Operación",
  },
  FIJOS: {
    renta: "Renta",
    servicios_publicos: "Servicios Públicos",
    servicios_internet: "Internet/Tel",
  },
  NOMINA: {
    sueldos_salarios: "Sueldos",
    comisiones_coaches: "Comisiones Coaches",
    imss: "IMSS",
    sueldos_cxt: "Sueldos CxT",
  },
  SGA: {
    crms: "CRMs",
    marketing: "Marketing",
    comisiones_bancarias: "Comisiones Bancarias",
  },
  EXTRA: {
    gastos_inusuales: "Gastos Inusuales",
    gastos_no_reconocidos: "No Reconocidos",
    reparaciones_emergentes: "Reparaciones",
    compras_puntuales: "Compras Puntuales",
    mejoras_club: "Mejoras Club",
    inversiones: "Inversiones",
  },
  IMPUESTOS: {
    impuestos_sat: "Impuestos SAT",
    impuestos_municipales: "Municipales",
  },
  EXCLUIDO: {
    transferencia_interna: "Transferencia Interna",
    retiro_socios: "Retiro Socios",
    devolucion_prestamo: "Devolución Préstamo",
    aportacion_socio: "Aportación Socio",
  },
};

function getConceptLabel(c: string | null): string {
  if (!c) return "Sin clasificar";
  for (const cat of Object.values(CONCEPTOS)) {
    if (c in cat) return (cat as Record<string, string>)[c];
  }
  return c;
}

function formatMoney(n: number): string {
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function MovimientosClient({
  initialMovimientos,
  totalCount,
}: Props) {
  const supabase = createClient();
  const [movimientos, setMovimientos] = useState<Movimiento[]>(initialMovimientos);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMes, setFilterMes] = useState<string>("all");
  const [filterUnidad, setFilterUnidad] = useState<string>("all");
  const [filterCuenta, setFilterCuenta] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConcepto, setEditConcepto] = useState<string>("");
  const [editUnidad, setEditUnidad] = useState<string>("");

  // Cargar todos los movimientos al montar
  useEffect(() => {
    async function loadAll() {
      if (movimientos.length >= totalCount) return;
      setLoading(true);
      const { data } = await supabase
        .from("movimientos")
        .select("*")
        .order("fecha", { ascending: false });
      if (data) setMovimientos(data);
      setLoading(false);
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtros
  const filtered = useMemo(() => {
    return movimientos.filter((m) => {
      // Filtro por búsqueda
      if (
        search &&
        !m.descripcion.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      // Filtro por mes
      if (filterMes !== "all" && !m.fecha.startsWith(filterMes)) {
        return false;
      }
      // Filtro por unidad
      if (filterUnidad !== "all" && m.unidad !== filterUnidad) {
        return false;
      }
      // Filtro por cuenta
      if (filterCuenta !== "all" && m.cuenta !== filterCuenta) {
        return false;
      }
      // Filtro por estado
      if (filterEstado === "pendientes" && m.concepto) {
        return false;
      }
      if (filterEstado === "validados" && !m.validado_por_usuario) {
        return false;
      }
      if (filterEstado === "auto" && !m.auto_clasificado) {
        return false;
      }
      return true;
    });
  }, [movimientos, search, filterMes, filterUnidad, filterCuenta, filterEstado]);

  // Stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const sinClasificar = filtered.filter((m) => !m.concepto).length;
    const validados = filtered.filter((m) => m.validado_por_usuario).length;
    const ingresos = filtered
      .filter((m) => m.monto > 0)
      .reduce((s, m) => s + m.monto, 0);
    const egresos = filtered
      .filter((m) => m.monto < 0)
      .reduce((s, m) => s + Math.abs(m.monto), 0);
    return { total, sinClasificar, validados, ingresos, egresos };
  }, [filtered]);

  function startEdit(m: Movimiento) {
    setEditingId(m.id);
    setEditConcepto(m.concepto || "");
    setEditUnidad(m.unidad || "mixto");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditConcepto("");
    setEditUnidad("");
  }

  async function saveEdit(m: Movimiento) {
    let split = 50;
    let unidadFinal = editUnidad;

    if (editUnidad === "un1") split = 100;
    else if (editUnidad === "un2") split = 0;
    else if (editUnidad === "mixto") split = 50;

    // Si es concepto excluido, marcar unidad como excluido
    if (
      [
        "transferencia_interna",
        "retiro_socios",
        "devolucion_prestamo",
        "aportacion_socio",
      ].includes(editConcepto)
    ) {
      unidadFinal = "excluido";
    }

    const { error } = await supabase
      .from("movimientos")
      .update({
        concepto: editConcepto || null,
        unidad: unidadFinal,
        split_un1: split,
        validado_por_usuario: true,
      })
      .eq("id", m.id);

    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }

    // Actualizar estado local
    setMovimientos((prev) =>
      prev.map((mv) =>
        mv.id === m.id
          ? {
              ...mv,
              concepto: editConcepto || null,
              unidad: unidadFinal,
              split_un1: split,
              validado_por_usuario: true,
            }
          : mv
      )
    );

    cancelEdit();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Movimientos Bancarios
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {totalCount} movimientos · 3 cuentas (Banorte, Santander, Efectivo)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total filtrados" value={stats.total} />
        <StatCard label="Sin clasificar" value={stats.sinClasificar} variant="warning" />
        <StatCard label="Validados" value={stats.validados} variant="success" />
        <StatCard
          label="Ingresos"
          value={`$${formatMoney(stats.ingresos)}`}
          variant="success"
        />
        <StatCard
          label="Egresos"
          value={`$${formatMoney(stats.egresos)}`}
          variant="danger"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descripción..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterMes}
            onChange={(e) => setFilterMes(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="all">Todos los meses</option>
            <option value="2026-01">Enero 2026</option>
            <option value="2026-02">Febrero 2026</option>
            <option value="2026-03">Marzo 2026</option>
          </select>

          <select
            value={filterCuenta}
            onChange={(e) => setFilterCuenta(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="all">Todas las cuentas</option>
            <option value="Banorte">Banorte</option>
            <option value="Santander">Santander</option>
            <option value="Efectivo">Efectivo</option>
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pendientes">⚠️ Sin clasificar</option>
            <option value="validados">✓ Validados</option>
            <option value="auto">⚙️ Auto-clasificados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading && (
          <div className="p-4 text-center text-sm text-slate-500 border-b border-slate-200">
            <RefreshCw className="w-4 h-4 inline animate-spin mr-2" />
            Cargando todos los movimientos...
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Cuenta</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Descripción</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Concepto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Unidad</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700 w-20">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 200).map((m) => {
                const isEditing = editingId === m.id;
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {m.fecha}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          m.cuenta === "Banorte"
                            ? "bg-red-100 text-red-700"
                            : m.cuenta === "Santander"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {m.cuenta}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-md truncate">
                      <span title={m.descripcion}>{m.descripcion}</span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums font-medium whitespace-nowrap ${
                        m.monto >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {m.monto >= 0 ? "+" : "-"}${formatMoney(Math.abs(m.monto))}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editConcepto}
                          onChange={(e) => setEditConcepto(e.target.value)}
                          className="text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:border-primary-500"
                        >
                          <option value="">— Sin concepto —</option>
                          {Object.entries(CONCEPTOS).map(([cat, items]) => (
                            <optgroup key={cat} label={cat}>
                              {Object.entries(items).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            !m.concepto
                              ? "bg-amber-100 text-amber-700"
                              : m.validado_por_usuario
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {!m.concepto && "⚠️ "}
                          {m.validado_por_usuario && "✓ "}
                          {getConceptLabel(m.concepto)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editUnidad}
                          onChange={(e) => setEditUnidad(e.target.value)}
                          className="text-xs px-2 py-1 border border-slate-300 rounded outline-none focus:border-primary-500"
                        >
                          <option value="un1">🔵 Club</option>
                          <option value="un2">🟠 Mazatlán</option>
                          <option value="mixto">⚖️ Mixto 50/50</option>
                          <option value="excluido">⛔ Excluido</option>
                        </select>
                      ) : (
                        <span className="text-xs">
                          {m.unidad === "un1" && "🔵 Club"}
                          {m.unidad === "un2" && "🟠 Mazatlán"}
                          {m.unidad === "mixto" && "⚖️ Mixto"}
                          {m.unidad === "excluido" && "⛔ Excluido"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => saveEdit(m)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(m)}
                          className="p-1 text-slate-500 hover:bg-slate-100 hover:text-primary-700 rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 200 && (
          <div className="p-4 text-center text-sm text-slate-500 border-t border-slate-200">
            Mostrando los primeros 200 de {filtered.length} movimientos.
            Refina los filtros para ver menos.
          </div>
        )}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay movimientos que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const colors = {
    default: "text-slate-900",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-xl font-bold mt-1 ${colors[variant]} tabular-nums`}>
        {value}
      </p>
    </div>
  );
}
