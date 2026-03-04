import { Household, Person } from '../types';

const categoryBase: Record<Person['category'], number> = {
  Undecided: 80,
  NoShowRisk: 85,
  Support: 45,
  Unknown: 55,
  Against: 10,
  OtherCandidate: 8,
};

export const getPriorityScore = (
  person: Person,
  household?: Household,
  electionDate?: Date,
): number => {
  const now = new Date();
  let score = categoryBase[person.category];

  if (!person.lastContactedAt) {
    score += 20;
  } else {
    const days = Math.floor((now.getTime() - new Date(person.lastContactedAt).getTime()) / (1000 * 3600 * 24));
    if (days > 14) score += 15;
    if (days > 30) score += 10;
  }

  if (electionDate && person.category === 'NoShowRisk') {
    const daysToElection = Math.max(
      1,
      Math.floor((electionDate.getTime() - now.getTime()) / (1000 * 3600 * 24)),
    );
    score += Math.max(0, 25 - daysToElection);
  }

  if (household?.householdStatus === 'Priority') score += 12;
  if (person.nextFollowUpAt && new Date(person.nextFollowUpAt) <= now) score += 10;

  return Math.min(100, score);
};

export const householdStatusFromMembers = (members: Person[]): Household['householdStatus'] => {
  const count = (c: Person['category']) => members.filter((m) => m.category === c).length;
  if (count('Undecided') + count('NoShowRisk') > 0) return 'Priority';
  if (count('Support') > 0) return 'LeaningSupport';
  if (count('Against') + count('OtherCandidate') > 0) return 'Opposition';
  return 'Unknown';
};
