import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Loading } from "./Loading";
import { hideLoading, showLoading, subscribeLoading } from "./loadingStore";

/**
 * Montar UNA sola vez, en el layout raíz de la app (ej. resources/js/app.tsx
 * o el AppLayout que envuelve todas las páginas de Inertia). Ejemplo:
 *
 *   <AppLayout>
 *     <GlobalLoadingOverlay />
 *     {children}
 *   </AppLayout>
 *
 * Se conecta solo a router.on("start"/"finish") de Inertia, que dispara en:
 *  - navegación entre páginas (<Link>, router.visit)
 *  - router.post/put/patch/delete/reload
 *  - useForm().post()/put()/... (usa el router por debajo)
 *
 * Para peticiones que NO pasan por Inertia (fetch/axios sueltos, como el
 * preview de CNPJ con debounce), llamá showLoading()/hideLoading() a mano:
 *
 *   showLoading("Buscando CNPJ...");
 *   try { await fetch(...) } finally { hideLoading(); }
 */
export function GlobalLoadingOverlay() {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState<string | undefined>();

  useEffect(() => subscribeLoading((v, l) => {
    setVisible(v);
    setLabel(l);
  }), []);

  useEffect(() => {
    const removeStart = router.on("start", () => showLoading());
    const removeFinish = router.on("finish", () => hideLoading());

    return () => {
      removeStart();
      removeFinish();
    };
  }, []);

  return <Loading visible={visible} label={label} />;
}