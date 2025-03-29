/**
 * Utility class for generating random names
 */
export class NameGenerator {
  // List of first names for random name generation
  private static firstNames = [
    // Common names
    'Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery', 'Quinn',
    'Blake', 'Cameron', 'Dakota', 'Hayden', 'Reese', 'Parker', 'Peyton', 'Skyler',
    'Kendall', 'Rowan', 'Sawyer', 'Finley', 'Jamie', 'Jesse', 'Charlie', 'Emerson',
    'Kai', 'River', 'Phoenix', 'Remy', 'Harley', 'Jaden', 'Nico', 'Drew', 'Anthony',
    
    // Additional first names
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
    'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
    'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
    'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob',
    'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott',
    'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Alexander', 'Patrick', 'Frank',
    'Raymond', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan',
    'Henry', 'Zachary', 'Douglas', 'Peter', 'Kyle', 'Noah', 'Ethan', 'Jeremy',
    'Walter', 'Christian', 'Keith', 'Roger', 'Terry', 'Austin', 'Sean', 'Gerald',
    'Carl', 'Harold', 'Dylan', 'Arthur', 'Lawrence', 'Jordan', 'Jesse', 'Bryan',
    'Billy', 'Bruce', 'Gabriel', 'Joe', 'Logan', 'Alan', 'Juan', 'Albert', 'Willie',
    'Elijah', 'Wayne', 'Randy', 'Vincent', 'Mason', 'Roy', 'Ralph', 'Bobby', 'Russell',
    'Bradley', 'Philip', 'Eugene', 'Carlos', 'Louis', 'Harry', 'Caleb', 'Lucas',
    
    // Female names
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
    'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Sandra', 'Margaret',
    'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Dorothy',
    'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia',
    'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Ruth', 'Brenda', 'Pamela',
    'Nicole', 'Katherine', 'Virginia', 'Catherine', 'Christine', 'Samantha', 'Debra',
    'Janet', 'Rachel', 'Carolyn', 'Emma', 'Maria', 'Heather', 'Diane', 'Julie',
    'Joyce', 'Evelyn', 'Joan', 'Victoria', 'Kelly', 'Christina', 'Lauren', 'Frances',
    'Martha', 'Judith', 'Cheryl', 'Megan', 'Andrea', 'Olivia', 'Ann', 'Jean',
    'Alice', 'Jacqueline', 'Hannah', 'Doris', 'Kathryn', 'Gloria', 'Teresa', 'Sara',
    'Janice', 'Marie', 'Julia', 'Grace', 'Judy', 'Theresa', 'Madison', 'Beverly',
    'Denise', 'Marilyn', 'Amber', 'Danielle', 'Rose', 'Brittany', 'Diana', 'Abigail',
    'Natalie', 'Jane', 'Lori', 'Alexis', 'Tiffany', 'Kayla', 'Charlotte'
  ];

  // List of last names for random name generation
  private static lastNames = [
    // Common last names
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Pengelly',
    
    // Additional last names
    'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker', 'Collins',
    'Edwards', 'Stewart', 'Flores', 'Morris', 'Nguyen', 'Murphy', 'Rivera', 'Cook',
    'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez',
    'Kelly', 'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson',
    'Brooks', 'Bennett', 'Gray', 'James', 'Reyes', 'Cruz', 'Hughes', 'Price',
    'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales', 'Powell', 'Sullivan',
    'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher',
    'Henderson', 'Coleman', 'Simmons', 'Patterson', 'Jordan', 'Reynolds', 'Hamilton',
    'Graham', 'Kim', 'Gonzales', 'Alexander', 'Ramos', 'Wallace', 'Griffin', 'West',
    'Cole', 'Hayes', 'Chavez', 'Gibson', 'Bryant', 'Ellis', 'Stevens', 'Murray',
    'Ford', 'Marshall', 'Owens', 'McDonald', 'Harrison', 'Ruiz', 'Kennedy', 'Wells',
    'Alvarez', 'Woods', 'Mendoza', 'Castillo', 'Olson', 'Webb', 'Washington', 'Tucker',
    'Freeman', 'Burns', 'Henry', 'Vasquez', 'Snyder', 'Simpson', 'Crawford', 'Jimenez',
    'Porter', 'Mason', 'Shaw', 'Gordon', 'Wagner', 'Hunter', 'Romero', 'Hicks',
    'Dixon', 'Hunt', 'Palmer', 'Robertson', 'Black', 'Holmes', 'Stone', 'Meyer',
    'Boyd', 'Mills', 'Warren', 'Fox', 'Rose', 'Rice', 'Moreno', 'Schmidt', 'Patel',
    'Ferguson', 'Nichols', 'Herrera', 'Medina', 'Ryan', 'Fernandez', 'Weaver',
    'Daniels', 'Stephens', 'Gardner', 'Payne', 'Kelley', 'Dunn', 'Pierce', 'Arnold',
    'Tran', 'Spencer', 'Peters', 'Hawkins', 'Grant', 'Hansen', 'Castro', 'Hoffman',
    'Hart', 'Elliott', 'Cunningham', 'Knight', 'Bradley', 'Carroll', 'Hudson', 'Duncan',
    'Armstrong', 'Berry', 'Andrews', 'Johnston', 'Ray', 'Lane', 'Riley', 'Carpenter',
    'Perkins', 'Aguilar', 'Silva', 'Richards', 'Willis', 'Matthews', 'Chapman', 'Lawrence',
    'Garza', 'Vargas', 'Watkins', 'Wheeler', 'Larson', 'Carlson', 'Harper', 'George'
  ];

  /**
   * Generate a random name
   * @returns Random full name
   */
  public static generateName(): string {
    const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    return `${firstName} ${lastName}`;
  }
}
