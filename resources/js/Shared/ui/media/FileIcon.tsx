import { FileText, FileSpreadsheet, Image as ImageIcon, File } from "lucide-react";

type FileKind = "pdf" | "doc" | "sheet" | "image" | "other";

function getFileKind(fileName: string): FileKind {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

    if (ext === "pdf") return "pdf";
    if (["doc", "docx"].includes(ext)) return "doc";
    if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
    return "other";
}

const ICON_BY_KIND: Record<FileKind, typeof FileText> = {
    pdf: FileText,
    doc: FileText,
    sheet: FileSpreadsheet,
    image: ImageIcon,
    other: File,
};

const COLOR_BY_KIND: Record<FileKind, string> = {
    pdf: "text-rose-400",
    doc: "text-cyan-400",
    sheet: "text-teal-400",
    image: "text-amber-400",
    other: "text-slate-400",
};

interface FileIconProps {
    fileName: string;
    className?: string;
}

/** Ícono representativo según la extensión del archivo (pdf, doc, hoja de
 *  cálculo, imagen, u otro). Usado por DocumentPreview para dar contexto
 *  visual rápido sin tener que abrir el archivo. */
export function FileIcon({ fileName, className = "h-6 w-6" }: FileIconProps) {
    const kind = getFileKind(fileName);
    const Icon = ICON_BY_KIND[kind];
    return <Icon className={`${className} ${COLOR_BY_KIND[kind]}`} />;
}

export default FileIcon;