// Serving preview images out of the Assetto Corsa install.
//
// The renderer is sandboxed with contextIsolation and cannot open a file off
// disk, and shipping previews as data URLs over IPC would be megabytes per
// screenful. A custom scheme lets an <img src> reach them directly, at the cost
// of one carefully guarded door into the game folder.

import { net, protocol } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  CONTENT_TYPES, FLAG_TYPE, PHOTO_TYPE, STATUS_BAD_REQUEST, STATUS_NOT_FOUND, STATUS_UNAVAILABLE,
} from './constants.ts';
import { contentPath, isInsideContentDir } from '../../core/content/index.ts';
import { CONTENT_SCHEME } from '../../shared/constants/index.ts';
import { parseContentUrl } from '../../shared/utils/content-url/index.ts';

/**
 * Declares the content scheme before Chromium starts.
 *
 * This MUST run before app.whenReady() resolves. Called any later it is silently
 * ignored: the scheme stays non-standard, `accontent:` stops matching the
 * renderer's img-src policy, and every preview fails with nothing to show for it
 * but a console line. If images do not appear, check this first.
 */
export const registerContentScheme = (): void => {
  protocol.registerSchemesAsPrivileged([{
    scheme: CONTENT_SCHEME,
    privileges: {
      // Gives host/path parsing and a real origin, which is what makes the
      // scheme usable as a content security policy source.
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true,
    },
  }]);
};

/**
 * Starts answering content-scheme requests. Call after app.whenReady().
 * @param contentDir Reads the AC content directory, or null when unresolved
 */
export const serveContent = (contentDir: () => string | null): void => {
  protocol.handle(CONTENT_SCHEME, async (request) => {
    const target = parseContentUrl(request.url);
    if (!target) return new Response(null, { status: STATUS_BAD_REQUEST });

    const dir = contentDir();
    if (dir === null) return new Response(null, { status: STATUS_UNAVAILABLE });

    const file = contentPath(dir, target);
    // parseContentUrl has already refused separators and traversal segments;
    // this is the belt to that pair of braces, and the only check that knows
    // where the install actually is.
    if (!isInsideContentDir(dir, file)) {
      return new Response(null, { status: STATUS_BAD_REQUEST });
    }

    // A flag's name is its code and a photograph's is numbered, so both are
    // typed by their kind rather than by name.
    const type = target.kind === 'nationFlag' ? FLAG_TYPE
      : target.kind === 'trackPhoto' ? PHOTO_TYPE : CONTENT_TYPES[path.basename(file)];
    if (type === undefined) return new Response(null, { status: STATUS_BAD_REQUEST });

    try {
      const response = await net.fetch(pathToFileURL(file).toString());
      if (!response.ok) return new Response(null, { status: STATUS_NOT_FOUND });

      // The type is set from the allow-list rather than sniffed, so a file that
      // is not the image it claims to be still cannot be served as anything else.
      return new Response(response.body, { headers: { 'content-type': type } });
    } catch {
      // A missing preview is an ordinary thing, not an error worth logging: it
      // becomes an img that fails to load, which is what a browser expects.
      return new Response(null, { status: STATUS_NOT_FOUND });
    }
  });
};
