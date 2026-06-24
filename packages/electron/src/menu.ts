import { app, BrowserWindow, Menu, shell } from 'electron';
import type { MenuAction } from './types.js';

export function buildMenu(mainWindow: BrowserWindow): Menu {
  const sendAction = (action: MenuAction) => {
    mainWindow.webContents.send('menu:action', action);
  };

  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }],
          } as Electron.MenuItemConstructorOptions,
        ]
      : []),
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendAction('new'),
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendAction('open'),
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendAction('save'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', label: '退出' },
      ],
    },
    {
      label: '编辑',
      submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'toggleDevTools', label: '开发者工具' },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
