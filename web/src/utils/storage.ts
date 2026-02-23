import type { Position, RankSystem, Employee, User } from '../types';

const STORAGE_KEYS = {
  POSITIONS: 'procam_positions',
  RANKS: 'procam_ranks',
  EMPLOYEES: 'procam_employees',
  EVALUATIONS: 'procam_evaluations',
  USERS: 'procam_users',
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
  if (!storage.get<Position[]>('POSITIONS')) {
    storage.set<Position[]>('POSITIONS', [
      { id: 'FE-001', name: '前端开发工程师', dimensions: 8, ranks: 'F1-F3, E1-E3', status: 'active' },
      { id: 'BE-001', name: '后端开发工程师', dimensions: 9, ranks: 'F1-F3, E1-E3', status: 'active' },
      { id: 'FS-001', name: '全栈开发工程师', dimensions: 10, ranks: 'F2-F3, E1-E3', status: 'active' },
      { id: 'OP-001', name: '运维工程师', dimensions: 8, ranks: 'F1-F3, E1-E2', status: 'active' },
      { id: 'AR-001', name: '架构师', dimensions: 7, ranks: 'E1-E3', status: 'active' }
    ]);
  }

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

  if (!storage.get<User[]>('USERS')) {
    storage.set<User[]>('USERS', [
      {
        id: 1,
        username: '系统管理员',
        password: '系统管理员',
        name: '系统管理员',
        role: 'admin',
        permissions: ['system_config', 'user_manage', 'data_backup', 'all_access']
      },
      {
        id: 2,
        username: 'HR管理员',
        password: 'HR管理员',
        name: 'HR管理员',
        role: 'hr',
        permissions: ['model_config', 'report_view', 'talent_review', 'evaluation_manage']
      },
      {
        id: 3,
        username: '部门管理者',
        password: '部门管理者',
        name: '部门管理者',
        role: 'manager',
        permissions: ['team_view', 'plan_approve', 'evaluation_manage']
      },
      {
        id: 4,
        username: '评估人',
        password: '评估人',
        name: '评估人',
        role: 'evaluator',
        permissions: ['evaluation_submit']
      },
      {
        id: 5,
        username: '张三',
        password: '张三',
        name: '张三',
        role: 'employee',
        permissions: ['personal_view', 'plan_create']
      },
      {
        id: 6,
        username: '数据分析师',
        password: '数据分析师',
        name: '数据分析师',
        role: 'analyst',
        permissions: ['data_analysis', 'report_export', 'all_view']
      }
    ]);
  }
};
