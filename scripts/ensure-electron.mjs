import { existsSync, mkdirSync, readFileSync, symlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const workspaceElectronDir = join(root, 'packages/electron/node_modules/electron');
const hoistedElectronDir = join(root, 'node_modules/electron');

function findElectronDir() {
  if (existsSync(join(workspaceElectronDir, 'install.js'))) return workspaceElectronDir;
  if (existsSync(join(hoistedElectronDir, 'install.js'))) return hoistedElectronDir;
  return undefined;
}

function ensureWorkspaceLink(sourceDir) {
  if (sourceDir === workspaceElectronDir || existsSync(join(workspaceElectronDir, 'install.js'))) {
    return;
  }
  mkdirSync(dirname(workspaceElectronDir), { recursive: true });
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';
  symlinkSync(sourceDir, workspaceElectronDir, linkType);
}

const electronDir = findElectronDir();

function isInstalled() {
  if (!electronDir) return false;
  const pathFile = join(electronDir, 'path.txt');
  if (!existsSync(pathFile)) return false;
  const relPath = readFileSync(pathFile, 'utf-8').trim();
  return existsSync(join(electronDir, 'dist', relPath));
}

function runInstall() {
  if (!electronDir) {
    console.warn('[ensure-electron] electron package not found, skipping');
    return true;
  }
  const installJs = join(electronDir, 'install.js');
  console.log('[ensure-electron] running install.js...');
  const result = spawnSync(process.execPath, [installJs], {
    cwd: electronDir,
    stdio: 'inherit',
  });
  return result.status === 0;
}

if (isInstalled()) {
  ensureWorkspaceLink(electronDir);
  console.log('[ensure-electron] electron binary OK');
  process.exit(0);
}

if (!runInstall() || !isInstalled()) {
  console.error('[ensure-electron] Electron binary installation failed.');
  console.error('  - Recommended: Node.js 20 LTS or 22 LTS');
  console.error('  - Node 24: ensure package.json overrides yauzl to ^3.3.1');
  console.error('  - Retry: delete node_modules/electron, then npm install');
  console.error('  - Web-only dev: npm run dev:web');
  process.exit(1);
}

ensureWorkspaceLink(electronDir);

console.log('[ensure-electron] electron binary OK');
