import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { net, protocol } from 'electron';

import { registerContentScheme, serveContent } from '../content-protocol.ts';

// content-protocol.ts reaches for protocol and net at call time; nothing else in
// Electron is involved, so a two-field fake is the whole surface.
jest.mock('electron', () => ({
  protocol: { registerSchemesAsPrivileged: jest.fn(), handle: jest.fn() },
  net: { fetch: jest.fn() },
}));

const handleMock = jest.mocked(protocol.handle);
const privilegedMock = jest.mocked(protocol.registerSchemesAsPrivileged);
const fetchMock = jest.mocked(net.fetch);

const DIR = 'D:\\ac\\content';

/**
 * Starts the handler and hands back the function protocol.handle was given.
 * @param contentDir The install the handler should serve from
 * @returns The registered request handler
 */
const serve = (contentDir: string | null = DIR) => {
  serveContent(() => contentDir);
  return handleMock.mock.calls[0]?.[1] as (request: Request) => Promise<Response>;
};

describe('main/content-protocol', () => {
  beforeEach(() => {
    fetchMock.mockResolvedValue(new Response('bytes', { status: 200 }));
  });

  describe('registerContentScheme', () => {
    // Registered any later than this it is silently ignored: the scheme stays
    // non-standard, accontent: stops matching the renderer's img-src, and every
    // preview fails with nothing but a console line.
    it('registers accontent as a standard, secure, streaming scheme', () => {
      registerContentScheme();

      expect(privilegedMock).toHaveBeenCalledWith([{
        scheme: 'accontent',
        privileges: expect.objectContaining({
          standard: true, secure: true, supportFetchAPI: true, stream: true,
        }),
      }]);
    });
  });

  describe('serveContent', () => {
    it('registers a handler for the content scheme', () => {
      serve();
      expect(handleMock).toHaveBeenCalledWith('accontent', expect.any(Function));
    });

    it('serves a livery preview off disk', async () => {
      const handler = serve();
      const response = await handler(new Request('accontent://car/car_a/skin/red'));

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('image/jpeg');
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('cars/car_a/skins/red/preview.jpg'),
      );
    });

    it('serves a badge and a track outline as PNGs', async () => {
      const handler = serve();

      expect((await handler(new Request('accontent://car/car_a/badge'))).headers.get('content-type'))
        .toBe('image/png');
      expect((await handler(new Request('accontent://track/spa/outline'))).headers.get('content-type'))
        .toBe('image/png');
    });

    // The type comes from the filename we chose, never from sniffing, so a file
    // that is not the image it claims to be still cannot be served as anything
    // else.
    it('sets the type from its own allow-list, not from the file', async () => {
      fetchMock.mockResolvedValue(new Response('bytes', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }));

      const handler = serve();
      const response = await handler(new Request('accontent://car/car_a/badge'));

      expect(response.headers.get('content-type')).toBe('image/png');
    });

    it('refuses a URL it cannot read', async () => {
      const handler = serve();

      expect((await handler(new Request('accontent://car/car_a/nonsense'))).status).toBe(400);
      expect((await handler(new Request('accontent://elsewhere/x/badge'))).status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('refuses a URL that tries to climb out of the content folder', async () => {
      const handler = serve();
      const response = await handler(new Request('accontent://car/..%2F..%2Fwindows/badge'));

      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('answers 503 until an install has been located', async () => {
      const handler = serve(null);
      const response = await handler(new Request('accontent://car/car_a/badge'));

      expect(response.status).toBe(503);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    // A preview that is simply not installed should become an img that fails to
    // load, which is what a browser expects - not an error in the console.
    it('answers 404 for an image that is not there', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

      const handler = serve();
      expect((await handler(new Request('accontent://car/car_a/badge'))).status).toBe(404);
    });

    it('answers 404 rather than throwing when the read blows up', async () => {
      fetchMock.mockRejectedValue(new Error('EACCES'));

      const handler = serve();
      expect((await handler(new Request('accontent://car/car_a/badge'))).status).toBe(404);
    });
  });
});
