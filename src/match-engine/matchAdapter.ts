import { Player } from '../types';
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
  awayPlayers: Player[]
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
    clutchFactor: player.clutch_factor
  }));
  
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
    clutchFactor: player.clutch_factor
  }));
  
  if (awayPlayers.length < MATCH_CONSTANTS.PLAYERS_PER_TEAM) {
    throw new Error('Away team must have at least 6 players');
  }
  if (homePlayers.length < MATCH_CONSTANTS.PLAYERS_PER_TEAM) {
    throw new Error('Home team must have at least 6 players');
  }
  
  // Create team objects with exactly 6 players each
  const homeTeam: Team = {
    id: homeTeamId,
    name: homeTeamName,
    players: homeMatchPlayers.slice(0, MATCH_CONSTANTS.PLAYERS_PER_TEAM),
    isHome: true
  };
  
  const awayTeam: Team = {
    id: awayTeamId,
    name: awayTeamName,
    players: awayMatchPlayers.slice(0, MATCH_CONSTANTS.PLAYERS_PER_TEAM),
    isHome: false
  };
  
  return { homeTeam, awayTeam };
};
