import type { Position, RankSystem, Employee, User, Role, Permission } from '../types';

const STORAGE_KEYS = {
  POSITIONS: 'procam_positions',
  RANKS: 'procam_ranks',
  EMPLOYEES: 'procam_employees',
  EVALUATIONS: 'procam_evaluations',
  USERS: 'procam_users',
  ROLES: 'procam_roles',
  PERMISSIONS: 'procam_permissions',
  CURRENT_USER: 'procam_current_user'
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;

export const storage = {
  get<T>(key: StorageKey): T | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS[key]);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  set<T>(key: StorageKey, value: T): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  remove(key: StorageKey): boolean {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  clear(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

export const initDefaultData = () => {
  // 强制重新初始化数据，确保所有岗位都有能力维度
  storage.set<Position[]>('POSITIONS', [
    {
      id: 'FE-001',
      name: 'Web前端工程师',
      dimensions: 8,
      ranks: 'F1-F3, E1-E3',
      status: 'active',
      abilityDimensions: [
        {
          id: 'fe-1',
          title: 'JS/TS语言深度',
          description: '掌握JavaScript和TypeScript的核心概念、语法特性和最佳实践',
          scores: { F1: 60, F2: 70, F3: 80, E1: 85, E2: 90, E3: 95 }
        },
        {
          id: 'fe-2',
          title: '框架和生态',
          description: '熟悉React、Vue等前端框架及其生态系统',
          scores: { F1: 55, F2: 65, F3: 75, E1: 82, E2: 88, E3: 93 }
        },
        {
          id: 'fe-3',
          title: '前端工程化',
          description: '掌握前端构建工具、模块化、代码规范等工程化实践',
          scores: { F1: 50, F2: 60, F3: 70, E1: 80, E2: 86, E3: 92 }
        },
        {
          id: 'fe-4',
          title: 'UI/UX设计理解',
          description: '理解用户界面设计原则和用户体验设计理念',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'fe-5',
          title: '性能优化',
          description: '掌握前端性能优化的方法和技巧',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        },
        {
          id: 'fe-6',
          title: '跨端开发',
          description: '了解React Native、Flutter等跨端开发技术',
          scores: { F1: 35, F2: 45, F3: 55, E1: 65, E2: 75, E3: 85 }
        },
        {
          id: 'fe-7',
          title: '网络与安全',
          description: '理解HTTP、HTTPS、CORS等网络知识和前端安全最佳实践',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'fe-8',
          title: '团队协作',
          description: '具备良好的团队沟通和协作能力',
          scores: { F1: 50, F2: 60, F3: 70, E1: 75, E2: 80, E3: 85 }
        }
      ]
    },
    {
      id: 'BE-001',
      name: 'Java后端工程师',
      dimensions: 8,
      ranks: 'F1-F3, E1-E3',
      status: 'active',
      abilityDimensions: [
        {
          id: 'be-1',
          title: 'Java语言基础',
          description: '掌握Java核心概念、语法特性和最佳实践',
          scores: { F1: 60, F2: 70, F3: 80, E1: 85, E2: 90, E3: 95 }
        },
        {
          id: 'be-2',
          title: 'Spring生态',
          description: '熟悉Spring Boot、Spring Cloud等Spring生态系统',
          scores: { F1: 55, F2: 65, F3: 75, E1: 82, E2: 88, E3: 93 }
        },
        {
          id: 'be-3',
          title: '数据库技术',
          description: '掌握MySQL、Oracle等数据库的设计和优化',
          scores: { F1: 50, F2: 60, F3: 70, E1: 80, E2: 86, E3: 92 }
        },
        {
          id: 'be-4',
          title: '微服务架构',
          description: '理解微服务架构设计原则和实践',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        },
        {
          id: 'be-5',
          title: '性能调优',
          description: '掌握JVM调优、数据库优化等性能调优技巧',
          scores: { F1: 35, F2: 45, F3: 55, E1: 65, E2: 75, E3: 85 }
        },
        {
          id: 'be-6',
          title: 'DevOps实践',
          description: '了解CI/CD、容器化等DevOps实践',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'be-7',
          title: '安全编程',
          description: '掌握后端安全编程的最佳实践',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        },
        {
          id: 'be-8',
          title: '系统设计',
          description: '具备系统设计和架构能力',
          scores: { F1: 35, F2: 45, F3: 55, E1: 65, E2: 75, E3: 85 }
        }
      ]
    },
    {
      id: 'FS-001',
      name: '全栈工程师',
      dimensions: 8,
      ranks: 'F1-F3, E1-E3',
      status: 'active',
      abilityDimensions: [
        {
          id: 'fs-1',
          title: '前端技术栈',
          description: '掌握前端开发的核心技术和框架',
          scores: { F1: 55, F2: 65, F3: 75, E1: 80, E2: 85, E3: 90 }
        },
        {
          id: 'fs-2',
          title: '后端技术栈',
          description: '掌握后端开发的核心技术和框架',
          scores: { F1: 55, F2: 65, F3: 75, E1: 80, E2: 85, E3: 90 }
        },
        {
          id: 'fs-3',
          title: '数据库设计',
          description: '掌握数据库设计和优化技巧',
          scores: { F1: 50, F2: 60, F3: 70, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'fs-4',
          title: '系统架构',
          description: '理解系统架构设计原则和实践',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 85 }
        },
        {
          id: 'fs-5',
          title: 'DevOps技能',
          description: '掌握CI/CD、容器化等DevOps技能',
          scores: { F1: 45, F2: 55, F3: 65, E1: 72, E2: 78, E3: 84 }
        },
        {
          id: 'fs-6',
          title: '项目管理',
          description: '具备基本的项目管理能力',
          scores: { F1: 40, F2: 50, F3: 60, E1: 65, E2: 72, E3: 78 }
        },
        {
          id: 'fs-7',
          title: '问题解决',
          description: '具备较强的问题分析和解决能力',
          scores: { F1: 50, F2: 60, F3: 70, E1: 75, E2: 80, E3: 85 }
        },
        {
          id: 'fs-8',
          title: '学习能力',
          description: '具备快速学习新技术的能力',
          scores: { F1: 55, F2: 65, F3: 75, E1: 80, E2: 85, E3: 90 }
        }
      ]
    },
    {
      id: 'OP-001',
      name: '运维工程师',
      dimensions: 8,
      ranks: 'F1-F3, E1-E3',
      status: 'active',
      abilityDimensions: [
        {
          id: 'op-1',
          title: '系统运维',
          description: '掌握Linux、Windows等系统的运维技能',
          scores: { F1: 60, F2: 70, F3: 80, E1: 85, E2: 90, E3: 95 }
        },
        {
          id: 'op-2',
          title: '网络技术',
          description: '掌握网络协议、网络设备配置等网络技术',
          scores: { F1: 55, F2: 65, F3: 75, E1: 82, E2: 88, E3: 93 }
        },
        {
          id: 'op-3',
          title: '容器技术',
          description: '熟悉Docker、Kubernetes等容器技术',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'op-4',
          title: '监控告警',
          description: '掌握监控系统的搭建和告警配置',
          scores: { F1: 50, F2: 60, F3: 70, E1: 80, E2: 86, E3: 92 }
        },
        {
          id: 'op-5',
          title: '安全运维',
          description: '掌握系统安全、网络安全等安全运维技能',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'op-6',
          title: '自动化运维',
          description: '掌握Shell、Python等自动化脚本编写',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        },
        {
          id: 'op-7',
          title: '故障处理',
          description: '具备快速定位和处理故障的能力',
          scores: { F1: 55, F2: 65, F3: 75, E1: 80, E2: 85, E3: 90 }
        },
        {
          id: 'op-8',
          title: '灾备方案',
          description: '理解灾难备份和恢复方案的设计',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        }
      ]
    },
    {
      id: 'AL-001',
      name: '算法工程师',
      dimensions: 8,
      ranks: 'F1-F3, E1-E3',
      status: 'active',
      abilityDimensions: [
        {
          id: 'al-1',
          title: '算法基础',
          description: '掌握数据结构、算法设计与分析的基础理论',
          scores: { F1: 60, F2: 70, F3: 80, E1: 85, E2: 90, E3: 95 }
        },
        {
          id: 'al-2',
          title: '机器学习',
          description: '熟悉机器学习算法和模型训练方法',
          scores: { F1: 55, F2: 65, F3: 75, E1: 82, E2: 88, E3: 93 }
        },
        {
          id: 'al-3',
          title: '深度学习',
          description: '了解深度学习框架和模型',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'al-4',
          title: '数据处理',
          description: '掌握大数据处理和分析技术',
          scores: { F1: 50, F2: 60, F3: 70, E1: 80, E2: 86, E3: 92 }
        },
        {
          id: 'al-5',
          title: '模型评估',
          description: '掌握模型评估指标和方法',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'al-6',
          title: '编程能力',
          description: '具备较强的编程能力，熟悉Python等语言',
          scores: { F1: 55, F2: 65, F3: 75, E1: 80, E2: 85, E3: 90 }
        },
        {
          id: 'al-7',
          title: '领域知识',
          description: '具备相关业务领域的知识',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        },
        {
          id: 'al-8',
          title: '创新能力',
          description: '具备算法创新和优化的能力',
          scores: { F1: 35, F2: 45, F3: 55, E1: 65, E2: 75, E3: 85 }
        }
      ]
    },
    {
      id: 'AR-001',
      name: '架构设计师',
      dimensions: 8,
      ranks: 'F1-F3, E1-E3',
      status: 'active',
      abilityDimensions: [
        {
          id: 'ar-1',
          title: '架构设计',
          description: '具备系统架构设计和规划能力',
          scores: { F1: 50, F2: 60, F3: 70, E1: 80, E2: 88, E3: 95 }
        },
        {
          id: 'ar-2',
          title: '技术选型',
          description: '能够根据业务需求进行技术选型',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 83, E3: 90 }
        },
        {
          id: 'ar-3',
          title: '性能优化',
          description: '掌握系统性能优化的方法和技巧',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        },
        {
          id: 'ar-4',
          title: '安全性',
          description: '理解系统安全设计原则和最佳实践',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'ar-5',
          title: '可扩展性',
          description: '设计具有良好可扩展性的系统架构',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        },
        {
          id: 'ar-6',
          title: '技术前瞻性',
          description: '了解技术发展趋势，具备技术前瞻性',
          scores: { F1: 35, F2: 45, F3: 55, E1: 65, E2: 75, E3: 85 }
        },
        {
          id: 'ar-7',
          title: '团队管理',
          description: '具备技术团队管理能力',
          scores: { F1: 30, F2: 40, F3: 50, E1: 60, E2: 70, E3: 80 }
        },
        {
          id: 'ar-8',
          title: '沟通能力',
          description: '具备良好的技术沟通和表达能力',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        }
      ]
    },
    {
      id: 'HW-001',
      name: '硬件工程师',
      dimensions: 8,
      ranks: 'F1-F3, E1-E3',
      status: 'active',
      abilityDimensions: [
        {
          id: 'hw-1',
          title: '电路设计',
          description: '掌握电路设计原理和方法',
          scores: { F1: 60, F2: 70, F3: 80, E1: 85, E2: 90, E3: 95 }
        },
        {
          id: 'hw-2',
          title: 'PCB设计',
          description: '熟悉PCB设计工具和流程',
          scores: { F1: 55, F2: 65, F3: 75, E1: 82, E2: 88, E3: 93 }
        },
        {
          id: 'hw-3',
          title: '嵌入式系统',
          description: '了解嵌入式系统开发和调试',
          scores: { F1: 50, F2: 60, F3: 70, E1: 80, E2: 86, E3: 92 }
        },
        {
          id: 'hw-4',
          title: '信号完整性',
          description: '理解信号完整性和电源完整性',
          scores: { F1: 45, F2: 55, F3: 65, E1: 75, E2: 82, E3: 88 }
        },
        {
          id: 'hw-5',
          title: '硬件测试',
          description: '掌握硬件测试方法和工具',
          scores: { F1: 50, F2: 60, F3: 70, E1: 80, E2: 86, E3: 92 }
        },
        {
          id: 'hw-6',
          title: '热设计',
          description: '了解散热设计和热管理',
          scores: { F1: 40, F2: 50, F3: 60, E1: 70, E2: 80, E3: 88 }
        },
        {
          id: 'hw-7',
          title: '成本控制',
          description: '具备硬件成本控制能力',
          scores: { F1: 35, F2: 45, F3: 55, E1: 65, E2: 75, E3: 85 }
        },
        {
          id: 'hw-8',
          title: '项目管理',
          description: '具备硬件项目管理能力',
          scores: { F1: 30, F2: 40, F3: 50, E1: 60, E2: 70, E3: 80 }
        }
      ]
    }
  ]);

  if (!storage.get<RankSystem>('RANKS')) {
    storage.set<RankSystem>('RANKS', {
      F: [
        { level: 'F1', name: '初级', years: '0-1年', description: '能在指导下完成简单任务' },
        { level: 'F2', name: '中级', years: '1-3年', description: '能独立完成常规任务' },
        { level: 'F3', name: '高级', years: '3-5年', description: '能解决复杂问题' }
      ],
      E: [
        { level: 'E1', name: '初级专家', years: '5-8年', description: '能主导模块/系统设计' },
        { level: 'E2', name: '高级专家', years: '8-12年', description: '能主导跨系统技术方案' },
        { level: 'E3', name: '资深专家', years: '12年+', description: '能制定技术战略方向' }
      ]
    });
  }

  if (!storage.get<Employee[]>('EMPLOYEES')) {
    storage.set<Employee[]>('EMPLOYEES', [
      { id: 1, name: '张三', position: 'FE-001', rank: 'F3', scores: { tech: 82, engineering: 78, uiux: 75, communication: 85, problem: 80 } },
      { id: 2, name: '李四', position: 'BE-001', rank: 'F2', scores: { tech: 75, engineering: 80, uiux: 70, communication: 78, problem: 82 } },
      { id: 3, name: '王五', position: 'FS-001', rank: 'E1', scores: { tech: 88, engineering: 85, uiux: 80, communication: 90, problem: 87 } }
    ]);
  }

  if (!storage.get<Permission[]>('PERMISSIONS')) {
    storage.set<Permission[]>('PERMISSIONS', [
      { id: 'system_config', name: '系统配置', description: '系统级配置权限', type: 'action' },
      { id: 'user_manage', name: '用户管理', description: '管理用户和角色', type: 'action' },
      { id: 'data_backup', name: '数据备份', description: '数据备份和恢复', type: 'action' },
      { id: 'all_access', name: '全权限', description: '所有权限', type: 'action' },
      { id: 'model_config', name: '模型配置', description: '能力模型配置', type: 'action' },
      { id: 'report_view', name: '报表查看', description: '查看分析报表', type: 'action' },
      { id: 'talent_review', name: '人才评审', description: '人才评审流程', type: 'action' },
      { id: 'evaluation_manage', name: '评估管理', description: '管理评估流程', type: 'action' },
      { id: 'team_view', name: '团队查看', description: '查看团队数据', type: 'action' },
      { id: 'plan_approve', name: '计划审批', description: '审批能力提升计划', type: 'action' },
      { id: 'evaluation_submit', name: '提交评估', description: '提交评估结果', type: 'action' },
      { id: 'personal_view', name: '个人查看', description: '查看个人数据', type: 'action' },
      { id: 'plan_create', name: '创建计划', description: '创建能力提升计划', type: 'action' },
      { id: 'data_analysis', name: '数据分析', description: '分析能力数据', type: 'action' },
      { id: 'report_export', name: '导出报表', description: '导出分析报表', type: 'action' },
      { id: 'all_view', name: '全部查看', description: '查看所有数据', type: 'action' },
      { id: 'page_home', name: '首页', description: '访问首页', type: 'page', path: '/' },
      { id: 'page_positions', name: '岗位管理', description: '访问岗位管理页面', type: 'page', path: '/positions' },
      { id: 'page_ranks', name: '职级配置', description: '访问职级配置页面', type: 'page', path: '/ranks' },
      { id: 'page_personal', name: '个人能力', description: '访问个人能力页面', type: 'page', path: '/personal' },
      { id: 'page_team', name: '团队能力', description: '访问团队能力页面', type: 'page', path: '/team' },
      { id: 'page_roles', name: '角色管理', description: '访问角色管理页面', type: 'page', path: '/roles' }
    ]);
  }

  if (!storage.get<Role[]>('ROLES')) {
    storage.set<Role[]>('ROLES', [
      {
        id: 'admin',
        name: '系统管理员',
        description: '系统级管理员，拥有所有权限',
        permissions: ['system_config', 'user_manage', 'data_backup', 'all_access', 'page_home', 'page_positions', 'page_ranks', 'page_personal', 'page_team', 'page_roles']
      },
      {
        id: 'hr',
        name: 'HR管理员',
        description: '人力资源管理员，负责模型配置和人才评审',
        permissions: ['model_config', 'report_view', 'talent_review', 'evaluation_manage', 'page_home', 'page_positions', 'page_ranks', 'page_personal', 'page_team', 'page_roles']
      },
      {
        id: 'manager',
        name: '部门管理者',
        description: '部门管理者，负责团队管理和评估',
        permissions: ['team_view', 'plan_approve', 'evaluation_manage', 'page_home', 'page_personal', 'page_team']
      },
      {
        id: 'employee',
        name: '工程师',
        description: '普通工程师，可查看个人数据',
        permissions: ['personal_view', 'plan_create', 'page_home', 'page_personal']
      }
    ]);
  }

  if (!storage.get<User[]>('USERS')) {
    storage.set<User[]>('USERS', [
      {
        id: 1,
        username: '系统管理员',
        password: '系统管理员',
        name: '系统管理员',
        role: 'admin',
        email: 'admin@example.com',
        permissions: ['system_config', 'user_manage', 'data_backup', 'all_access']
      },
      {
        id: 2,
        username: 'HR管理员',
        password: 'HR管理员',
        name: 'HR管理员',
        role: 'hr',
        email: 'hr@example.com',
        permissions: ['model_config', 'report_view', 'talent_review', 'evaluation_manage']
      },
      {
        id: 3,
        username: '部门管理者',
        password: '部门管理者',
        name: '部门管理者',
        role: 'manager',
        email: 'manager@example.com',
        permissions: ['team_view', 'plan_approve', 'evaluation_manage']
      },
      {
        id: 4,
        username: '评估人',
        password: '评估人',
        name: '评估人',
        role: 'evaluator',
        email: 'evaluator@example.com',
        permissions: ['evaluation_submit']
      },
      {
        id: 5,
        username: '张三',
        password: '张三',
        name: '张三',
        role: 'employee',
        email: 'zhangsan@example.com',
        permissions: ['personal_view', 'plan_create']
      },
      {
        id: 6,
        username: '数据分析师',
        password: '数据分析师',
        name: '数据分析师',
        role: 'analyst',
        email: 'analyst@example.com',
        permissions: ['data_analysis', 'report_export', 'all_view']
      }
    ]);
  }
};
