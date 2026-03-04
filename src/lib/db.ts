import Dexie, { Table } from 'dexie';
import { Household, Person } from '../types';
import { householdStatusFromMembers } from './scoring';

export class CampaignDB extends Dexie {
  people!: Table<Person, string>;
  households!: Table<Household, string>;
  settings!: Table<{ key: string; value: string }, string>;

  constructor() {
    super('islandCampaignOutreachDB');
    this.version(1).stores({
      people:
        'id, nationalId, fullName, houseName, island, householdKey, category, sex, assignedVolunteer, lastContactedAt, nextFollowUpAt',
      households: 'householdKey, island, houseName, householdStatus',
      settings: 'key',
    });
  }
}

export const db = new CampaignDB();

export const makeHouseholdKey = (island: string, houseName: string): string =>
  `${island.trim().toLowerCase()}::${houseName.trim().toLowerCase()}`;

export const refreshHouseholds = async (): Promise<void> => {
  const people = await db.people.toArray();
  const grouped = people.reduce<Record<string, Person[]>>((acc, person) => {
    acc[person.householdKey] = acc[person.householdKey] || [];
    acc[person.householdKey].push(person);
    return acc;
  }, {});

  const now = new Date().toISOString();
  const households: Household[] = Object.entries(grouped).map(([householdKey, members]) => ({
    householdKey,
    island: members[0].island,
    houseName: members[0].houseName,
    memberIds: members.map((m) => m.id),
    householdStatus: householdStatusFromMembers(members),
    notes: '',
    lat: members.find((m) => m.lat)?.lat,
    lng: members.find((m) => m.lng)?.lng,
    updatedAt: now,
  }));

  await db.households.clear();
  await db.households.bulkPut(households);
};
