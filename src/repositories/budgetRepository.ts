import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Team } from '../types';

/**
 * Get a team's current budget
 * 
 * @param teamId The team ID
 * @param token JWT token
 * @returns The team's current budget
 */
export async function getTeamBudget(teamId: string, token: string): Promise<number> {
  const { data, error } = await createClientFromToken(token)
    .from('teams')
    .select('budget')
    .eq('id', teamId)
    .single();
    
  if (error) {
    console.error('Error getting team budget:', error);
    throw new ApiError(500, 'Failed to get team budget');
  }
  
  return data.budget;
}

/**
 * Update a team's budget
 * 
 * @param teamId The team ID
 * @param newBudget The new budget amount
 * @returns Whether the operation was successful
 */
export async function updateTeamBudget(teamId: string, newBudget: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('teams')
    .update({ budget: newBudget })
    .eq('id', teamId);
    
  if (error) {
    console.error('Error updating team budget:', error);
    return false;
  }
  
  return true;
}

/**
 * Calculate the new budget after income and expenses
 * 
 * @param currentBudget The current budget
 * @param income Additional income
 * @param expenses Expenses to deduct
 * @returns The new budget amount
 */
export async function calculateNewBudget(
  currentBudget: number,
  income: number,
  expenses: number
): Promise<number> {
  return currentBudget + income - expenses;
}

/**
 * Update team's financial information after season end
 * 
 * @param teamId The team ID
 * @param stadiumIncome Income from stadium
 * @param wagesPaid Wages paid to players
 * @returns Object with previous budget, income, expenses, and new budget
 */
export async function updateTeamFinances(
  teamId: string,
  stadiumIncome: number,
  wagesPaid: number
): Promise<{
  previousBudget: number;
  stadiumIncome: number;
  wagesPaid: number;
  newBudget: number;
}> {
  // Get current team data
  const { data: team, error: teamError } = await supabaseAdmin
    .from('teams')
    .select('budget')
    .eq('id', teamId)
    .single();
    
  if (teamError || !team) {
    console.error('Error getting team data:', teamError);
    throw new ApiError(500, 'Failed to get team data');
  }
  
  const previousBudget = team.budget;
  const newBudget = previousBudget + stadiumIncome - wagesPaid;
  
  // Update team budget
  const { error: updateError } = await supabaseAdmin
    .from('teams')
    .update({ budget: newBudget })
    .eq('id', teamId);
    
  if (updateError) {
    console.error('Error updating team budget:', updateError);
    throw new ApiError(500, 'Failed to update team budget');
  }
  
  return {
    previousBudget,
    stadiumIncome,
    wagesPaid,
    newBudget
  };
}
