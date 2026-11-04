import { Eye, Download, Trash2 } from "lucide-react";

export interface MediaOverlayAction {
  icon: "view" | "download" | "delete";
  label: string;
  onClick: () => void;
}

interface MediaOverlayProps {
  actions: MediaOverlayAction[];
  /** Si es false, el overlay se muestra siempre en vez de solo al hover.
   *  Útil en mobile, donde no hay hover real. */
  showOnHoverOnly?: boolean;
}

const ICONS = {
  view: Eye,
  download: Download,
  delete: Trash2,
} as const;

/**
 * Overlay semitransparente con botones de acción, pensado para superponerse
 * sobre una miniatura de imagen o una tarjeta de documento. El contenedor
 * padre debe tener la clase `group` y `relative` para que `group-hover`
 * funcione correctamente.
 */
export function MediaOverlay({
  actions,
  showOnHoverOnly = true,
}: MediaOverlayProps) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-navy-950/70 transition-opacity ${
        showOnHoverOnly
          ? "opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:opacity-100"
          : "opacity-100"
      }`}
    >
      {actions.map((action) => {
        const Icon = ICONS[action.icon];
        const isDelete = action.icon === "delete";
        return (
          <button
            key={action.icon}
            type="button"
            onClick={action.onClick}
            aria-label={action.label}
            title={action.label}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              isDelete
                ? "bg-rose-600/90 hover:bg-rose-500 text-white"
                : "bg-navy-800/90 hover:bg-teal-600 text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

export default MediaOverlay;
