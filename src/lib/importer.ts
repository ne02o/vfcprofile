import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { db, makeHouseholdKey, refreshHouseholds } from './db';
import { ImportRow, Person } from '../types';

const headerAliases: Record<keyof ImportRow, string[]> = {
  island: ['island', 'atoll island'],
  houseName: ['house name', 'house', 'housename'],
  fullName: ['name', 'full name', 'personname'],
  sex: ['sex', 'gender'],
  nationalId: ['national id', 'nid', 'id number', 'nationalid'],
};

export const detectMappings = (headers: string[]): Record<keyof ImportRow, string | null> => {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  const map: Record<keyof ImportRow, string | null> = {
    island: null,
    houseName: null,
    fullName: null,
    sex: null,
    nationalId: null,
  };

  (Object.keys(headerAliases) as (keyof ImportRow)[]).forEach((key) => {
    const idx = normalized.findIndex((h) => headerAliases[key].includes(h));
    map[key] = idx >= 0 ? headers[idx] : null;
  });
  return map;
};

export const parseWorkbook = async (file: File): Promise<Record<string, string>[]> => {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
};

export const parseCsvText = (text: string): Record<string, string>[] => {
  const wb = XLSX.read(text, { type: 'string' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
};

const normalizeSex = (sex?: string): 'M' | 'F' | null => {
  const value = sex?.trim().toUpperCase();
  if (value === 'M' || value === 'MALE') return 'M';
  if (value === 'F' || value === 'FEMALE') return 'F';
  return null;
};

export const upsertImportedRows = async (
  rows: Record<string, string>[],
  mapping: Record<keyof ImportRow, string>,
): Promise<{ inserted: number; updated: number }> => {
  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const island = row[mapping.island]?.trim();
    const houseName = row[mapping.houseName]?.trim();
    const fullName = row[mapping.fullName]?.trim();
    if (!island || !houseName || !fullName) continue;

    const nationalId = row[mapping.nationalId]?.trim() ?? '';
    const householdKey = makeHouseholdKey(island, houseName);
    const now = new Date().toISOString();

    const existing = nationalId
      ? await db.people.where('nationalId').equals(nationalId).first()
      : await db.people
          .filter(
            (p) =>
              p.island.toLowerCase() === island.toLowerCase() &&
              p.houseName.toLowerCase() === houseName.toLowerCase() &&
              p.fullName.toLowerCase() === fullName.toLowerCase(),
          )
          .first();

    const base: Person = {
      id: existing?.id ?? uuidv4(),
      island,
      houseName,
      fullName,
      sex: normalizeSex(row[mapping.sex]),
      nationalId,
      householdKey,
      category: existing?.category ?? 'Unknown',
      confidence: existing?.confidence ?? 3,
      lastContactedAt: existing?.lastContactedAt,
      nextFollowUpAt: existing?.nextFollowUpAt,
      contactMethod: existing?.contactMethod ?? null,
      influencer: existing?.influencer,
      assignedVolunteer: existing?.assignedVolunteer,
      visitStatus: existing?.visitStatus ?? 'NotVisited',
      notes: existing?.notes,
      tags: existing?.tags ?? [],
      lat: existing?.lat,
      lng: existing?.lng,
      addressText: existing?.addressText,
      area: existing?.area,
      phone: existing?.phone,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await db.people.put(base);
    if (existing) updated += 1;
    else inserted += 1;
  }

  await refreshHouseholds();
  return { inserted, updated };
};
