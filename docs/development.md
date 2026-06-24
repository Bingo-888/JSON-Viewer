# 开发指南

## 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | >= 20，< 25（推荐 20 LTS 或 22 LTS） |
| npm | >= 10 |

使用 nvm/fnm 时，根目录 `.nvmrc` 指向 Node 22。

## 目录结构

```
packages/
├── shared/
│   └── src/
│       ├── types.ts      # JsonValue、TreeNode、ParseResult
│       ├── jsonc.ts      # isLikelyJsonc、parseJsonc、stringifyJson
│       └── tree.ts       # objectToTree、treeToObject
├── client/
│   └── src/
│       ├── components/   # UI 组件
│       ├── hooks/          # useSync、useJsonDocument
│       ├── stores/         # documentStore
│       └── lib/            # fileIo、treeOps
├── server/
│   └── src/
│       ├── index.ts
│       ├── routes/health.ts
│       └── middleware/cors.ts
└── electron/
    └── src/
        ├── main.ts
        ├── preload.ts
        └── menu.ts
```

## 版本号管理
所有 package.json 里保持同一个版本号：
| 位置                  | 当前版本 |
|----------------------|----------|
| 根目录 package.json   | 0.1.0    |
| packages/shared       | 0.1.0    |
| packages/client       | 0.1.0    |
| packages/server       | 0.1.0    |
| packages/electron     | 0.1.0    |

## 常用命令

### 根目录

```bash
npm install              # 安装所有 workspace 依赖（含 Electron 二进制校验）
npm run dev              # 启动 server + client + electron
npm run dev:web          # 仅启动 server + client（无 Electron）
npm run build            # 构建 shared → client → server → electron
npm run build:electron   # 完整构建 + 打包安装包
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
```

### 各包独立开发

```bash
npm run build -w @json-viewer/shared
npm run dev -w @json-viewer/server
npm run dev -w @json-viewer/client
npm run dev -w @json-viewer/electron
```

### 生产模式验证

```bash
npm run build
$env:NODE_ENV="production"; npm run start -w @json-viewer/server
# 浏览器访问 http://localhost:3847
```

## 端口

| 服务 | 默认端口 | 环境变量 |
|------|----------|----------|
| Express | 3847 | `PORT` |
| Vite dev | 5173 | — |

Vite 开发时将 `/api` 代理到 `http://localhost:3847`。

## 常见问题

### 端口被占用

```bash
# Windows 查看占用
netstat -ano | findstr :3847

# 或设置其他端口
$env:PORT="3850"; npm run dev -w @json-viewer/server
```

### Electron 安装失败

```
Error: Electron failed to install correctly
```

`npm install` 会通过 `postinstall` 自动下载 Electron 二进制。若仍失败，按顺序排查：

1. 确认 Node.js 版本在 20–24 之间（推荐 22 LTS）
2. 手动触发安装脚本：

```bash
node node_modules/electron/install.js
# 或（未提升时）
node packages/electron/node_modules/electron/install.js
```

3. 删除 Electron 包后重装：

```bash
# Windows PowerShell
Remove-Item -Recurse -Force packages\electron\node_modules\electron
npm install
```

4. 仍失败时删除整个 `node_modules` 后重新 `npm install`

临时仅做 Web 开发：`npm run dev:web`

### Monaco Editor 加载慢

Monaco 首次加载需下载 WASM，确保网络畅通。开发模式下 Vite 会缓存依赖。

### workspace 依赖链接失败

确保先构建 shared：

```bash
npm run build -w @json-viewer/shared
```

client 通过 `@json-viewer/shared` 引用编译后的 `dist/`。

### JSONC 警告不再出现

检查 `localStorage` 中 `json-viewer-skip-jsonc-warning` 是否为 `true`，清除即可恢复提示。

## 相关文档

- [架构说明](architecture.md)
- [Electron 打包](electron.md)
- [API 文档](api.md)
