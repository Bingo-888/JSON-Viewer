# API 文档

Express 服务默认监听 `http://localhost:3847`，可通过环境变量 `PORT` 修改。

## 健康检查

### `GET /api/health`

检查服务是否正常运行。

**请求**

```http
GET /api/health HTTP/1.1
Host: localhost:3847
```

**响应** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-06-24T10:00:00.000Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| status | string | 固定为 `"ok"` |
| timestamp | string | ISO 8601 时间戳 |

**示例（curl）**

```bash
curl http://localhost:3847/api/health
```

## 静态资源（生产模式）

当 `NODE_ENV=production` 时，Express 托管 `packages/client/dist/`：

| 路径 | 说明 |
|------|------|
| `GET /` | SPA `index.html` |
| `GET /assets/*` | Vite 构建的 JS/CSS |
| `GET /*` | SPA fallback → `index.html` |

开发模式下静态资源由 Vite（端口 5173）提供，Express 仅提供 API。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3847` | Express 监听端口 |
| `NODE_ENV` | — | `production` 时启用静态托管 |

## CORS

开发环境下允许 `http://localhost:*` 来源跨域请求，并支持 `credentials`。

生产模式下 CORS 关闭（同源访问）。

## 相关文档

- [架构说明](architecture.md)
- [开发指南](development.md)
