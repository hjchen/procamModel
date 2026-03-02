# 后端开发文档

## 项目概述

基于 NestJS 框架的能力模型管理系统后端服务，提供用户认证、角色权限、岗位管理、能力评估等功能。

## 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.7.x
- **数据库**: MySQL (通过 TypeORM)
- **认证**: JWT + Passport
- **密码加密**: bcrypt

## 项目结构

```
server/
├── src/
│   ├── ability/              # 能力评分模块
│   ├── ability-dimension/    # 能力维度模块
│   ├── auth/                 # 认证模块
│   ├── department/           # 部门管理模块
│   ├── entities/             # 数据库实体
│   ├── permission/           # 权限模块
│   ├── position/             # 岗位管理模块
│   ├── rank/                 # 职级管理模块
│   ├── role/                 # 角色管理模块
│   ├── user/                 # 用户管理模块
│   ├── app.module.ts         # 应用主模块
│   └── main.ts               # 应用入口
├── test/                     # 测试文件
├── .env                      # 环境变量配置
└── package.json
```

## 环境配置

### 环境变量 (.env)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=procam

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3000
```

## 数据库实体

### User (用户)
- 用户基本信息
- 关联角色、岗位、部门
- 存储能力评分 (JSON格式)

### Role (角色)
- 角色名称和描述
- 关联权限 (多对多)
- 关联用户 (一对多)

### Permission (权限)
- 权限名称、描述、类型
- 页面访问权限和操作权限

### Position (岗位)
- 岗位编码、名称
- 关联能力维度 (一对多)
- 支持的职级范围

### AbilityDimension (能力维度)
- 能力维度编码、标题、描述
- 不同职级的标准分数 (JSON格式)
- 关联岗位

### Department (部门)
- 部门名称、描述
- 部门管理员
- 关联成员

### Rank (职级)
- 职级分类 (F/E)
- 职级等级、名称
- 工作年限要求

## API 接口

### 认证模块 (/auth)

#### POST /auth/login
用户登录
```json
Request:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "access_token": "string",
  "user": {
    "id": number,
    "username": "string",
    "name": "string",
    "role": object
  }
}
```

### 用户模块 (/users)

#### GET /users
获取所有用户列表

#### GET /users/:id
获取指定用户信息

#### POST /users
创建用户
```json
{
  "username": "string",
  "password": "string",
  "name": "string",
  "email": "string",
  "roleId": number
}
```

#### POST /users/batch
批量创建用户
```json
{
  "users": [
    {
      "username": "string",
      "name": "string",
      "email": "string",
      "positionId": number,
      "rank": "string"
    }
  ],
  "roleId": number
}
```

#### PUT /users/:id/scores
更新用户能力评分
```json
{
  "abilityScores": {
    "dimension_code": number
  }
}
```

### 角色模块 (/roles)

#### GET /roles
获取所有角色

#### GET /roles/:id
获取角色详情（包含权限）

#### POST /roles
创建角色

#### PUT /roles/:id
更新角色（包含权限配置）

#### DELETE /roles/:id
删除角色

#### GET /roles/permissions/all
获取所有权限列表

### 岗位模块 (/positions)

#### GET /positions
获取所有岗位（包含能力维度）

#### GET /positions/:id
获取岗位详情

#### POST /positions
创建岗位
```json
{
  "code": "string",
  "name": "string",
  "dimensions": number,
  "ranks": "string",
  "status": "active" | "inactive",
  "abilityDimensions": [
    {
      "code": "string",
      "title": "string",
      "description": "string",
      "scores": {
        "F1": number,
        "F2": number,
        ...
      }
    }
  ]
}
```

#### PUT /positions/:id
更新岗位

#### DELETE /positions/:id
删除岗位

### 部门模块 (/departments)

#### GET /departments
获取所有部门

#### GET /departments/:id
获取部门详情（包含成员）

#### GET /departments/:id/members
获取部门成员列表

#### POST /departments
创建部门

#### PUT /departments/:id
更新部门

#### PUT /departments/:id/members
更新部门成员
```json
{
  "memberIds": [number]
}
```

#### DELETE /departments/:id
删除部门

### 能力模块 (/ability)

#### GET /ability/my-scores
获取当前用户的能力评分
```json
Response:
{
  "name": "string",
  "position": number,
  "positionName": "string",
  "rank": "string",
  "scores": {
    "dimension_code": number
  },
  "abilityDimensions": [
    {
      "code": "string",
      "title": "string",
      "description": "string",
      "standardScore": number
    }
  ]
}
```

#### PUT /ability/my-scores
更新当前用户的能力评分
```json
{
  "dimension_code": number
}
```

### 职级模块 (/ranks)

#### GET /ranks
获取所有职级

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run start:dev
```

### 构建生产版本

```bash
npm run build
npm run start:prod
```

### 运行测试

```bash
npm run test
npm run test:e2e
npm run test:cov
```

### 代码规范

```bash
npm run lint
npm run format
```

## 认证机制

系统使用 JWT (JSON Web Token) 进行身份认证：

1. 用户登录成功后获取 access_token
2. 后续请求需在 Header 中携带 token：
   ```
   Authorization: Bearer <access_token>
   ```
3. 除登录接口外，所有接口都需要认证

## 权限控制

- 使用 `@UseGuards(AuthGuard('jwt'))` 装饰器保护路由
- 权限分为页面访问权限和操作权限
- 角色与权限多对多关联
- 用户通过角色获得权限

## 数据库迁移

```bash
# 生成迁移文件
npm run migration:generate -- src/migrations/MigrationName

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 常见问题

### 数据库连接失败
检查 .env 文件中的数据库配置是否正确

### JWT 验证失败
确认 JWT_SECRET 配置正确，token 未过期

### 跨域问题
在 main.ts 中已配置 CORS，允许所有来源访问

## 部署建议

1. 使用环境变量管理敏感配置
2. 启用 HTTPS
3. 配置反向代理 (Nginx)
4. 使用 PM2 管理进程
5. 定期备份数据库
6. 监控日志和性能指标

## 联系方式

如有问题，请联系开发团队。
