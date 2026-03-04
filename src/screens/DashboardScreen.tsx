import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Person } from '../types';

const colors: Record<Person['category'], string> = {
  Support: '#16a34a',
  Undecided: '#f59e0b',
  Against: '#ef4444',
  NoShowRisk: '#7c3aed',
  OtherCandidate: '#6366f1',
  Unknown: '#64748b',
};

export function DashboardScreen({ people }: { people: Person[] }) {
  const categoryData = useMemo(() => {
    const map = new Map<Person['category'], number>();
    people.forEach((p) => map.set(p.category, (map.get(p.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [people]);

  const notContacted = people.filter((p) => !p.lastContactedAt).length;
  const kpis = [
    { label: 'Total', value: people.length },
    { label: 'Support', value: people.filter((p) => p.category === 'Support').length },
    { label: 'Undecided', value: people.filter((p) => p.category === 'Undecided').length },
    { label: 'Against', value: people.filter((p) => p.category === 'Against').length },
    { label: 'NoShowRisk', value: people.filter((p) => p.category === 'NoShowRisk').length },
    { label: 'OtherCandidate', value: people.filter((p) => p.category === 'OtherCandidate').length },
    { label: 'Unknown', value: people.filter((p) => p.category === 'Unknown').length },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {kpis.map((k) => (
          <div key={k.label} className="card p-3">
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className="text-xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="card h-64">
        <h3 className="font-semibold mb-2">Category Distribution</h3>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90}>
              {categoryData.map((entry) => (
                <Cell key={entry.name} fill={colors[entry.name as Person['category']]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card h-56">
        <h3 className="font-semibold mb-2">Outreach Snapshot</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={[{ name: 'Not Contacted', value: notContacted }, { name: 'Contacted', value: people.length - notContacted }]}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0284c7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
