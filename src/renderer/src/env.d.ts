import type { RendererApi } from '../../shared/types';

declare global {
  interface Window {
    /**
     * Exposed by the preload script; the renderer's only route to the main process.
     */
    api: RendererApi;
  }
}
