
import { GoogleGenAI } from "@google/genai";
import { Transaction, Budget, Goal } from '../types';

export const generateFinancialInsight = async (
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const currentMonth = new Date().getMonth();
  const monthTransactions = transactions.filter(t => new Date(t.date).getMonth() === currentMonth);
  
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const prompt = `
    Aja como um especialista em finanças pessoais brasileiro e educador. 
    Analise os seguintes dados financeiros do usuário para o mês atual:
    
    Resumo:
    - Receita Total: R$ ${totalIncome.toFixed(2)}
    - Despesa Total: R$ ${totalExpense.toFixed(2)}
    - Saldo: R$ ${(totalIncome - totalExpense).toFixed(2)}
    
    Orçamentos Definidos:
    ${budgets.filter(b => b.limit > 0).map(b => `- ${b.category}: Limite R$ ${b.limit}`).join('\n')}
    
    Metas Atuais:
    ${goals.map(g => `- ${g.title}: R$ ${g.currentAmount} de R$ ${g.targetAmount}`).join('\n')}
    
    Instruções:
    1. Forneça uma análise curta (máximo 150 palavras).
    2. Seja motivador e educativo.
    3. Identifique se o usuário está gastando muito em alguma categoria ou se está indo bem.
    4. Dê uma dica prática para economizar.
    5. Use um tom amigável.
    6. Formate com negritos em Markdown para facilitar a leitura.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar uma análise no momento. Continue acompanhando seus gastos!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao conectar com a IA. Tente novamente mais tarde.";
  }
};
