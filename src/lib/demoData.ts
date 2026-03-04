import { v4 as uuidv4 } from 'uuid';
import { db, makeHouseholdKey, refreshHouseholds } from './db';
import { Category, Person } from '../types';

const islands = ['GDh. Vaadhoo', 'GDh. Thinadhoo', 'GDh. Nadella'];
const houses = ['Boadhi', 'Aahiyaa', 'Fennaaru', 'Nooraanee', 'Reethige'];
const names = ['Najaah Mohamed', 'Shifa Ali', 'Ahmed Nashid', 'Mariyam Soliha', 'Hussain Rasheed'];
const categories: Category[] = ['Support', 'Undecided', 'Against', 'NoShowRisk', 'OtherCandidate', 'Unknown'];

export const seedDemoData = async (count = 80): Promise<void> => {
  const now = new Date().toISOString();
  const people: Person[] = Array.from({ length: count }).map((_, idx) => {
    const island = islands[idx % islands.length];
    const houseName = houses[idx % houses.length];
    const householdKey = makeHouseholdKey(island, houseName);
    const lat = -0.65 + (idx % 12) * 0.003;
    const lng = 73.15 + (idx % 12) * 0.003;

    return {
      id: uuidv4(),
      island,
      houseName,
      fullName: `${names[idx % names.length]} ${idx}`,
      sex: idx % 2 === 0 ? 'M' : 'F',
      nationalId: `A${(200000 + idx).toString()}`,
      householdKey,
      category: categories[idx % categories.length],
      confidence: ((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      contactMethod: null,
      visitStatus: 'NotVisited',
      tags: [],
      lat,
      lng,
      createdAt: now,
      updatedAt: now,
    };
  });

  await db.people.clear();
  await db.people.bulkPut(people);
  await refreshHouseholds();
};
