# 前端开发文档

## 项目概述

基于 React + TypeScript + Vite 构建的能力模型管理系统前端应用，提供用户认证、角色管理、岗位管理、能力评估等功能界面。

## 技术栈

- **框架**: React 19.x
- **语言**: TypeScript 5.9.x
- **构建工具**: Vite 7.x
- **UI 组件库**: Ant Design 6.x
- **图表库**: ECharts 6.x (echarts-for-react)
- **路由**: React Router DOM 7.x
- **状态管理**: React Hooks

## 项目结构

```
web/
├── src/
│   ├── pages/                    # 页面组件
│   │   ├── Login.tsx            # 登录页面
│   │   ├── PersonalRadar.tsx    # 个人能力雷达图
│   │   ├── TeamRadar.tsx        # 团队能力管理
│   │   ├── RoleManagement.tsx   # 角色管理
│   │   ├── PositionManagement.tsx # 岗位管理
│   │   ├── DepartmentManagement.tsx # 部门管理
│   │   └── RankConfig.tsx       # 职级配置
│   ├── services/                # 服务层
│   │   └── api.ts              # API 接口封装
│   ├── types/                   # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                   # 工具函数
│   │   └── storage.ts          # 本地存储工具
│   ├── App.tsx                  # 应用主组件
│   └── main.tsx                 # 应用入口
├── public/                      # 静态资源
├── index.html                   # HTML 模板
├── vite.config.ts              # Vite 配置
└── package.json
```

## 环境配置

### API 基础地址

在 `src/services/api.ts` 中配置：

```typescript
const API_BASE_URL = 'http://localhost:3000';
```

生产环境需要修改为实际的后端服务地址。

## 核心功能模块

### 1. 认证模块

#### 登录页面 (Login.tsx)
- 用户名密码登录
- 记住登录状态
- Token 存储到 localStorage
- 登录成功后跳转到主页

#### 路由守卫
- 检查 token 是否存在
- 未登录自动跳转到登录页
- 登录后根据权限显示菜单

### 2. 个人能力模块 (PersonalRadar.tsx)

**功能特性**：
- 展示个人能力雷达图
- 显示岗位对应的能力维度
- 能力自评和编辑
- 对比岗位标准分数
- 综合得分计算

**关键组件**：
- ReactECharts: 雷达图展示
- Slider: 能力评分滑块
- Progress: 能力进度条

### 3. 团队能力管理 (TeamRadar.tsx)

**功能特性**：
- 部门成员能力列表
- 根据成员岗位显示对应能力维度
- 管理员可为成员评分
- 能力评分可视化（Tag 颜色标识）
- 评分弹窗显示能力维度描述和标准分数

**权限控制**：
- admin/hr: 可管理所有部门
- 部门管理员: 只能管理自己的部门

### 4. 角色管理 (RoleManagement.tsx)

**功能特性**：
- 角色 CRUD 操作
- 权限配置（页面权限 + 操作权限）
- 批量添加用户到角色
- 用户列表查看和删除
- 添加用户时选择岗位和职级

**关键功能**：
- 权限分组展示（页面访问权限、操作权限）
- 批量用户创建（Form.List）
- 用户岗位和职级选择

### 5. 岗位管理 (PositionManagement.tsx)

**功能特性**：
- 岗位 CRUD 操作
- 能力维度配置
- 不同职级的标准分数设置
- 岗位状态管理（active/inactive）

**能力维度配置**：
- 维度编码、标题、描述
- 为每个职级设置标准分数
- 动态添加/删除维度

### 6. 部门管理 (DepartmentManagement.tsx)

**功能特性**：
- 部门 CRUD 操作
- 部门成员管理
- 部门能力列表查看
- 显示成员岗位、职级和能力评分

**部门能力列表**：
- 展示部门所有成员
- 显示每个成员的岗位和职级
- 显示 8 个维度的能力评分
- 支持横向滚动

### 7. 职级配置 (RankConfig.tsx)

**功能特性**：
- 职级 CRUD 操作
- 职级分类（F/E）
- 工作年限要求设置

## API 服务封装

### api.ts 结构

```typescript
export const api = {
  // 认证
  login(username, password)
  logout()

  // 用户
  getUsers()
  deleteUser(id)
  batchCreateUsers(users, roleId)

  // 角色
  getRoles()
  getRoleById(id)
  updateRolePermissions(id, permissionIds)

  // 岗位
  getPositions()
  createPosition(data)
  updatePosition(id, data)
  deletePosition(id)

  // 部门
  getDepartments()
  getDepartmentMembers(id)
  createDepartment(data)
  updateDepartment(id, data)
  updateDepartmentMembers(id, memberIds)
  deleteDepartment(id)

  // 能力
  getMyAbilityScores()
  updateMyAbilityScores(scores)

  // 职级
  getRanks()

  // 权限
  getPermissions()
}
```

### 请求拦截

所有请求自动携带 Authorization Header：
```typescript
'Authorization': `Bearer ${localStorage.getItem('token')}`
```

### 错误处理

统一的错误处理机制：
```typescript
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message || '操作失败');
}
```

## 类型定义

### 核心类型 (types/index.ts)

```typescript
// 用户
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  positionId?: number;
  rank?: string;
  abilityScores?: Record<string, number>;
}

// 角色
interface Role {
  id: string | number;
  name: string;
  description: string;
  permissions?: Permission[];
}

// 岗位
interface Position {
  id: number;
  code: string;
  name: string;
  dimensions: number;
  ranks: string;
  status: 'active' | 'inactive';
  abilityDimensions: AbilityDimension[];
}

// 能力维度
interface AbilityDimension {
  code: string;
  title: string;
  description: string;
  scores: Record<string, number>; // 职级 -> 标准分数
}

// 部门
interface Department {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
  members?: User[];
}
```

## 本地存储

### storage.ts 工具

```typescript
export const storage = {
  set(key: string, value: any): void
  get(key: string): any
  remove(key: string): void
  clear(): void
}
```

### 存储的数据

- `TOKEN`: JWT token
- `CURRENT_USER`: 当前登录用户信息

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

### 代码规范检查

```bash
npm run lint
```

## 路由配置

```typescript
const routes = [
  { path: '/login', element: <Login /> },
  { path: '/', element: <App /> },
  { path: '/personal', element: <PersonalRadar /> },
  { path: '/team', element: <TeamRadar /> },
  { path: '/roles', element: <RoleManagement /> },
  { path: '/positions', element: <PositionManagement /> },
  { path: '/departments', element: <DepartmentManagement /> },
  { path: '/ranks', element: <RankConfig /> }
]
```

## 组件设计规范

### 页面组件结构

```typescript
export default function PageName() {
  // 1. 状态定义
  const [data, setData] = useState([]);

  // 2. 副作用
  useEffect(() => {
    loadData();
  }, []);

  // 3. 数据加载函数
  const loadData = async () => {
    // ...
  };

  // 4. 事件处理函数
  const handleAction = () => {
    // ...
  };

  // 5. 渲染
  return (
    <Card>
      {/* UI */}
    </Card>
  );
}
```

### 表单处理

使用 Ant Design Form 组件：
```typescript
const [form] = Form.useForm();

// 设置表单值
form.setFieldsValue(data);

// 获取表单值
const values = await form.validateFields();

// 重置表单
form.resetFields();
```

### 消息提示

```typescript
import { message } from 'antd';

message.success('操作成功');
message.error('操作失败');
message.warning('警告信息');
```

## 样式规范

- 使用内联样式或 CSS Modules
- 遵循 Ant Design 设计规范
- 响应式布局考虑

## 性能优化建议

1. 使用 React.memo 优化组件渲染
2. 合理使用 useCallback 和 useMemo
3. 图片懒加载
4. 路由懒加载
5. 避免不必要的状态更新

## 常见问题

### 跨域问题
开发环境在 vite.config.ts 中配置代理

### Token 过期
需要实现 token 刷新机制或重新登录

### 图表不显示
检查 ECharts 配置和数据格式

## 部署建议

1. 构建生产版本
2. 配置 Nginx 反向代理
3. 启用 Gzip 压缩
4. 配置缓存策略
5. 使用 CDN 加速静态资源

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 联系方式

如有问题，请联系开发团队。
