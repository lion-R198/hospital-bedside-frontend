# 床旁信息系统前端（hospital-bedside-frontend）

床旁信息系统前端工程，面向住院患者及家属的床旁自助服务终端。

- 后端技术栈：Spring Boot 3.x + MyBatis-Plus + MySQL 8.0（本仓库为前端）
- 前端技术栈：Vue 3 + Vite 5 + Element Plus + Pinia + Vue Router + Axios + ECharts
- 设计文档：《床旁信息系统需求规格说明书》《数据库设计说明》《schema.sql》

## 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务（默认 http://localhost:5173）
npm run build   # 生产构建
npm run verify  # Mock 接口契约运行时验证（40 项断言）
```

## 演示账号

| 账号 | 密码 | 角色 |
| --- | --- | --- |
| patient01 | 123456 | 患者（王建华，内科一病区 305 床 2） |
| family01 | 123456 | 家属/陪护（关联患者王建华，经授权绑定） |

> 按需求说明书权限矩阵，床旁终端仅面向患者与家属；医生/护士账号会被引导至医护工作站，管理员账号会被引导至后台管理系统（登录接口与路由守卫双重拦截）。

## 功能模块（对齐需求规格说明书）

首页（今日概览/待办/公告/快捷入口）、患者信息、我的医嘱、体征数据、费用清单、饮食建议、我的医护、医院介绍、健康宣教。

## 工程要点

- **统一请求** `src/utils/request.js`：axios 封装，统一 `{code,msg,data}` 响应解包、401/403 处理、错误提示。
  - 错误提示**只在拦截器里弹一次**：任何 `code !== 200` 都直接展示后端 `msg`（后端文案按面向患者的可读性编写），
    页面内不得重复 `ElMessage.error`，避免二次提示。
  - 鉴权失败走后端返回的 **HTTP 401**（body 细分码 `1004 令牌无效` / `1005 未登录`），由拦截器统一清凭证并跳登录并记录回跳地址。
  - 因此页面的异步处理器只需 `try/catch` 兜住拒绝（不弹提示、不吞掉 loading 复位）；
    `ElMessageBox.confirm` 被用户关闭时以 `'cancel'` 拒绝，**属正常交互**，必须 catch 后 `return`，否则会产生未处理的 Promise 拒绝。
- **令牌管理** `src/utils/auth.js`：Token/用户信息持久化，请求头自动携带 `Authorization: Bearer <token>`，失效自动跳转登录。
- **路由守卫** `src/router/index.js`：登录校验、角色越权拦截（权限矩阵）、登录回跳。
- **状态管理** `src/store`：用户状态（登录/患者上下文）、应用状态（公告/侧边栏）。
- **业务字典** `src/dict/index.js`：枚举文案/标签色与 `schema.sql` 字段注释一一对应，页面禁止硬编码枚举含义。
- **模拟数据** `src/mock`：接口契约与真实后端一致，含模拟延迟与令牌校验；`.env` 中 `VITE_USE_MOCK=true` 启用，对接真实 API 时改为 `false` 并由 Vite 代理转发至 Spring Boot（`VITE_PROXY_TARGET`）。

## 对接真实后端

1. `.env.development` 中 `VITE_USE_MOCK=false`
2. 确认 `VITE_PROXY_TARGET` 指向 Spring Boot 地址（默认 http://localhost:8080）
3. 后端按本工程 `src/api/*.js` 的接口路径与响应结构实现即可

## 运行时验证结论

- 生产构建：`vite build` 通过（2267 模块，分包：vue / element / echarts）；
- 接口契约：`npm run verify` 45/45 断言通过（鉴权拦截、错误密码、医护角色拒绝、各业务域数据与脱敏规则、家属授权链路）；
- 浏览器渲染：Edge 无头模式验证 9 个页面（登录/首页/患者信息/医嘱/体征/费用/饮食/医护/医院/宣教）均正常渲染；
- `public/dev-login.html` 仅为本地开发与自动化验证用的令牌注入辅助页，生产构建后应删除或通过网关屏蔽。
