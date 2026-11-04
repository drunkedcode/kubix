import axios from "axios";
import { hideLoading, showLoading } from "./loadingStore";

/**
 * Engancha el overlay global de carga a la instancia POR DEFECTO de axios
 * (el mismo import 'axios' que usa bootstrap.js para armar window.axios).
 * Llamar UNA sola vez — ver app.tsx, justo después de `import './bootstrap'`.
 *
 * Ojo: si en algún lugar del proyecto se usa axios.create() para una
 * instancia aparte (ej. otra base URL), esa instancia NO comparte estos
 * interceptores — hay que llamarla con attachLoadingInterceptor(esaInstancia)
 * también, o centralizar en un solo cliente axios compartido.
 */
export function attachLoadingInterceptor(instance = axios) {
  instance.interceptors.request.use(
    (config) => {
      showLoading();
      return config;
    },
    (error) => {
      hideLoading();
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      hideLoading();
      return response;
    },
    (error) => {
      hideLoading();
      return Promise.reject(error);
    }
  );
}