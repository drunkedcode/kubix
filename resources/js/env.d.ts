/// <reference types="vite/client" />

/**
 * env.d.ts
 * Declaraciones globales: Vite (css, imágenes, import.meta) y el helper route() de Ziggy,
 * que se inyecta en la página con @routes (resources/views/app.blade.php).
 */
declare function route(
    name: string,
    params?: Record<string, unknown> | string | number,
    absolute?: boolean,
): string;
