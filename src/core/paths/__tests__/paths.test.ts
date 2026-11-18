import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';

import {
  probeAcDocuments,
  probeAcRoot,
  probeContentManager,
  probePaths,
} from '../paths.ts';
import { exists, regQuery } from '../utils.ts';

// pick() is left real - the precedence rules are what these tests are about.
jest.mock('../utils.ts', () => ({
  ...jest.requireActual<typeof import('../utils.ts')>('../utils.ts'),
  exists: jest.fn(),
  regQuery: jest.fn(),
}));

const existsMock = jest.mocked(exists);
const regQueryMock = jest.mocked(regQuery);

const CM = 'D:\\Steam\\common\\assettocorsa\\Content Manager.exe';
const AC_ROOT = 'D:\\Steam\\common\\assettocorsa';

describe('core/paths', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.CM_PATH;
    delete process.env.AC_ROOT;
    delete process.env.AC_DOCUMENTS;
    regQueryMock.mockResolvedValue(null);
    existsMock.mockResolvedValue(false);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('probeContentManager', () => {
    it('reads the exe out of the acmanager registration', async () => {
      regQueryMock.mockResolvedValue(`"${CM}" "%1"`);
      existsMock.mockResolvedValue(true);

      await expect(probeContentManager()).resolves.toMatchObject({
        value: CM, origin: 'registry', exists: true,
      });
    });

    it('prefers an override over the registry', async () => {
      regQueryMock.mockResolvedValue(`"${CM}" "%1"`);
      existsMock.mockResolvedValue(true);

      await expect(probeContentManager({ contentManager: 'E:\\cm.exe' })).resolves.toMatchObject({
        value: 'E:\\cm.exe', origin: 'override',
      });
    });

    it('prefers the environment variable over the registry', async () => {
      process.env.CM_PATH = 'E:\\env-cm.exe';
      regQueryMock.mockResolvedValue(`"${CM}" "%1"`);
      existsMock.mockResolvedValue(true);

      await expect(probeContentManager()).resolves.toMatchObject({
        value: 'E:\\env-cm.exe', origin: 'env',
      });
    });

    it('explains how to register the protocol when nothing is found', async () => {
      const probe = await probeContentManager();

      expect(probe).toMatchObject({ value: null, exists: false });
      expect(probe.error?.code).toBe('paths.contentManager.unregistered');
    });

    it('reports a bad override rather than falling back to the registry', async () => {
      regQueryMock.mockResolvedValue(`"${CM}" "%1"`);
      existsMock.mockImplementation(async (target) => target === CM);

      const probe = await probeContentManager({ contentManager: 'E:\\gone.exe' });

      expect(probe).toMatchObject({ value: 'E:\\gone.exe', origin: 'override', exists: false });
    });
  });

  describe('probeAcRoot', () => {
    it('judges a folder by whether content\\cars is in it', async () => {
      existsMock.mockImplementation(async (target) => target.endsWith('content\\cars'));

      await expect(probeAcRoot({}, CM)).resolves.toMatchObject({
        value: AC_ROOT, origin: 'registry', exists: true,
      });
    });

    it('falls back to the Steam library', async () => {
      regQueryMock.mockResolvedValue('D:/Steam');
      existsMock.mockImplementation(async (target) => target.startsWith('D:\\Steam\\steamapps'));

      await expect(probeAcRoot()).resolves.toMatchObject({ origin: 'steam', exists: true });
    });

    it('names what it looked for when nothing matches', async () => {
      const probe = await probeAcRoot({}, CM);
      expect(probe.error?.code).toBe('paths.acRoot.notFound');
    });
  });

  describe('probeAcDocuments', () => {
    it('prefers the registry over the naive home-directory guess', async () => {
      regQueryMock.mockResolvedValue('E:\\Docs');
      existsMock.mockResolvedValue(true);

      await expect(probeAcDocuments()).resolves.toMatchObject({
        value: 'E:\\Docs\\Assetto Corsa', origin: 'registry',
      });
    });

    it('expands environment variables in the registry value', async () => {
      process.env.TESTROOT = 'E:\\Expanded';
      regQueryMock.mockResolvedValue('%TESTROOT%\\Docs');
      existsMock.mockResolvedValue(true);

      await expect(probeAcDocuments()).resolves.toMatchObject({
        value: 'E:\\Expanded\\Docs\\Assetto Corsa',
      });
    });

    it('tries OneDrive, which relocates Documents routinely', async () => {
      existsMock.mockImplementation(async (target) => target.includes('OneDrive'));

      await expect(probeAcDocuments()).resolves.toMatchObject({
        origin: 'default', exists: true,
      });
    });
  });

  describe('probePaths', () => {
    it('derives every path once all three are found', async () => {
      regQueryMock.mockImplementation(async (key) => (key.includes('acmanager') ? `"${CM}" "%1"` : 'E:\\Docs'));
      existsMock.mockResolvedValue(true);

      const report = await probePaths();

      expect(report.derived).toMatchObject({
        contentManager: CM,
        acRoot: AC_ROOT,
        content: `${AC_ROOT}\\content`,
        raceOut: 'E:\\Docs\\Assetto Corsa\\out\\race_out.json',
      });
    });

    it('leaves derived null when any one is missing', async () => {
      const report = await probePaths();

      expect(report.derived).toBeNull();
      expect(report.contentManager.exists).toBe(false);
    });

    it('never throws, however little it finds', async () => {
      await expect(probePaths()).resolves.toBeDefined();
    });
  });
});
