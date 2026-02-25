import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from './entities/user.entity';
import { Position } from './entities/position.entity';
import { AbilityDimension } from './entities/ability-dimension.entity';
import { Rank } from './entities/rank.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Permission) private permissionsRepository: Repository<Permission>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Position) private positionsRepository: Repository<Position>,
    @InjectRepository(AbilityDimension) private abilityDimensionsRepository: Repository<AbilityDimension>,
    @InjectRepository(Rank) private ranksRepository: Repository<Rank>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.initializeData();
  }

  async initializeData() {
    // 初始化权限
    const permissions: Array<{
      name: string;
      description: string;
      type: 'page' | 'action';
      path: string;
    }> = [
      { name: 'position:read', description: '查看岗位', type: 'page', path: '/positions' },
      { name: 'position:create', description: '创建岗位', type: 'action', path: '/positions' },
      { name: 'position:update', description: '更新岗位', type: 'action', path: '/positions' },
      { name: 'position:delete', description: '删除岗位', type: 'action', path: '/positions' },
      { name: 'role:read', description: '查看角色', type: 'page', path: '/roles' },
      { name: 'role:create', description: '创建角色', type: 'action', path: '/roles' },
      { name: 'role:update', description: '更新角色', type: 'action', path: '/roles' },
      { name: 'role:delete', description: '删除角色', type: 'action', path: '/roles' },
      { name: 'user:read', description: '查看用户', type: 'page', path: '/users' },
      { name: 'user:create', description: '创建用户', type: 'action', path: '/users' },
      { name: 'user:update', description: '更新用户', type: 'action', path: '/users' },
      { name: 'user:delete', description: '删除用户', type: 'action', path: '/users' },
    ];

    const createdPermissions: Permission[] = [];
    for (const permData of permissions) {
      const existingPerm = await this.permissionsRepository.findOne({ where: { name: permData.name } });
      if (!existingPerm) {
        const perm = this.permissionsRepository.create(permData);
        const savedPerm = await this.permissionsRepository.save(perm);
        createdPermissions.push(savedPerm);
      } else {
        createdPermissions.push(existingPerm);
      }
    }

    // 初始化角色
    const roles = [
      { name: 'admin', description: '系统管理员', permissionIds: createdPermissions.map(p => p.id) },
      { name: 'hr', description: 'HR管理员', permissionIds: createdPermissions.filter(p => p.name.includes('user') || p.name.includes('position')).map(p => p.id) },
      { name: 'manager', description: '部门管理者', permissionIds: createdPermissions.filter(p => p.name.includes('user') || p.name.includes('position')).map(p => p.id) },
      { name: 'employee', description: '工程师', permissionIds: createdPermissions.filter(p => p.name === 'position:read').map(p => p.id) },
    ];

    let adminRoleId;
    for (const roleData of roles) {
      const existingRole = await this.rolesRepository.findOne({ where: { name: roleData.name } });
      if (!existingRole) {
        const role = this.rolesRepository.create({
          name: roleData.name,
          description: roleData.description,
          permissions: createdPermissions.filter(p => roleData.permissionIds.includes(p.id)),
        });
        const savedRole = await this.rolesRepository.save(role);
        if (roleData.name === 'admin') {
          adminRoleId = savedRole.id;
        }
      } else {
        if (existingRole.name === 'admin') {
          adminRoleId = existingRole.id;
        }
      }
    }

    // 初始化系统管理员账号
    const adminUser = await this.usersRepository.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin', 10); // 密码默认为用户名
      const user = this.usersRepository.create({
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        email: 'admin@example.com',
        roleId: adminRoleId,
        permissions: createdPermissions.map(p => p.name),
        isActive: true,
      });
      await this.usersRepository.save(user);
    }

    // 初始化职级
    const ranks = [
      { category: 'F' as const, level: 'F1', name: '初级开发工程师', years: '0-1年', description: '具备基本的编程技能，能够在指导下完成简单的开发任务' },
      { category: 'F' as const, level: 'F2', name: '中级开发工程师', years: '1-3年', description: '具备独立开发能力，能够完成中等复杂度的开发任务' },
      { category: 'F' as const, level: 'F3', name: '高级开发工程师', years: '3-5年', description: '具备丰富的开发经验，能够完成复杂的开发任务，指导初级工程师' },
      { category: 'E' as const, level: 'E1', name: '技术专家', years: '5-8年', description: '在某个技术领域有深入研究，能够解决复杂的技术问题' },
      { category: 'E' as const, level: 'E2', name: '高级技术专家', years: '8-10年', description: '在多个技术领域有深入研究，能够主导技术架构设计' },
      { category: 'E' as const, level: 'E3', name: '首席技术专家', years: '10年以上', description: '在技术领域有广泛影响力，能够引领技术方向' },
    ];

    for (const rankData of ranks) {
      const existingRank = await this.ranksRepository.findOne({ where: { level: rankData.level } });
      if (!existingRank) {
        const rank = this.ranksRepository.create(rankData);
        await this.ranksRepository.save(rank);
      }
    }

    // 初始化岗位和能力维度
    const positions = [
      {
        code: 'FE',
        name: 'Web前端工程师',
        dimensions: 8,
        ranks: 'F1-F3, E1-E3',
        status: 'active' as const,
        abilityDimensions: [
          { code: 'FE-JS', title: 'JS/TS语言深度', description: 'JavaScript/TypeScript语言的掌握程度，包括语言特性、设计模式等', scores: { F1: 60, F2: 75, F3: 90, E1: 95, E2: 98, E3: 100 } },
          { code: 'FE-Framework', title: '框架和生态', description: '前端框架（如React、Vue、Angular）的使用和理解，以及相关生态工具', scores: { F1: 55, F2: 70, F3: 85, E1: 90, E2: 95, E3: 98 } },
          { code: 'FE-Engineering', title: '前端工程化', description: '前端工程化实践，包括构建工具、CI/CD、代码规范等', scores: { F1: 50, F2: 65, F3: 80, E1: 85, E2: 90, E3: 95 } },
          { code: 'FE-Performance', title: '性能优化', description: '前端性能优化技术，包括页面加载速度、渲染性能等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'FE-UI', title: 'UI/UX设计', description: '用户界面和用户体验设计能力，包括响应式设计、交互设计等', scores: { F1: 45, F2: 60, F3: 75, E1: 80, E2: 85, E3: 90 } },
          { code: 'FE-Browser', title: '浏览器原理', description: '浏览器工作原理，包括渲染机制、事件循环、API等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'FE-Network', title: '网络协议', description: '网络协议和HTTP/HTTPS相关知识，包括请求优化、缓存策略等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'FE-Security', title: '前端安全', description: '前端安全知识，包括XSS、CSRF、CSP等安全防护措施', scores: { F1: 35, F2: 50, F3: 65, E1: 75, E2: 85, E3: 90 } },
        ]
      },
      {
        code: 'BE',
        name: 'Java后端工程师',
        dimensions: 8,
        ranks: 'F1-F3, E1-E3',
        status: 'active' as const,
        abilityDimensions: [
          { code: 'BE-Java', title: 'Java语言深度', description: 'Java语言的掌握程度，包括语言特性、设计模式、并发编程等', scores: { F1: 60, F2: 75, F3: 90, E1: 95, E2: 98, E3: 100 } },
          { code: 'BE-Framework', title: '框架和生态', description: 'Java后端框架（如Spring、Spring Boot、MyBatis）的使用和理解', scores: { F1: 55, F2: 70, F3: 85, E1: 90, E2: 95, E3: 98 } },
          { code: 'BE-Database', title: '数据库设计', description: '数据库设计和优化，包括SQL、索引、事务、分库分表等', scores: { F1: 50, F2: 65, F3: 80, E1: 85, E2: 90, E3: 95 } },
          { code: 'BE-Architecture', title: '系统架构', description: '系统架构设计能力，包括微服务、分布式系统、高可用等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'BE-Performance', title: '性能优化', description: '后端性能优化技术，包括JVM调优、缓存策略、负载均衡等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'BE-Security', title: '后端安全', description: '后端安全知识，包括认证授权、SQL注入、CSRF等安全防护措施', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'BE-Cloud', title: '云服务', description: '云服务平台（如AWS、阿里云、腾讯云）的使用和理解', scores: { F1: 35, F2: 50, F3: 65, E1: 75, E2: 85, E3: 90 } },
          { code: 'BE-Testing', title: '测试和部署', description: '测试策略和部署流程，包括单元测试、集成测试、CI/CD等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
        ]
      },
      {
        code: 'FS',
        name: '全栈工程师',
        dimensions: 8,
        ranks: 'F1-F3, E1-E3',
        status: 'active' as const,
        abilityDimensions: [
          { code: 'FS-Frontend', title: '前端技术', description: '前端技术栈的掌握程度，包括HTML、CSS、JavaScript、框架等', scores: { F1: 55, F2: 70, F3: 85, E1: 90, E2: 95, E3: 98 } },
          { code: 'FS-Backend', title: '后端技术', description: '后端技术栈的掌握程度，包括语言、框架、数据库等', scores: { F1: 55, F2: 70, F3: 85, E1: 90, E2: 95, E3: 98 } },
          { code: 'FS-Architecture', title: '系统架构', description: '全栈系统架构设计能力，包括前后端分离、API设计、微服务等', scores: { F1: 50, F2: 65, F3: 80, E1: 85, E2: 90, E3: 95 } },
          { code: 'FS-DevOps', title: 'DevOps', description: '开发运维一体化能力，包括容器化、CI/CD、监控等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'FS-Security', title: '安全知识', description: '全栈安全知识，包括前后端安全、网络安全、数据安全等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'FS-Performance', title: '性能优化', description: '全栈性能优化技术，包括前端性能、后端性能、数据库性能等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'FS-Testing', title: '测试策略', description: '全栈测试策略，包括单元测试、集成测试、端到端测试等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'FS-Project', title: '项目管理', description: '项目管理能力，包括需求分析、进度管理、团队协作等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
        ]
      },
      {
        code: 'OPS',
        name: '运维工程师',
        dimensions: 8,
        ranks: 'F1-F3, E1-E3',
        status: 'active' as const,
        abilityDimensions: [
          { code: 'OPS-Linux', title: 'Linux系统', description: 'Linux系统的掌握程度，包括命令行、服务管理、系统调优等', scores: { F1: 60, F2: 75, F3: 90, E1: 95, E2: 98, E3: 100 } },
          { code: 'OPS-Network', title: '网络技术', description: '网络技术知识，包括TCP/IP、路由、防火墙、负载均衡等', scores: { F1: 55, F2: 70, F3: 85, E1: 90, E2: 95, E3: 98 } },
          { code: 'OPS-Cloud', title: '云服务', description: '云服务平台的使用和管理，包括AWS、阿里云、腾讯云等', scores: { F1: 50, F2: 65, F3: 80, E1: 85, E2: 90, E3: 95 } },
          { code: 'OPS-Container', title: '容器技术', description: '容器技术的使用和管理，包括Docker、Kubernetes等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'OPS-Monitoring', title: '监控告警', description: '系统监控和告警体系，包括Prometheus、Grafana等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'OPS-Security', title: '安全运维', description: '安全运维知识，包括漏洞扫描、入侵检测、安全加固等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'OPS-Automation', title: '自动化运维', description: '运维自动化能力，包括脚本编写、配置管理、CI/CD等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'OPS-Disaster', title: '灾难恢复', description: '灾难恢复和业务连续性管理，包括备份策略、故障演练等', scores: { F1: 35, F2: 50, F3: 65, E1: 75, E2: 85, E3: 90 } },
        ]
      },
      {
        code: 'ALGO',
        name: '算法工程师',
        dimensions: 8,
        ranks: 'F1-F3, E1-E3',
        status: 'active' as const,
        abilityDimensions: [
          { code: 'ALGO-Math', title: '数学基础', description: '数学基础能力，包括线性代数、概率论、微积分等', scores: { F1: 60, F2: 75, F3: 90, E1: 95, E2: 98, E3: 100 } },
          { code: 'ALGO-ML', title: '机器学习', description: '机器学习算法的理解和应用，包括监督学习、无监督学习、深度学习等', scores: { F1: 55, F2: 70, F3: 85, E1: 90, E2: 95, E3: 98 } },
          { code: 'ALGO-Data', title: '数据处理', description: '数据处理和特征工程能力，包括数据清洗、特征提取、数据可视化等', scores: { F1: 50, F2: 65, F3: 80, E1: 85, E2: 90, E3: 95 } },
          { code: 'ALGO-Model', title: '模型训练', description: '模型训练和调优能力，包括超参数调优、模型选择、模型评估等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'ALGO-Deployment', title: '模型部署', description: '模型部署和上线能力，包括模型压缩、推理优化、服务部署等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'ALGO-Domain', title: '领域知识', description: '特定领域的知识和经验，如NLP、CV、推荐系统等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'ALGO-Code', title: '编程能力', description: '编程能力，包括Python、C++等语言的掌握程度', scores: { F1: 50, F2: 65, F3: 80, E1: 85, E2: 90, E3: 95 } },
          { code: 'ALGO-Research', title: '研究能力', description: '算法研究和创新能力，包括论文阅读、实验设计、结果分析等', scores: { F1: 35, F2: 50, F3: 65, E1: 75, E2: 85, E3: 90 } },
        ]
      },
      {
        code: 'ARCH',
        name: '架构设计师',
        dimensions: 8,
        ranks: 'F1-F3, E1-E3',
        status: 'active' as const,
        abilityDimensions: [
          { code: 'ARCH-System', title: '系统架构', description: '系统架构设计能力，包括微服务架构、分布式系统、高可用设计等', scores: { F1: 60, F2: 75, F3: 90, E1: 95, E2: 98, E3: 100 } },
          { code: 'ARCH-Design', title: '设计模式', description: '设计模式的理解和应用，包括创建型、结构型、行为型模式等', scores: { F1: 55, F2: 70, F3: 85, E1: 90, E2: 95, E3: 98 } },
          { code: 'ARCH-Technology', title: '技术选型', description: '技术选型能力，包括框架、语言、数据库、中间件等的选择', scores: { F1: 50, F2: 65, F3: 80, E1: 85, E2: 90, E3: 95 } },
          { code: 'ARCH-Scalability', title: '可扩展性', description: '系统可扩展性设计，包括水平扩展、垂直扩展、数据分片等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'ARCH-Security', title: '安全设计', description: '系统安全设计，包括认证授权、数据加密、漏洞防护等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'ARCH-Performance', title: '性能优化', description: '系统性能优化，包括响应时间、吞吐量、资源利用率等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'ARCH-Documentation', title: '架构文档', description: '架构文档编写能力，包括架构设计文档、技术方案文档等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'ARCH-Communication', title: '沟通能力', description: '技术沟通和团队协作能力，包括需求分析、技术评审、跨团队协作等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
        ]
      },
      {
        code: 'HW',
        name: '硬件工程师',
        dimensions: 8,
        ranks: 'F1-F3, E1-E3',
        status: 'active' as const,
        abilityDimensions: [
          { code: 'HW-Electronics', title: '电子电路', description: '电子电路设计能力，包括模拟电路、数字电路、PCB设计等', scores: { F1: 60, F2: 75, F3: 90, E1: 95, E2: 98, E3: 100 } },
          { code: 'HW-Microcontroller', title: '微控制器', description: '微控制器的使用和编程，包括STM32、Arduino、Raspberry Pi等', scores: { F1: 55, F2: 70, F3: 85, E1: 90, E2: 95, E3: 98 } },
          { code: 'HW-Sensors', title: '传感器技术', description: '传感器技术的理解和应用，包括温度、湿度、压力、加速度等传感器', scores: { F1: 50, F2: 65, F3: 80, E1: 85, E2: 90, E3: 95 } },
          { code: 'HW-Communication', title: '通信协议', description: '硬件通信协议的理解和应用，包括I2C、SPI、UART、CAN等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'HW-Power', title: '电源设计', description: '电源电路设计能力，包括线性电源、开关电源、电池管理等', scores: { F1: 45, F2: 60, F3: 75, E1: 85, E2: 90, E3: 95 } },
          { code: 'HW-EMC', title: '电磁兼容', description: '电磁兼容设计，包括EMI、EMC测试、屏蔽设计等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'HW-CAD', title: 'CAD工具', description: '硬件设计工具的使用，包括Altium Designer、Eagle、KiCad等', scores: { F1: 40, F2: 55, F3: 70, E1: 80, E2: 85, E3: 90 } },
          { code: 'HW-Testing', title: '硬件测试', description: '硬件测试能力，包括功能测试、性能测试、可靠性测试等', scores: { F1: 35, F2: 50, F3: 65, E1: 75, E2: 85, E3: 90 } },
        ]
      },
    ];

    for (const positionData of positions) {
      const existingPosition = await this.positionsRepository.findOne({ where: { code: positionData.code } });
      if (!existingPosition) {
        const position = this.positionsRepository.create({
          code: positionData.code,
          name: positionData.name,
          dimensions: positionData.dimensions,
          ranks: positionData.ranks,
          status: positionData.status,
        });
        const savedPosition = await this.positionsRepository.save(position);

        // 创建能力维度
        for (const dimensionData of positionData.abilityDimensions) {
          const dimension = this.abilityDimensionsRepository.create({
            code: dimensionData.code,
            title: dimensionData.title,
            description: dimensionData.description,
            scores: dimensionData.scores,
            positionId: savedPosition.id,
          });
          await this.abilityDimensionsRepository.save(dimension);
        }
      }
    }
  }
}
