import { useMemo, useState } from 'react';
import { db } from '../lib/db';
import { getPriorityScore } from '../lib/scoring';
import { Household, Person, Category } from '../types';

const categories: Category[] = ['Support', 'Undecided', 'Against', 'NoShowRisk', 'OtherCandidate', 'Unknown'];

export function ListScreen({ people, households }: { people: Person[]; households: Household[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [selected, setSelected] = useState<string[]>([]);
  const householdMap = new Map(households.map((h) => [h.householdKey, h]));

  const filtered = useMemo(() => {
    return people
      .filter((p) =>
        [p.fullName, p.nationalId, p.houseName].join(' ').toLowerCase().includes(query.toLowerCase()),
      )
      .filter((p) => (category === 'All' ? true : p.category === category))
      .sort(
        (a, b) =>
          getPriorityScore(b, householdMap.get(b.householdKey)) - getPriorityScore(a, householdMap.get(a.householdKey)),
      );
  }, [people, query, category]);

  const bulkSet = async (nextCategory: Category) => {
    await db.people.bulkUpdate(
      selected.map((id) => ({ key: id, changes: { category: nextCategory, updatedAt: new Date().toISOString() } })),
    );
    setSelected([]);
  };

  return (
    <div className="space-y-3 pb-20">
      <div className="card space-y-2">
        <input className="input" placeholder="Search name, NID, house" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category | 'All')}>
          <option>All</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {selected.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button key={c} className="btn-secondary" onClick={() => bulkSet(c)}>
                Set {c}
              </button>
            ))}
          </div>
        )}
      </div>
      {filtered.map((p) => (
        <label key={p.id} className="card flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected.includes(p.id)}
            onChange={(e) =>
              setSelected((prev) => (e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)))
            }
          />
          <div className="flex-1">
            <p className="font-semibold">{p.fullName}</p>
            <p className="text-xs text-slate-500">{p.island} · {p.houseName} · {p.nationalId || 'No NID'}</p>
            <div className="flex items-center gap-2 mt-1">
              <select
                className="input max-w-40"
                value={p.category}
                onChange={(e) => db.people.update(p.id, { category: e.target.value as Category })}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span className="text-xs">Priority {getPriorityScore(p, householdMap.get(p.householdKey))}</span>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}
