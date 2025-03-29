1. Game Design
1.1 Core Concept
A football-manager style dodgeball autobattler with roguelike elements.

Single-player vs. CPU in early versions but architected to evolve into multiplayer leagues later.

You manage a dodgeball team: recruit players, train them, set tactics, and aim for promotion through each season’s mini-league.

1.2 Player Stats
The game’s players each have stats that impact performance:

Throwing: Determines power, speed, and accuracy of throws.

Catching: Probability and reliability of catching incoming balls.

Dodging: Evasiveness and ability to avoid incoming balls.

Blocking: How effectively they block balls when holding one or using their body position.

Speed: General movement speed on the court.

Positional Sense (renamed from “tactical awareness”): Ability to follow instructions, move optimally on the court, and maintain formation.

Teamwork: How well a player coordinates with teammates (especially when the court is crowded with your own players).

Clutch Factor (renamed from “underdog”): Performance boost (or penalty) when the team is outnumbered.

1.3 Draft / Team Composition
Start with a fixed budget for a pre-season draft.

Player availability is based on secret tiers: higher-tier players won’t join unless you’ve proven yourself by achieving promotions.

You must recruit enough players to fill a roster but stay within budget.

1.4 Seasonal Flow
Each season has the following phases:

Pre-Season

Manage your budget (which is determined by the stadium size).

Buy/sell players (transfer list).

Scouts may suggest bargain players.

Train a subset of your players (upgrading training facilities increases how many stats can be trained).

Optionally upgrade facilities (scouts, training, stadium) at the end of each season to prepare for the next.

Matches (3 per Season)

Before each match:

Set tactics for each player: how aggressive, prefer dodge vs. catch, how often to block, etc.

Decide pre-planned substitutions if certain conditions (fatigue, low performance) are met.

Auto-battler gameplay is best of three elimination rounds.

Each round’s outcome depends on your players’ stats and chosen tactics.

Fatigue is accumulated after each match; rest a player by subbing them out in future rounds.

The league table updates after each match in a round-robin format.

Top two finishers get promoted to the next mini-league (harder opponents, better potential signings).

End of Season

After 5 seasons, there is a special knock-out tournament with quarter-final, semi-final, and final (the final is always against the other promoted team).

1.5 Auto-Battler Mechanics
Each round is an elimination scenario: hits remove players from that round.

The match’s flow is simulated based on stats + tactics + random dice rolls.

The manager only sets up tactics, lineups, and subs before each round or match; no direct input mid-round.

1.6 Roadmap for Multiplayer
Eventually, the mini-leagues would be actual human opponents with scheduling in leagues.

Core game logic is the same—only difference is hooking up to a multi-user environment and storing game states on a shared server.