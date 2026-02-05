
export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Moradia' 
  | 'Alimentação' 
  | 'Transporte' 
  | 'Lazer' 
  | 'Saúde' 
  | 'Educação' 
  | 'Salário'
  | 'Renda Extra'
  | 'Outros';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  date: string;
  description: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  darkMode: boolean;
  currentUser: User | null;
}

export enum View {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  BUDGET = 'budget',
  GOALS = 'goals',
  PROFILE = 'profile',
  AUTH = 'auth'
}
