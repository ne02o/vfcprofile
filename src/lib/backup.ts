import * as XLSX from 'xlsx';
import { db, refreshHouseholds } from './db';
import { Household, Person } from '../types';

export const exportFullBackup = async (): Promise<Blob> => {
  const people = await db.people.toArray();
  const households = await db.households.toArray();
  const payload = { people, households, exportedAt: new Date().toISOString(), version: 1 };
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
};

export const restoreFullBackup = async (file: File): Promise<void> => {
  const text = await file.text();
  const payload = JSON.parse(text) as { people: Person[]; households: Household[] };
  await db.people.clear();
  await db.households.clear();
  await db.people.bulkPut(payload.people || []);
  if (payload.households?.length) await db.households.bulkPut(payload.households);
  else await refreshHouseholds();
};

export const exportPeopleToXlsx = async (people: Person[]): Promise<Blob> => {
  const ws = XLSX.utils.json_to_sheet(people);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'People');
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};
