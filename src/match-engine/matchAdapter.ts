import { Player, PlayerInstructions, PlayerInstructionsForMatch, TargetPriority } from '../types';
import { MATCH_CONSTANTS } from '../utils/constants';
import { MatchPlayer, Team } from './types';

/**
 * Converts database team and player data to the format required by the match engine
 * 
 * @param homeTeamId ID of the home team
 * @param homeTeamName Name of the home team
 * @param homePlayers Players from the home team
 * @param awayTeamId ID of the away team
 * @param awayTeamName Name of the away team
 * @param awayPlayers Players from the away team
 * @returns Object containing properly formatted home and away teams
 */
export const convertToMatchTeams = (
  homeTeamId: string,
  homeTeamName: string,
  homePlayers: Player[],
  awayTeamId: string,
  awayTeamName: string,
  awayPlayers: Player[],
  playerInstructions: PlayerInstructions[],
): { homeTeam: Team, awayTeam: Team } => {
  // Convert home team players to match engine format
  const homeMatchPlayers: MatchPlayer[] = homePlayers.map(player => ({
    id: player.id,
    name: player.name,
    isHome: true,
    
    // Stats affecting gameplay
    throwing: player.throwing,
    catching: player.catching,
    dodging: player.dodging,
    blocking: player.blocking,
    speed: player.speed,
    positionalSense: player.positional_sense,
    teamwork: player.teamwork,
    clutchFactor: player.clutch_factor,
    ...getPlayerInstructions(player.id, playerInstructions)
  }));
  const instructedHomePlayers = homeMatchPlayers.filter(player => playerInstructions.find(i => i.player_id === player.id));
  const selectedHomePlayers = instructedHomePlayers.length === MATCH_CONSTANTS.PLAYERS_PER_TEAM ? instructedHomePlayers : homeMatchPlayers.slice(0, MATCH_CONSTANTS.PLAYERS_PER_TEAM);
  
  // Convert away team players to match engine format
  const awayMatchPlayers: MatchPlayer[] = awayPlayers.map(player => ({
    id: player.id,
    name: player.name,
    isHome: false,
    
    // Stats affecting gameplay
    throwing: player.throwing,
    catching: player.catching,
    dodging: player.dodging,
    blocking: player.blocking,
    speed: player.speed,
    positionalSense: player.positional_sense,
    teamwork: player.teamwork,
    clutchFactor: player.clutch_factor,
    ...getPlayerInstructions(player.id, playerInstructions)
  }));
  const instructedAwayPlayers = awayMatchPlayers.filter(player => playerInstructions.find(i => i.player_id === player.id));
  const selectedAwayPlayers = instructedAwayPlayers.length === MATCH_CONSTANTS.PLAYERS_PER_TEAM ? instructedAwayPlayers : awayMatchPlayers.slice(0, MATCH_CONSTANTS.PLAYERS_PER_TEAM);

  if (selectedAwayPlayers.length < MATCH_CONSTANTS.PLAYERS_PER_TEAM) {
    throw new Error(`Away team must have at least ${MATCH_CONSTANTS.PLAYERS_PER_TEAM} players`);
  }
  if (selectedHomePlayers.length < MATCH_CONSTANTS.PLAYERS_PER_TEAM) {
    throw new Error(`Home team must have at least ${MATCH_CONSTANTS.PLAYERS_PER_TEAM} players`);
  }
  
  // Create team objects with exactly 6 players each
  const homeTeam: Team = {
    id: homeTeamId,
    name: homeTeamName,
    players: selectedHomePlayers,
    isHome: true
  };
  
  const awayTeam: Team = {
    id: awayTeamId,
    name: awayTeamName,
    players: selectedAwayPlayers,
    isHome: false
  };
  
  return { homeTeam, awayTeam };
};

const getPlayerInstructions = (playerId: string, instructions: PlayerInstructions[]): PlayerInstructionsForMatch => {
  const instruction = instructions.find(i => i.player_id === playerId);
  return instruction ? getStrippedDownInstructions(instruction) : generateRandomPlayerInstructions();
};

const generateRandomPlayerInstructions = (): PlayerInstructionsForMatch => {
  return {
    throw_aggression: Math.floor(Math.random() * 100),
    catch_aggression: Math.floor(Math.random() * 100),
    target_priority: 'random' as TargetPriority
  };
};

const getStrippedDownInstructions = (instructions: PlayerInstructions): PlayerInstructionsForMatch => {
  return {
    throw_aggression: instructions.throw_aggression,
    catch_aggression: instructions.catch_aggression,
    target_priority: instructions.target_priority
  };
};
  
