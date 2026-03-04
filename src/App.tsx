import { useEffect, useMemo, useState } from 'react';
import { BottomNav, TabKey } from './components/BottomNav';
import { useHouseholds, usePeople } from './lib/hooks';
import { DashboardScreen } from './screens/DashboardScreen';
import { ListScreen } from './screens/ListScreen';
import { HouseholdsScreen } from './screens/HouseholdsScreen';
import { MapScreen } from './screens/MapScreen';
import { PlannerScreen } from './screens/PlannerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { db } from './lib/db';

export default function App() {
  const [tab, setTab] = useState<TabKey>('Dashboard');
  const [locked, setLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const people = usePeople() ?? [];
  const households = useHouseholds() ?? [];

  const electionDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  }, []);

  useEffect(() => {
    db.settings.get('app_pin').then((pin) => setLocked(Boolean(pin?.value)));
  }, []);

  const unlock = async () => {
    const pin = await db.settings.get('app_pin');
    if (!pin?.value) return setLocked(false);
    if (pinInput === pin.value) setLocked(false);
    else alert('Invalid PIN');
  };

  if (locked) {
    return (
      <main className="max-w-md mx-auto p-4 min-h-screen flex items-center">
        <div className="card w-full space-y-2">
          <h1 className="text-lg font-bold">Island Campaign Outreach</h1>
          <p className="text-sm">App is locked. Enter PIN.</p>
          <input className="input" type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
          <button className="btn-primary w-full" onClick={unlock}>Unlock</button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-3 pb-24">
      <header className="mb-4">
        <h1 className="text-xl font-bold">Island Campaign Outreach</h1>
        <p className="text-xs text-slate-500">
          Priority score favors Undecided + NoShowRisk, boosts stale contacts, and household risk. Election date factor active ({electionDate.toDateString()}).
        </p>
      </header>

      {tab === 'Dashboard' && <DashboardScreen people={people} />}
      {tab === 'List' && <ListScreen people={people} households={households} />}
      {tab === 'Households' && <HouseholdsScreen households={households} people={people} />}
      {tab === 'Map' && <MapScreen households={households} people={people} />}
      {tab === 'Planner' && <PlannerScreen people={people} />}
      {tab === 'Settings' && <SettingsScreen />}

      <BottomNav active={tab} onChange={setTab} />
    </main>
  );
}
