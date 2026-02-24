export type AbilityDimension = {
  id: string;
  title: string;
  description: string;
  scores: Record<string, number>; // 不同职级的评分，如 { F1: 60, F2: 70, F3: 80, E1: 85, E2: 90, E3: 95 }
}

export type Position = {
  id: string;
  name: string;
  dimensions: number;
  ranks: string;
  status: 'active' | 'inactive';
  abilityDimensions: AbilityDimension[];
}

export type Rank = {
  level: string;
  name: string;
  years: string;
  description: string;
}

export type RankSystem = {
  F: Rank[];
  E: Rank[];
}

export type AbilityScores = {
  tech: number;
  engineering: number;
  uiux: number;
  communication: number;
  problem: number;
}

export type Employee = {
  id: number;
  name: string;
  position: string;
  rank: string;
  scores: AbilityScores;
}

export type UserRole = 'admin' | 'hr' | 'manager' | 'evaluator' | 'employee' | 'analyst';

export type Permission = {
  id: string;
  name: string;
  description: string;
  type: 'page' | 'action';
  path?: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

export type User = {
  id: number;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email: string;
  permissions: string[];
};
