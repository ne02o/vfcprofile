import { BarChart3, House, List, MapPinned, Route, Settings } from 'lucide-react';

const tabs = [
  { key: 'Dashboard', icon: BarChart3 },
  { key: 'List', icon: List },
  { key: 'Households', icon: House },
  { key: 'Map', icon: MapPinned },
  { key: 'Planner', icon: Route },
  { key: 'Settings', icon: Settings },
] as const;

export type TabKey = (typeof tabs)[number]['key'];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[1000]">
      <div className="grid grid-cols-6 max-w-4xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`py-2 text-xs flex flex-col items-center ${active === tab.key ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Icon size={16} />
              <span>{tab.key}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
