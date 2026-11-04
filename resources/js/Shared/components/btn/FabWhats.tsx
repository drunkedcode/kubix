import { MessageCircle } from 'lucide-react';

interface FabWhatsProps {
  /** Número de teléfono con código de país, ej: "5541999999999" */
  phone: string;
  /** Texto opcional para el mensaje */
  message?: string;
  /** Texto que muestra el botón */
  label?: string;
}

export default function FabWhats({ phone, message = '', label }: FabWhatsProps) {
  const baseUrl = `https://wa.me/${phone}`;
  const href = message 
    ? `${baseUrl}?text=${encodeURIComponent(message)}`
    : baseUrl;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={24} />
      {label && <span className="ml-2 mr-3 text-sm font-medium">{label}</span>}
    </a>
  );
}