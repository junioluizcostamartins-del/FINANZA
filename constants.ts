
import { Category, Budget } from './types';

export const EXPENSE_CATEGORIES: Category[] = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Outros'
];

export const INCOME_CATEGORIES: Category[] = [
  'Salário',
  'Renda Extra',
  'Outros'
];

export const DEFAULT_BUDGETS: Budget[] = EXPENSE_CATEGORIES.map(cat => ({
  category: cat,
  limit: 0
}));

export const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#3b82f6',    // Blue
  Alimentação: '#f97316', // Orange
  Transporte: '#8b5cf6', // Purple
  Lazer: '#ec4899',      // Pink
  Saúde: '#ef4444',      // Red
  Educação: '#06b6d4',   // Cyan
  Outros: '#64748b',     // Slate
  Salário: '#10b981',    // Emerald
  'Renda Extra': '#f59e0b' // Amber
};
