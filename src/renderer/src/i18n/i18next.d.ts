// Types every t() key against the English catalogue. A key that does not exist,
// or one that exists in en.json but was never translated in uk.json, becomes a
// typecheck failure rather than a silent runtime fallback.

import type en from './en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
