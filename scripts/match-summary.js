const fs = require('fs');

/**
 * Generate a summary of a dodgeball match from a JSON file
 * Logs when games start and each turn (except prepare actions)
 * Each line contains the name of the players involved, whether they are home or away players,
 * the action result, and the target player for throws
 * 
 * @param {string} filePath - Path to the JSON file containing match data
 */
function generateMatchSummary(filePath) {
  try {
    // Read and parse the JSON file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.success || !data.simulated_match) {
      console.log('Invalid match data format');
      return;
    }
    
    const match = data.simulated_match;
    const homeTeam = match.homeTeam;
    const awayTeam = match.awayTeam;
    
    // Create player lookup maps for quick access
    const playerMap = {};
    
    // Add home team players to map
    homeTeam.players.forEach(player => {
      playerMap[player.id] = {
        name: player.name,
        team: homeTeam.name,
        isHome: true
      };
    });
    
    // Add away team players to map
    awayTeam.players.forEach(player => {
      playerMap[player.id] = {
        name: player.name,
        team: awayTeam.name,
        isHome: false
      };
    });
    
    console.log(`Match Summary: ${homeTeam.name} vs ${awayTeam.name}`);
    console.log('------------------------------------------------------');
    
    // Process each game
    match.games.forEach(game => {
      console.log(`Game ${game.gameNumber} starts`);
      
      // Process each round in the game
      game.rounds.forEach((round, roundIndex) => {
        // Process each turn in the round
        round.turns.forEach(turn => {
          // Skip "prepare" actions as requested
          if (turn.action === 'prepare') {
            return;
          }
          
          // Get the player info
          const player = playerMap[turn.playerId];
          if (!player) {
            return; // Skip if player not found
          }
          
          const teamSide = player.isHome ? 'home' : 'away';
          
          // Handle different action types
          if (turn.action === 'throw') {
            // Get target player information for throws
            let targetPlayerInfo = '';
            
            if (turn.actionResult === 'caught') {
              // For caught balls, find who caught it
              // We need to look at the endTurnGameStateUpdate to find who has the ball now
              const ballId = turn.ballId;
              let catcherPlayerId = null;
              
              // Look through the playerState to find who has the ball
              if (turn.endTurnGameStateUpdate && turn.endTurnGameStateUpdate.playerState) {
                for (const [pid, state] of Object.entries(turn.endTurnGameStateUpdate.playerState)) {
                  if (state.ballId === ballId) {
                    catcherPlayerId = pid;
                    break;
                  }
                }
              }
              
              if (catcherPlayerId && playerMap[catcherPlayerId]) {
                const catcherPlayer = playerMap[catcherPlayerId];
                const catcherTeamSide = catcherPlayer.isHome ? 'home' : 'away';
                targetPlayerInfo = ` → caught by ${catcherPlayer.name} (${catcherTeamSide})`;
              } else {
                targetPlayerInfo = ' → caught';
              }
            } else if (turn.eliminatedPlayerId && playerMap[turn.eliminatedPlayerId]) {
              // For hits, show who was hit
              const targetPlayer = playerMap[turn.eliminatedPlayerId];
              const targetTeamSide = targetPlayer.isHome ? 'home' : 'away';
              targetPlayerInfo = ` → hit ${targetPlayer.name} (${targetTeamSide})`;
            } else if (turn.actionResult === 'blocked') {
              targetPlayerInfo = ' → blocked';
            } else if (turn.actionResult === 'miss') {
              targetPlayerInfo = ' → missed';
            } else {
              targetPlayerInfo = ' → missed';
            }
            
            // Log the throw action with player information
            console.log(`${player.name} (${teamSide}) ${turn.action}${targetPlayerInfo}`);
          } else if (turn.action === 'pick_up') {
            // Log pick up action
            console.log(`${player.name} (${teamSide}) ${turn.action} ball`);
          } else {
            // Log other actions
            console.log(`${player.name} (${teamSide}) ${turn.action}`);
          }
        });
      });
      
      // Log the game result
      const winner = game.winner === homeTeam.id ? homeTeam.name : awayTeam.name;
      const isHomeWinner = game.winner === homeTeam.id;
      console.log(`Game ${game.gameNumber} ends - ${winner} (${isHomeWinner ? 'home' : 'away'}) wins!`);
    });
    
    // Log the final match result
    console.log('------------------------------------------------------');
    console.log(`Final score: ${homeTeam.name} ${data.match.home_score} - ${data.match.away_score} ${awayTeam.name}`);
    
  } catch (error) {
    console.error('Error processing match data:', error.message);
  }
}

// Check if file path is provided as command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: node match-summary.js <path-to-json-file>');
  process.exit(1);
}

generateMatchSummary(filePath);
