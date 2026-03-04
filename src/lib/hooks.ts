import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

export const usePeople = () => useLiveQuery(() => db.people.toArray(), []);
export const useHouseholds = () => useLiveQuery(() => db.households.toArray(), []);
