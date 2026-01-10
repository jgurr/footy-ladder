import type { Team } from "./types";

/**
 * NRL Team data with official colors
 * Short codes follow NRL.com conventions
 */
export const NRL_TEAMS: Team[] = [
  {
    id: "bri",
    name: "Broncos",
    location: "Brisbane",
    shortCode: "BRI",
    primaryColor: "#6B2C35",
    secondaryColor: "#FDB813",
  },
  {
    id: "can",
    name: "Raiders",
    location: "Canberra",
    shortCode: "CAN",
    primaryColor: "#00A651",
    secondaryColor: "#FFFFFF",
  },
  {
    id: "cby",
    name: "Bulldogs",
    location: "Canterbury",
    shortCode: "CBY",
    primaryColor: "#005BAC",
    secondaryColor: "#FFFFFF",
  },
  {
    id: "cro",
    name: "Sharks",
    location: "Cronulla",
    shortCode: "CRO",
    primaryColor: "#00A8E8",
    secondaryColor: "#000000",
  },
  {
    id: "dol",
    name: "Dolphins",
    location: "Redcliffe",
    shortCode: "DOL",
    primaryColor: "#C8102E",
    secondaryColor: "#FDB813",
  },
  {
    id: "gld",
    name: "Titans",
    location: "Gold Coast",
    shortCode: "GLD",
    primaryColor: "#00A8E8",
    secondaryColor: "#FDB813",
  },
  {
    id: "man",
    name: "Sea Eagles",
    location: "Manly",
    shortCode: "MAN",
    primaryColor: "#6B2C35",
    secondaryColor: "#FFFFFF",
  },
  {
    id: "mel",
    name: "Storm",
    location: "Melbourne",
    shortCode: "MEL",
    primaryColor: "#452C7C",
    secondaryColor: "#FDB813",
  },
  {
    id: "new",
    name: "Knights",
    location: "Newcastle",
    shortCode: "NEW",
    primaryColor: "#005BAC",
    secondaryColor: "#C8102E",
  },
  {
    id: "nql",
    name: "Cowboys",
    location: "North Queensland",
    shortCode: "NQL",
    primaryColor: "#002B5C",
    secondaryColor: "#FDB813",
  },
  {
    id: "nzl",
    name: "Warriors",
    location: "New Zealand",
    shortCode: "NZL",
    primaryColor: "#000000",
    secondaryColor: "#C8102E",
  },
  {
    id: "par",
    name: "Eels",
    location: "Parramatta",
    shortCode: "PAR",
    primaryColor: "#005BAC",
    secondaryColor: "#FDB813",
  },
  {
    id: "pen",
    name: "Panthers",
    location: "Penrith",
    shortCode: "PEN",
    primaryColor: "#000000",
    secondaryColor: "#FF69B4",
  },
  {
    id: "sou",
    name: "Rabbitohs",
    location: "South Sydney",
    shortCode: "SOU",
    primaryColor: "#00A651",
    secondaryColor: "#C8102E",
  },
  {
    id: "sti",
    name: "Dragons",
    location: "St George Illawarra",
    shortCode: "STI",
    primaryColor: "#C8102E",
    secondaryColor: "#FFFFFF",
  },
  {
    id: "syd",
    name: "Roosters",
    location: "Sydney",
    shortCode: "SYD",
    primaryColor: "#00205B",
    secondaryColor: "#C8102E",
  },
  {
    id: "wst",
    name: "Tigers",
    location: "Wests",
    shortCode: "WST",
    primaryColor: "#F57F20",
    secondaryColor: "#000000",
  },
];

/**
 * Get team by ID
 */
export function getTeamById(id: string): Team | undefined {
  return NRL_TEAMS.find((team) => team.id === id);
}

/**
 * Get team by short code
 */
export function getTeamByCode(code: string): Team | undefined {
  return NRL_TEAMS.find(
    (team) => team.shortCode.toLowerCase() === code.toLowerCase()
  );
}

/**
 * Get team by name (case insensitive, partial match)
 */
export function getTeamByName(name: string): Team | undefined {
  const lowerName = name.toLowerCase();
  return NRL_TEAMS.find(
    (team) =>
      team.name.toLowerCase().includes(lowerName) ||
      team.location.toLowerCase().includes(lowerName)
  );
}
