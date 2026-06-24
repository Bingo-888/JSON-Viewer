# Electron 打包

## 配置

`electron-builder` 配置位于 [`packages/electron/package.json`](../packages/electron/package.json) 的 `build` 字段：

| 字段 | 值 |
|------|-----|
| appId | `com.jsonviewer.app` |
| productName | JSON Viewer |
| 输出目录 | `dist-electron/`（项目根目录） |

### 打包文件

- `packages/electron/dist/**/*` — 主进程与 preload
- `packages/client/dist/**/*` — React SPA 静态资源
- `packages/server/dist/**/*` — Express 服务

生产模式下 Electron 主进程 spawn 内嵌 Express，加载 `http://localhost:<PORT>`。

## 打包命令

```bash
# 完整流水线：shared → client → server → electron → 安装包
npm run build:electron
```

等价于：

```bash
npm run build
npm run package -w @json-viewer/electron
```

## 各平台产物

| 平台 | 格式 | 产物路径 |
|------|------|----------|
| Windows | NSIS 安装包 | `dist-electron/JSON Viewer Setup x.x.x.exe` |
| macOS | DMG | `dist-electron/JSON Viewer-x.x.x.dmg` |
| Linux | AppImage | `dist-electron/JSON Viewer-x.x.x.AppImage` |

> 跨平台打包需在对应操作系统上执行，或使用 CI 多平台构建。

### Windows 打包注意事项

若遇到 `Cannot create symbolic link` 权限错误，配置中已设置 `signAndEditExecutable: false`。也可手动设置：

```bash
$env:CSC_IDENTITY_AUTO_DISCOVERY="false"
npm run build:electron
```

## 开发模式 vs 生产模式

| 模式 | URL | 服务 |
|------|-----|------|
| 开发 | `http://localhost:5173` | Vite HMR（由 concurrently 启动） |
| 生产 | `http://localhost:3847` | Electron 内嵌 spawn Express |

判断逻辑：`!app.isPackaged && NODE_ENV !== 'production'` 为开发模式。

## 代码签名

当前未配置代码签名。发布前建议：

- **Windows**：使用 Authenticode 证书签名 NSIS 安装包
- **macOS**：Apple Developer ID 签名 + 公证（notarization）
- **Linux**：AppImage 可选 GPG 签名

在 `packages/electron/package.json` 的 `build` 中添加：

```json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "..."
  },
  "mac": {
    "identity": "Developer ID Application: ..."
  }
}
```

> 证书路径与密码应通过环境变量或 CI secrets 注入，勿提交到仓库。

## Windows 路径注意事项

在 Windows 上，项目路径或用户目录若包含非 ASCII 字符（如中文），`electron-builder` 打包 NSIS 安装包时可能失败。建议将仓库克隆到纯 ASCII 路径（如 `C:\dev\JSON-Viewer`），或将 `ELECTRON_BUILDER_CACHE` 设为 ASCII 路径。

## 相关文档

- [开发指南](development.md)
- [架构说明](architecture.md)
