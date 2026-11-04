import './bootstrap';
import '../css/app.css';
import './i18n'; // idiomas
import { createRoot, type Root } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useFlashToast } from '@/Shared/alerts/useFlashToast';
import { GlobalLoadingOverlay, attachLoadingInterceptor } from '@/Shared/loaders';

const appName = import.meta.env.VITE_APP_NAME || 'Kubix';

attachLoadingInterceptor();

function RootApp({ children }: { children: React.ReactNode }) {
  useFlashToast();
  return (
    <>
      <GlobalLoadingOverlay />
      {children}
    </>
  );
}

type ElementWithRoot = HTMLElement & { __inertiaRoot?: Root };

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name: string) =>
    resolvePageComponent(
      `./Pages/${name}.tsx`,
      import.meta.glob('./Pages/**/*.tsx')
    ) as Promise<any>,
  setup({ el, App, props }) {
    const target = el as ElementWithRoot;
    if (!target.__inertiaRoot) {
      target.__inertiaRoot = createRoot(target);
    }
    target.__inertiaRoot.render(
      <RootApp>
        <App {...props} />
      </RootApp>
    );
  },
  progress: {
    color: '#5B6CFF',
  },
});