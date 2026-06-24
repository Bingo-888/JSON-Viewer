# JSON Viewer

JSON/JSONC 可视化编辑器：左侧树状结构、右侧 Monaco 代码编辑器，双向同步阅读和编辑 JSON 数据。

支持 **Electron 桌面应用** 与 **浏览器 Web 访问**（通过 Express 托管）。

## 功能

- 树状视图 + 代码编辑器双栏布局，可拖拽调整宽度
- 树与代码双向实时同步
- JSONC 支持：打开前警告，确认后剥离注释，保存为标准 JSON
- 树节点增删改、类型徽章、内联编辑
- 新建 / 打开 / 保存 / 格式化 / 校验
- Electron 原生文件对话框与菜单快捷键（Ctrl+N/O/S）
- 大于 5MB 文件打开前性能提示

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18、Vite、TypeScript、Zustand、Monaco Editor |
| 后端 | Express |
| 桌面 | Electron 33+ |
| 共享 | jsonc-parser |

## 快速开始

### 环境要求

- Node.js >= 20（推荐 20 LTS 或 22 LTS；Node 24 已内置兼容修复）
- npm >= 10

### 安装与开发

```bash
npm install          # 自动下载并校验 Electron 二进制

# 一键启动 server + client + Electron
npm run dev
```

- 浏览器访问：http://localhost:5173
- Express API：http://localhost:3847/api/health
- Electron 窗口自动打开

仅 Web 开发（不启动 Electron）：

```bash
npm run dev:web
```

### 单独启动

```bash
npm run dev:server   # Express（端口 3847）
npm run dev:client   # Vite（端口 5173）
```

## 构建

```bash
# 构建 shared → client → server → electron
npm run build

# 打包桌面安装包（Windows NSIS）
npm run build:electron
```

产物路径：`dist-electron/`

## 截图

截图占位目录：[`docs/images/`](docs/images/README.md)

## 文档

- [架构说明](docs/architecture.md)
- [开发指南](docs/development.md)
- [Electron 打包](docs/electron.md)
- [API 文档](docs/api.md)

## 许可证

[MIT](LICENSE)
