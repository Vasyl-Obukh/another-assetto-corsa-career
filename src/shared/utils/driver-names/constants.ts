// The names an empty seat is filled from, per nation. Common first names and
// common surnames, paired at random, so a generated driver reads as someone
// from that country without being anybody in particular. Keyed by the nation
// code, one of NATION_CODES.

import type { NameBook } from './types.ts';

/**
 * First names and surnames per nation, with what the nation is called.
 */
export const DRIVER_NAMES: Readonly<Record<string, NameBook>> = {
  ITA: {
    first: [
      'Alessandro', 'Andrea', 'Davide', 'Federico', 'Francesco', 'Gabriele', 'Giacomo', 'Giulio', 'Leonardo',
      'Lorenzo', 'Luca', 'Marco', 'Matteo', 'Mattia', 'Niccolò', 'Pietro', 'Riccardo', 'Simone', 'Stefano',
      'Tommaso',
    ],
    last: [
      'Barbieri', 'Bellini', 'Bianchi', 'Colombo', 'Conti', 'Costa', 'De Luca', 'Esposito', 'Ferrari', 'Fontana',
      'Galli', 'Greco', 'Lombardi', 'Mancini', 'Marino', 'Moretti', 'Ricci', 'Rinaldi', 'Romano', 'Villa',
    ],
  },
  GBR: {
    first: [
      'Alfie', 'Callum', 'Charlie', 'Daniel', 'Edward', 'Finley', 'George', 'Harry', 'Henry', 'Jack', 'James',
      'Joshua', 'Liam', 'Max', 'Oliver', 'Oscar', 'Rhys', 'Sam', 'Thomas', 'William',
    ],
    last: [
      'Ashworth', 'Bennett', 'Clarke', 'Davies', 'Ellis', 'Fletcher', 'Harper', 'Hughes', 'Lawson', 'Marsh',
      'Mitchell', 'Parker', 'Porter', 'Reid', 'Shaw', 'Turner', 'Walker', 'Webb', 'Whitfield', 'Wright',
    ],
  },
  USA: {
    first: [
      'Austin', 'Blake', 'Brandon', 'Caleb', 'Carter', 'Chase', 'Cody', 'Colton', 'Dylan', 'Ethan', 'Garrett',
      'Hunter', 'Jake', 'Logan', 'Mason', 'Nolan', 'Ryan', 'Travis', 'Tyler', 'Wyatt',
    ],
    last: [
      'Anderson', 'Brooks', 'Carter', 'Coleman', 'Dawson', 'Foster', 'Griffin', 'Hayes', 'Hollis', 'Jennings',
      'Kendall', 'Mercer', 'Morgan', 'Parsons', 'Reed', 'Sawyer', 'Sullivan', 'Tanner', 'Walsh', 'Whitaker',
    ],
  },
  DEU: {
    first: [
      'Alexander', 'Ben', 'Dennis', 'Felix', 'Florian', 'Jan', 'Jonas', 'Julian', 'Kai', 'Lukas', 'Marcel', 'Max',
      'Moritz', 'Nico', 'Niklas', 'Paul', 'Philipp', 'Sebastian', 'Tim', 'Tobias',
    ],
    last: [
      'Bauer', 'Becker', 'Brandt', 'Fischer', 'Frank', 'Hartmann', 'Hoffmann', 'Keller', 'Koch', 'Krause', 'Lang',
      'Lehmann', 'Meyer', 'Neumann', 'Richter', 'Schmitt', 'Schreiber', 'Vogel', 'Wagner', 'Wolf',
    ],
  },
  FRA: {
    first: [
      'Adrien', 'Antoine', 'Arthur', 'Bastien', 'Clément', 'Florian', 'Hugo', 'Jules', 'Julien', 'Louis', 'Lucas',
      'Mathieu', 'Maxime', 'Nathan', 'Nicolas', 'Paul', 'Pierre', 'Raphaël', 'Théo', 'Thomas',
    ],
    last: [
      'Bernard', 'Blanc', 'Bonnet', 'Chevalier', 'Dubois', 'Dupont', 'Durand', 'Fontaine', 'Garnier', 'Girard',
      'Lambert', 'Leroy', 'Martin', 'Mercier', 'Moreau', 'Morel', 'Petit', 'Renard', 'Roux', 'Vincent',
    ],
  },
  ESP: {
    first: [
      'Adrián', 'Alejandro', 'Álvaro', 'Carlos', 'Daniel', 'David', 'Diego', 'Hugo', 'Iker', 'Javier', 'Jorge',
      'Marc', 'Mario', 'Miguel', 'Pablo', 'Pau', 'Raúl', 'Sergio', 'Víctor', 'Xavier',
    ],
    last: [
      'Alonso', 'Castro', 'Delgado', 'Díaz', 'Fernández', 'Gil', 'Gómez', 'Herrera', 'Iglesias', 'Jiménez', 'López',
      'Marín', 'Molina', 'Navarro', 'Ortega', 'Pérez', 'Ramos', 'Romero', 'Serrano', 'Vidal',
    ],
  },
  NLD: {
    first: [
      'Bram', 'Daan', 'Finn', 'Jesse', 'Joris', 'Lars', 'Luuk', 'Milan', 'Niels', 'Ruben', 'Sem', 'Stijn', 'Thijs',
      'Tim', 'Tom', 'Wouter',
    ],
    last: [
      'Bakker', 'Bos', 'de Boer', 'de Graaf', 'de Jong', 'de Vries', 'Dekker', 'Janssen', 'Kuipers', 'Meijer',
      'Mulder', 'Smit', 'van Dam', 'van Dijk', 'Visser', 'Vos',
    ],
  },
  BEL: {
    first: [
      'Arne', 'Bastien', 'Cédric', 'Dries', 'Jonas', 'Kobe', 'Lucas', 'Maxime', 'Nathan', 'Pieter', 'Robbe',
      'Thibault', 'Tom', 'Wout',
    ],
    last: [
      'Claes', 'Declercq', 'Dubois', 'Goossens', 'Jacobs', 'Lambert', 'Maes', 'Mertens', 'Peeters', 'Renard',
      'Smets', 'Wouters',
    ],
  },
  AUT: {
    first: [
      'Andreas', 'Christoph', 'Daniel', 'David', 'Elias', 'Fabian', 'Florian', 'Jakob', 'Lukas', 'Markus',
      'Matthias', 'Stefan',
    ],
    last: [
      'Auer', 'Berger', 'Eder', 'Gruber', 'Hofer', 'Huber', 'Leitner', 'Moser', 'Pichler', 'Steiner', 'Wallner',
      'Winkler',
    ],
  },
  CHE: {
    first: [
      'Adrian', 'Cédric', 'Fabio', 'Jan', 'Joel', 'Levin', 'Luca', 'Marco', 'Nils', 'Noah', 'Reto', 'Yannick',
    ],
    last: [
      'Baumann', 'Brunner', 'Frei', 'Gerber', 'Keller', 'Kunz', 'Meier', 'Müller', 'Schmid', 'Steiner', 'Weber',
      'Zimmermann',
    ],
  },
  CAN: {
    first: [
      'Alexandre', 'Connor', 'Dylan', 'Étienne', 'Félix', 'Gabriel', 'Liam', 'Logan', 'Mathis', 'Nathan', 'Noah',
      'Owen', 'Samuel', 'Tyler', 'William', 'Zachary',
    ],
    last: [
      'Bergeron', 'Boucher', 'Campbell', 'Côté', 'Fraser', 'Gagnon', 'Gauthier', 'Lavoie', 'MacDonald', 'Morin',
      'Ouellet', 'Pelletier', 'Roy', 'Stewart', 'Tremblay', 'Wilson',
    ],
  },
  MEX: {
    first: [
      'Alejandro', 'Andrés', 'Carlos', 'Diego', 'Emilio', 'Fernando', 'Gerardo', 'Iván', 'Jorge', 'José', 'Luis',
      'Ricardo', 'Rodrigo', 'Santiago',
    ],
    last: [
      'Aguilar', 'Castillo', 'Cruz', 'Flores', 'García', 'Guerrero', 'Hernández', 'Medina', 'Mendoza', 'Ortiz',
      'Ramírez', 'Reyes', 'Torres', 'Vargas',
    ],
  },
  BRA: {
    first: [
      'Arthur', 'Bernardo', 'Bruno', 'Caio', 'Daniel', 'Enzo', 'Felipe', 'Gabriel', 'Gustavo', 'Igor', 'João',
      'Lucas', 'Matheus', 'Pedro', 'Rafael', 'Thiago',
    ],
    last: [
      'Almeida', 'Araújo', 'Barbosa', 'Carvalho', 'Costa', 'Ferreira', 'Gomes', 'Lima', 'Martins', 'Oliveira',
      'Pereira', 'Ribeiro', 'Rocha', 'Santos', 'Souza', 'Teixeira',
    ],
  },
  ARG: {
    first: [
      'Agustín', 'Bautista', 'Facundo', 'Franco', 'Gonzalo', 'Ignacio', 'Joaquín', 'Lautaro', 'Mateo', 'Matías',
      'Nicolás', 'Tomás',
    ],
    last: [
      'Acosta', 'Benítez', 'Correa', 'Domínguez', 'Fernández', 'Giménez', 'Ledesma', 'Molina', 'Rojas', 'Sosa',
      'Suárez', 'Villalba',
    ],
  },
  JPN: {
    first: [
      'Daiki', 'Haruto', 'Hayato', 'Hiroshi', 'Kaito', 'Kenta', 'Koki', 'Naoki', 'Ren', 'Riku', 'Ryo', 'Shota',
      'Sota', 'Takumi', 'Yuki', 'Yuto',
    ],
    last: [
      'Aoki', 'Fujita', 'Hayashi', 'Ishikawa', 'Kato', 'Kobayashi', 'Matsuda', 'Mori', 'Nakamura', 'Ogawa', 'Saito',
      'Sasaki', 'Shimizu', 'Takeda', 'Yamada', 'Yoshida',
    ],
  },
  AUS: {
    first: [
      'Angus', 'Brodie', 'Cameron', 'Cooper', 'Declan', 'Fletcher', 'Harrison', 'Jackson', 'Jayden', 'Lachlan',
      'Mitchell', 'Riley',
    ],
    last: [
      'Baxter', 'Bishop', 'Cartwright', 'Dunn', 'Gallagher', 'Hudson', 'McKenzie', 'Murray', 'Nolan', 'Palmer',
      'Quinn', 'Sinclair',
    ],
  },
  POL: {
    first: [
      'Adam', 'Bartosz', 'Dawid', 'Filip', 'Jakub', 'Kacper', 'Kamil', 'Krzysztof', 'Mateusz', 'Michał', 'Piotr',
      'Szymon',
    ],
    last: [
      'Dąbrowski', 'Grabowski', 'Jankowski', 'Kamiński', 'Kowalczyk', 'Kowalski', 'Lewandowski', 'Mazur', 'Nowak',
      'Wiśniewski', 'Wójcik', 'Zieliński',
    ],
  },
  PRT: {
    first: [
      'Afonso', 'André', 'Diogo', 'Duarte', 'Gonçalo', 'Guilherme', 'João', 'Miguel', 'Rodrigo', 'Rui', 'Tiago',
      'Tomás',
    ],
    last: [
      'Almeida', 'Carvalho', 'Costa', 'Faria', 'Ferreira', 'Macedo', 'Martins', 'Monteiro', 'Pinto', 'Rodrigues',
      'Silva', 'Sousa',
    ],
  },
  SWE: {
    first: [
      'Anton', 'Axel', 'Emil', 'Erik', 'Filip', 'Gustav', 'Isak', 'Johan', 'Linus', 'Oskar', 'Viktor', 'William',
    ],
    last: [
      'Andersson', 'Berg', 'Eriksson', 'Holm', 'Johansson', 'Karlsson', 'Lindqvist', 'Lund', 'Nilsson', 'Nyström',
      'Persson', 'Sandberg',
    ],
  },
  DNK: {
    first: [
      'Anders', 'Christian', 'Emil', 'Frederik', 'Jonas', 'Kasper', 'Magnus', 'Mathias', 'Nikolaj', 'Rasmus',
      'Simon', 'Tobias',
    ],
    last: [
      'Andersen', 'Christensen', 'Hansen', 'Jensen', 'Jørgensen', 'Larsen', 'Madsen', 'Mortensen', 'Nielsen',
      'Olsen', 'Pedersen', 'Sørensen',
    ],
  },
  FIN: {
    first: [
      'Aleksi', 'Antti', 'Eetu', 'Joni', 'Juho', 'Lauri', 'Mikko', 'Niko', 'Otto', 'Sami', 'Teemu', 'Ville',
    ],
    last: [
      'Heikkinen', 'Hämäläinen', 'Järvinen', 'Koskinen', 'Laine', 'Lehtonen', 'Mäkinen', 'Nieminen', 'Salminen',
      'Turunen', 'Virtanen', 'Väisänen',
    ],
  },
  ARE: {
    first: [
      'Abdullah', 'Ahmed', 'Hamad', 'Hamdan', 'Khalid', 'Majid', 'Mansour', 'Mohammed', 'Omar', 'Rashid', 'Saif',
      'Sultan',
    ],
    last: [
      'Al Ali', 'Al Dhaheri', 'Al Falasi', 'Al Hashimi', 'Al Ketbi', 'Al Mansoori', 'Al Marri', 'Al Mazrouei',
      'Al Nuaimi', 'Al Qasimi', 'Al Shamsi', 'Al Suwaidi',
    ],
  },
  CHN: {
    first: [
      'Bowen', 'Chen', 'Hao', 'Jiahao', 'Jun', 'Lei', 'Ming', 'Rui', 'Tao', 'Wei', 'Yang', 'Zihan',
    ],
    last: [
      'Chen', 'Guo', 'He', 'Huang', 'Li', 'Lin', 'Liu', 'Ma', 'Sun', 'Wang', 'Wu', 'Zhang', 'Zhao', 'Zhou',
    ],
  },
};

/**
 * How often a driver whose team names no nation is drawn from the class's most
 * common one rather than from anywhere.
 */
export const COMMON_NATION_SHARE = 0.5;

/**
 * How many times a name that is already taken is drawn again before an
 * initial is put in it instead.
 */
export const NAME_TRIES = 20;

/**
 * The middle initials that tell two drivers of the same name apart.
 */
export const INITIALS: readonly string[] = [...'ABCDEFGHJKLMNPRST'];
