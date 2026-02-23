export type Position = {
  id: string;
  name: string;
  dimensions: number;
  ranks: string;
  status: 'active' | 'inactive';
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

export type User = {
  id: number;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  permissions: string[];
}
