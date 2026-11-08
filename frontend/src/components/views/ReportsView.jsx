import React from "react";
import { useApp } from "../../hooks/useApp";
import { FileSpreadsheet, Download, CheckCircle, Wrench, PackageX } from "lucide-react";
import { plural } from "../../utils/helpers";

export default function ReportsView() {
  const { assets, categories, locations } = useApp();

  // Función para exportar a CSV
  const exportCSV = () => {
    if (assets.length === 0) {
      alert("No hay activos para exportar.");
      return;
    }

    const headers = ["Codigo", "Nombre", "Categoria", "Ubicacion", "Estado", "Fecha"];
    const rows = assets.map((a) => {
      const cat = categories.find((c) => c.id === a.categoriaId)?.nombre || "Sin categoria";
      const loc = locations.find((l) => l.id === a.ubicacionId)?.nombre || "Sin ubicacion";
      return [
        a.codigo,
        `"${a.nombre}"`, // Comillas para evitar problemas con comas
        `"${cat}"`,
        `"${loc}"`,
        a.estado,
        a.fecha
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // \uFEFF para tildes en Excel
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inventario_chiquinquira_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reports = [
    { id: 1, title: "Inventario Completo", desc: "Todos los activos con su categoría, ubicación y estado.", icon: FileSpreadsheet, count: assets.length },
    { id: 2, title: "Activos Disponibles", desc: "Listos para asignar a un nuevo responsable.", icon: CheckCircle, count: assets.filter(a => a.estado === "Disponible").length },
    { id: 3, title: "En Mantenimiento", desc: "Equipos fuera de servicio por revisión o reparación.", icon: Wrench, count: assets.filter(a => a.estado === "Mantenimiento").length },
    { id: 4, title: "Dados de Baja", desc: "Bienes retirados del inventario.", icon: PackageX, count: assets.filter(a => a.estado === "Dado de baja").length },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-2">Descarga el inventario en formato CSV para abrirlo en Excel.</p>
      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reports.map((r) => (
          <article key={r.id} className="card flex flex-col p-5">
            <span className="grid size-10 place-items-center rounded-lg bg-subtle text-ink-2">
              <r.icon size={20} />
            </span>
            <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink">{r.title}</h3>
            <p className="mt-1 min-h-[2.5rem] text-[13px] text-ink-3">{r.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] text-ink-3">{plural(r.count, "registro", "registros")}</span>
              <button onClick={exportCSV} disabled={r.count === 0} className="btn btn-secondary btn-sm text-xs">
                <Download size={14} /> CSV
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}