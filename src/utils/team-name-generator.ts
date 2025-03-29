/**
 * Utility for generating random team names
 */

// First parts of team names
const TEAM_NAME_FIRST_PARTS = [
  'Blazing', 'Mighty', 'Raging', 'Fierce', 'Swift', 'Thunder', 'Lightning', 'Royal', 'Savage', 'Elite',
  'Rapid', 'Crimson', 'Golden', 'Silver', 'Iron', 'Steel', 'Emerald', 'Diamond', 'Mystic', 'Shadow',
  'Phantom', 'Cosmic', 'Atomic', 'Cyber', 'Neon', 'Quantum', 'Sonic', 'Turbo', 'Hyper', 'Ultra',
  'Mega', 'Super', 'Prime', 'Alpha', 'Omega', 'Delta', 'Apex', 'Peak', 'Summit', 'Zenith',
  'Vortex', 'Typhoon', 'Tsunami', 'Cyclone', 'Tornado', 'Hurricane', 'Blizzard', 'Avalanche', 'Inferno', 'Volcano'
];

// Second parts of team names
const TEAM_NAME_SECOND_PARTS = [
  'Dodgers', 'Throwers', 'Titans', 'Warriors', 'Knights', 'Wolves', 'Dragons', 'Vipers', 'Eagles', 'Hawks',
  'Falcons', 'Panthers', 'Tigers', 'Lions', 'Bears', 'Sharks', 'Cobras', 'Pythons', 'Jaguars', 'Rhinos',
  'Bulldogs', 'Rockets', 'Comets', 'Meteors', 'Stars', 'Galaxies', 'Legends', 'Heroes', 'Guardians', 'Sentinels',
  'Commanders', 'Captains', 'Admirals', 'Generals', 'Marshals', 'Hunters', 'Trackers', 'Seekers', 'Voyagers', 'Explorers',
  'Pioneers', 'Navigators', 'Pilots', 'Racers', 'Runners', 'Sprinters', 'Dashers', 'Strikers', 'Blasters', 'Crushers'
];

/**
 * Generate a random team name by combining two parts
 * @returns A randomly generated team name
 */
export function generateTeamName(): string {
  const firstPart = TEAM_NAME_FIRST_PARTS[Math.floor(Math.random() * TEAM_NAME_FIRST_PARTS.length)];
  const secondPart = TEAM_NAME_SECOND_PARTS[Math.floor(Math.random() * TEAM_NAME_SECOND_PARTS.length)];
  
  return `${firstPart} ${secondPart}`;
}

/**
 * Generate multiple unique team names
 * @param count Number of team names to generate
 * @returns Array of unique team names
 */
export function generateUniqueTeamNames(count: number): string[] {
  const teamNames: string[] = [];
  const usedCombinations = new Set<string>();
  
  while (teamNames.length < count) {
    const teamName = generateTeamName();
    
    if (!usedCombinations.has(teamName)) {
      teamNames.push(teamName);
      usedCombinations.add(teamName);
    }
  }
  
  return teamNames;
}

export default {
  generateTeamName,
  generateUniqueTeamNames
};
