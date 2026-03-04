import { db } from '../lib/db';
import { Household, Person } from '../types';

export function HouseholdsScreen({ households, people }: { households: Household[]; people: Person[] }) {
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const sorted = [...households].sort((a, b) => (a.householdStatus === 'Priority' ? -1 : 1));

  return (
    <div className="space-y-3 pb-20">
      {sorted.map((h) => {
        const members = h.memberIds.map((id) => peopleById.get(id)).filter(Boolean) as Person[];
        return (
          <div key={h.householdKey} className="card">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{h.houseName}</p>
                <p className="text-xs text-slate-500">{h.island} · {members.length} members</p>
              </div>
              <span className="text-xs font-medium">{h.householdStatus}</span>
            </div>
            <ul className="mt-2 text-sm">
              {members.slice(0, 4).map((m) => (
                <li key={m.id}>{m.fullName} · {m.category}</li>
              ))}
            </ul>
            <button
              className="btn-secondary mt-3"
              onClick={() =>
                Promise.all(members.map((m) => db.people.update(m.id, { visitStatus: 'Visited' }))).then(() =>
                  db.households.update(h.householdKey, { notes: 'Marked visited', updatedAt: new Date().toISOString() }),
                )
              }
            >
              Mark household visited
            </button>
          </div>
        );
      })}
    </div>
  );
}
