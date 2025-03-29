import { createClientFromToken, supabaseAdmin } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { EndSeasonResponse, Fixture, PlayMatchResponse, Player } from '../types';
import leagueService from './league.service';
import { PLAYER_STATUS } from '../utils/constants';

class MatchService {
  /**
   * Play the next scheduled match for a game
   * 
   * @param gameId The game ID
   * @param token JWT token for authentication
   * @returns The match result
   */
  async playNextMatch(gameId: string, token: string): Promise<PlayMatchResponse> {
    try {
      // Get the current game to check the match day
      const { data: game, error: gameError } = await createClientFromToken(token)
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
        
      if (gameError || !game) {
        console.error('Error getting game:', gameError);
        throw new ApiError(404, 'Game not found');
      }
      
      // Check if game is in regular season
      if (game.game_stage !== 'regular_season') {
        throw new ApiError(400, `Cannot play match. Game is in ${game.game_stage} stage.`);
      }
      
      const currentMatchDay = game.match_day || 0;
      const nextMatchDay = currentMatchDay + 1;
      
      // Get all fixtures for the next match day
      const { data: fixtures, error: fixturesError } = await createClientFromToken(token)
        .from('fixtures')
        .select('*')
        .eq('game_id', gameId)
        .eq('season', game.season)
        .eq('match_day', nextMatchDay)
        .eq('status', 'scheduled');
        
      if (fixturesError) {
        console.error('Error getting next fixtures:', fixturesError);
        throw new ApiError(500, 'Failed to get next fixtures');
      }
      
      if (!fixtures || fixtures.length === 0) {
        throw new ApiError(404, 'No more fixtures scheduled for this season');
      }
      
      // Get user's team
      const { data: userTeam, error: userTeamError } = await createClientFromToken(token)
        .from('teams')
        .select('*')
        .eq('game_id', gameId)
        .single();
        
      if (userTeamError || !userTeam) {
        console.error('Error getting user team:', userTeamError);
        throw new ApiError(404, 'User team not found');
      }
      
      // Find the user's fixture
      const userFixture = fixtures.find(fixture => 
        fixture.home_team_id === userTeam.id || fixture.away_team_id === userTeam.id
      );
      
      if (!userFixture) {
        throw new ApiError(404, 'No fixture found for user team');
      }
      
      // Find the other fixture (between the two teams not playing against the user)
      const otherFixture = fixtures.find(fixture => 
        fixture.home_team_id !== userTeam.id && fixture.away_team_id !== userTeam.id
      );
      
      if (!otherFixture) {
        throw new ApiError(404, 'No fixture found for other teams');
      }
      
      // Generate random scores for user's fixture
      const totalPoints = 3;
      const userHomeTeam = userFixture.home_team_id === userTeam.id;
      const userHomeScore = Math.floor(Math.random() * (totalPoints + 1)); // 0 to 3
      const userAwayScore = totalPoints - userHomeScore; // Remaining points
      
      // Update user's fixture with the result
      const { data: updatedUserFixture, error: userUpdateError } = await supabaseAdmin
        .from('fixtures')
        .update({
          home_score: userHomeScore,
          away_score: userAwayScore,
          status: 'completed',
          played_at: new Date().toISOString()
        })
        .eq('id', userFixture.id)
        .select()
        .single();
        
      if (userUpdateError) {
        console.error('Error updating user fixture:', userUpdateError);
        throw new ApiError(500, 'Failed to update user fixture with match result');
      }
      
      // Generate random scores for other fixture
      const otherHomeScore = Math.floor(Math.random() * (totalPoints + 1)); // 0 to 3
      const otherAwayScore = totalPoints - otherHomeScore; // Remaining points
      
      // Update other fixture with the result
      const { error: otherUpdateError } = await supabaseAdmin
        .from('fixtures')
        .update({
          home_score: otherHomeScore,
          away_score: otherAwayScore,
          status: 'completed',
          played_at: new Date().toISOString()
        })
        .eq('id', otherFixture.id);
        
      if (otherUpdateError) {
        console.error('Error updating other fixture:', otherUpdateError);
        throw new ApiError(500, 'Failed to update other fixture with match result');
      }
      
      // Update the game's match day
      const { error: gameUpdateError } = await supabaseAdmin
        .from('games')
        .update({ match_day: nextMatchDay })
        .eq('id', gameId);
        
      if (gameUpdateError) {
        console.error('Error updating game match day:', gameUpdateError);
        throw new ApiError(500, 'Failed to update game match day');
      }
      
      // Get team names for the response
      const { data: homeTeam, error: homeTeamError } = await createClientFromToken(token)
        .from(userFixture.home_team_type === 'user' ? 'teams' : 'opponent_teams')
        .select('name')
        .eq('id', userFixture.home_team_id)
        .single();
        
      if (homeTeamError) {
        console.error('Error getting home team:', homeTeamError);
      }
      
      const { data: awayTeam, error: awayTeamError } = await createClientFromToken(token)
        .from(userFixture.away_team_type === 'user' ? 'teams' : 'opponent_teams')
        .select('name')
        .eq('id', userFixture.away_team_id)
        .single();
        
      if (awayTeamError) {
        console.error('Error getting away team:', awayTeamError);
      }
      
      // Get other fixture team names for the response
      const { data: otherHomeTeam } = await createClientFromToken(token)
        .from('opponent_teams')
        .select('name')
        .eq('id', otherFixture.home_team_id)
        .single();
      
      const { data: otherAwayTeam } = await createClientFromToken(token)
        .from('opponent_teams')
        .select('name')
        .eq('id', otherFixture.away_team_id)
        .single();
      
      return {
        success: true,
        message: 'Match played successfully',
        match: {
          ...updatedUserFixture,
          home_team_name: homeTeam?.name || 'Unknown Team',
          away_team_name: awayTeam?.name || 'Unknown Team'
        },
        match_day: nextMatchDay,
        other_match: {
          id: otherFixture.id,
          game_id: otherFixture.game_id,
          home_team_id: otherFixture.home_team_id,
          away_team_id: otherFixture.away_team_id,
          home_team_type: otherFixture.home_team_type,
          away_team_type: otherFixture.away_team_type,
          home_team_name: otherHomeTeam?.name || 'Unknown Team',
          away_team_name: otherAwayTeam?.name || 'Unknown Team',
          home_score: otherHomeScore,
          away_score: otherAwayScore,
          match_day: otherFixture.match_day,
          season: otherFixture.season,
          status: 'completed',
          played_at: new Date().toISOString(),
          created_at: otherFixture.created_at
        }
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in playNextMatch:', error);
      throw new ApiError(500, 'Failed to play next match');
    }
  }

  /**
   * End the current season, handle promotions, and prepare for the next season
   * 
   * @param gameId The game ID
   * @param token JWT token for authentication
   * @returns The end season result
   */
  async endSeason(gameId: string, token: string): Promise<EndSeasonResponse> {
    try {
      // Get the current game
      const { data: game, error: gameError } = await createClientFromToken(token)
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
        
      if (gameError || !game) {
        console.error('Error getting game:', gameError);
        throw new ApiError(404, 'Game not found');
      }
      
      const currentSeason = game.season;
      
      // Check if all fixtures for the current season are completed
      const { data: fixtures, error: fixturesError } = await createClientFromToken(token)
        .from('fixtures')
        .select('*')
        .eq('game_id', gameId)
        .eq('season', currentSeason);
        
      if (fixturesError) {
        console.error('Error getting fixtures:', fixturesError);
        throw new ApiError(500, 'Failed to get fixtures');
      }
      
      const incompleteFixtures = fixtures?.filter(fixture => fixture.status !== 'completed') || [];
      
      if (incompleteFixtures.length > 0) {
        throw new ApiError(400, `Cannot end season. ${incompleteFixtures.length} fixtures are not completed.`);
      }
      
      // Get user's team
      const { data: userTeam, error: userTeamError } = await createClientFromToken(token)
        .from('teams')
        .select('*')
        .eq('game_id', gameId)
        .single();
        
      if (userTeamError || !userTeam) {
        console.error('Error getting user team:', userTeamError);
        throw new ApiError(404, 'User team not found');
      }
      
      // Use the league service to get the current league table
      const leagueData = await leagueService.getLeague(gameId, token, currentSeason);
      const leagueTable = leagueData.table;
      
      // Find user's team position in the league table
      const userTeamEntry = leagueTable.find(entry => entry.team_id === userTeam.id);
      if (!userTeamEntry) {
        throw new ApiError(500, 'Failed to find user team in league table');
      }
      
      // Get user's position in the league
      const userPosition = leagueTable.findIndex(entry => entry.team_id === userTeam.id) + 1;
      
      // Check if user is in top 2
      let isPromoted = userPosition <= 2;
      
      // If user is tied for 2nd place, check head-to-head results
      if (!isPromoted && userPosition > 2) {
        const userPoints = userTeamEntry.points;
        const secondPlacePoints = leagueTable[1].points;
        
        // Check if user is tied with 2nd place
        if (userPoints === secondPlacePoints) {
          // Get the team(s) tied with user
          const tiedTeams = leagueTable.filter(entry => 
            entry.team_id !== userTeam.id && entry.points === userPoints
          );
          
          // If there are multiple teams tied for 2nd place, give user the benefit of the doubt
          if (tiedTeams.length > 1) {
            isPromoted = true;
          } else if (tiedTeams.length === 1) {
            // Check head-to-head results with the tied team
            const tiedTeamId = tiedTeams[0].team_id;
            
            // Find fixtures between user team and tied team
            const headToHeadFixtures = fixtures?.filter(fixture => 
              (fixture.home_team_id === userTeam.id && fixture.away_team_id === tiedTeamId) ||
              (fixture.home_team_id === tiedTeamId && fixture.away_team_id === userTeam.id)
            );
            
            // Calculate head-to-head points
            let userHeadToHeadPoints = 0;
            let tiedTeamHeadToHeadPoints = 0;
            
            headToHeadFixtures?.forEach(fixture => {
              if (fixture.home_team_id === userTeam.id) {
                userHeadToHeadPoints += fixture.home_score || 0;
                tiedTeamHeadToHeadPoints += fixture.away_score || 0;
              } else {
                userHeadToHeadPoints += fixture.away_score || 0;
                tiedTeamHeadToHeadPoints += fixture.home_score || 0;
              }
            });
            
            // User wins tie-breaker if they have more head-to-head points
            isPromoted = userHeadToHeadPoints >= tiedTeamHeadToHeadPoints;
          }
        }
      }
      
      const isChampion = userPosition === 1;
      
      // If not promoted, end the game
      if (!isPromoted) {
        // Update game to end it
        const { error: endGameError } = await supabaseAdmin
          .from('games')
          .update({ status: 'completed' })
          .eq('id', gameId);
          
        if (endGameError) {
          console.error('Error ending game:', endGameError);
          throw new ApiError(500, 'Failed to end game');
        }
        
        return {
          success: true,
          message: 'Season ended. Your team did not finish in the top 2. Game over!',
          game_ended: true,
          season_completed: currentSeason,
          promoted: false
        };
      }
      
      // If season 5 and promoted, they've won the game
      if (currentSeason === 5) {
        // Update game to end it as a win
        const { error: winGameError } = await supabaseAdmin
          .from('games')
          .update({ status: 'completed' })
          .eq('id', gameId);
          
        if (winGameError) {
          console.error('Error ending game as win:', winGameError);
          throw new ApiError(500, 'Failed to end game as win');
        }
        
        return {
          success: true,
          message: 'Congratulations! You\'ve completed all 5 seasons and won the game!',
          game_ended: true,
          season_completed: currentSeason,
          promoted: true,
          champion: isChampion
        };
      }
      
      // Game continues - prepare for next season
      const nextSeason = currentSeason + 1;
      
      // Get the other promoted team (the other team in top 2 that isn't the user's team)
      const otherPromotedTeamEntry = leagueTable
        .filter(entry => entry.team_id !== userTeam.id && entry.team_type === 'opponent')
        .find((_, index) => index < 2);
      
      // Calculate stadium income (based on training facility level)
      const stadiumIncome = 50 + userTeam.training_facility_level * 50;
      
      // Query to find team players for the game
      const { data: players, error } = await createClientFromToken(token)
        .from('players')
        .select('*')
        .eq('game_id', userTeam.game_id)
        .eq('status', PLAYER_STATUS.TEAM)
        .order('tier', { ascending: false });
        
      if (error) {
        console.error('Error getting players:', error);
        throw new ApiError(500, 'Failed to get players');
      }
      
      // Calculate wages based on tiers
      const wagesPaid = players?.reduce((total, player) => {
        return total + (player.tier * 2);
      }, 0) || 0;
      
      // Update budget
      const previousBudget = userTeam.budget;
      const newBudget = previousBudget + stadiumIncome - wagesPaid;
      
      // If the other promoted team exists, add it to the next season
      if (otherPromotedTeamEntry) {
        // Add the other promoted team to the next season
        const { error: promotedTeamError } = await supabaseAdmin
          .from('season_opponent_teams')
          .insert({
            game_id: gameId,
            season: nextSeason,
            opponent_team_id: otherPromotedTeamEntry.team_id
          });
          
        if (promotedTeamError) {
          console.error('Error adding promoted team to next season:', promotedTeamError);
          throw new ApiError(500, 'Failed to add promoted team to next season');
        }
      }
      
      // Update game for next season
      const { error: updateGameError } = await supabaseAdmin
        .from('games')
        .update({
          season: nextSeason,
          match_day: 0,
          game_stage: 'pre_season'
        })
        .eq('id', gameId);
        
      if (updateGameError) {
        console.error('Error updating game for next season:', updateGameError);
        throw new ApiError(500, 'Failed to update game for next season');
      }
      
      // Update budget
      const { error: updateBudgetError } = await supabaseAdmin
        .from('teams')
        .update({
          budget: newBudget
        })
        .eq('id', userTeam.id);
        
      if (updateBudgetError) {
        console.error('Error updating budget:', updateBudgetError);
        throw new ApiError(500, 'Failed to update budget');
      }
      
      return {
        success: true,
        message: `Season ${currentSeason} completed! Your team ${isChampion ? 'won the championship' : 'was promoted'} and advances to season ${nextSeason}.`,
        game_ended: false,
        season_completed: currentSeason,
        next_season: nextSeason,
        promoted: true,
        champion: isChampion,
        budget_update: {
          previous: previousBudget,
          stadium_income: stadiumIncome,
          wages_paid: wagesPaid,
          new_budget: newBudget
        },
        promoted_team: otherPromotedTeamEntry ? {
          id: otherPromotedTeamEntry.team_id,
          name: otherPromotedTeamEntry.team_name
        } : undefined
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in endSeason:', error);
      throw new ApiError(500, 'Failed to end season');
    }
  }
}

export default new MatchService();
