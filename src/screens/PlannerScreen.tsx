import { useMemo, useState } from 'react';
import { Person } from '../types';

const toRad = (v: number) => (v * Math.PI) / 180;
const distance = (a: Person, b: Person): number => {
  if (!a.lat || !a.lng || !b.lat || !b.lng) return Number.MAX_SAFE_INTEGER;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
};

export function PlannerScreen({ people }: { people: Person[] }) {
  const [useRisk, setUseRisk] = useState(true);
  const [useUndecided, setUseUndecided] = useState(true);

  const candidates = people.filter((p) => {
    if (useRisk && p.category === 'NoShowRisk') return true;
    if (useUndecided && p.category === 'Undecided') return true;
    return false;
  });

  const ordered = useMemo(() => {
    if (!candidates.length) return [];
    const withCoords = candidates.filter((p) => p.lat && p.lng);
    if (!withCoords.length) return candidates;
    const route = [withCoords[0]];
    const remaining = withCoords.slice(1);
    while (remaining.length) {
      const current = route[route.length - 1];
      let nearestIndex = 0;
      let nearestDist = Infinity;
      remaining.forEach((p, i) => {
        const d = distance(current, p);
        if (d < nearestDist) {
          nearestDist = d;
          nearestIndex = i;
        }
      });
      route.push(remaining.splice(nearestIndex, 1)[0]);
    }
    return route;
  }, [people, useRisk, useUndecided]);

  return (
    <div className="space-y-3 pb-20">
      <div className="card flex gap-4">
        <label><input type="checkbox" checked={useUndecided} onChange={(e) => setUseUndecided(e.target.checked)} /> Undecided</label>
        <label><input type="checkbox" checked={useRisk} onChange={(e) => setUseRisk(e.target.checked)} /> NoShowRisk</label>
      </div>
      <div className="card">
        <p className="font-semibold">Printable Visit Checklist ({ordered.length})</p>
        <ol className="list-decimal ml-5 mt-2 text-sm space-y-1">
          {ordered.map((p) => (
            <li key={p.id}>{p.fullName} — {p.houseName} ({p.category})</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
