import { useMemo, useState } from 'react';
import { detectMappings, parseCsvText, parseWorkbook, upsertImportedRows } from '../lib/importer';
import { exportFullBackup, restoreFullBackup } from '../lib/backup';
import { seedDemoData } from '../lib/demoData';
import { db } from '../lib/db';
import { ImportRow } from '../types';

export function SettingsScreen() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<keyof ImportRow, string>>({
    island: 'Island',
    houseName: 'House Name',
    fullName: 'Name',
    sex: 'Sex',
    nationalId: 'National ID',
  });
  const [pastedText, setPastedText] = useState('');
  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);

  const autoMap = () => {
    const guessed = detectMappings(headers);
    setMapping((prev) => ({
      ...prev,
      island: guessed.island || prev.island,
      houseName: guessed.houseName || prev.houseName,
      fullName: guessed.fullName || prev.fullName,
      sex: guessed.sex || prev.sex,
      nationalId: guessed.nationalId || prev.nationalId,
    }));
  };

  const savePin = async (pin: string) => db.settings.put({ key: 'app_pin', value: pin });

  return (
    <div className="space-y-3 pb-20">
      <div className="card space-y-2">
        <p className="font-semibold">App Lock PIN</p>
        <input className="input" maxLength={6} placeholder="Set PIN" onBlur={(e) => savePin(e.target.value)} />
      </div>

      <div className="card space-y-2">
        <p className="font-semibold">Import CSV / XLSX Wizard</p>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setRows(await parseWorkbook(file));
        }} />
        <button className="btn-secondary" onClick={autoMap}>Auto-map headers</button>
        {headers.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(mapping) as (keyof ImportRow)[]).map((k) => (
              <select key={k} className="input" value={mapping[k]} onChange={(e) => setMapping((p) => ({ ...p, [k]: e.target.value }))}>
                {headers.map((h) => <option key={h}>{h}</option>)}
              </select>
            ))}
          </div>
        )}
        <button className="btn-primary" onClick={async () => {
          const result = await upsertImportedRows(rows, mapping);
          alert(`Imported. Inserted ${result.inserted}, updated ${result.updated}`);
        }}>Run import</button>
      </div>

      <div className="card space-y-2">
        <p className="font-semibold">Optional PDF text import (paste extracted text)</p>
        <textarea className="input min-h-24" value={pastedText} onChange={(e) => setPastedText(e.target.value)} />
        <button className="btn-secondary" onClick={async () => {
          const parsed = parseCsvText(pastedText);
          setRows(parsed);
          alert('Loaded pasted text as table. Now map columns above.');
        }}>Parse pasted text</button>
      </div>

      <div className="card space-y-2">
        <p className="font-semibold">Backup / Restore</p>
        <button className="btn-secondary" onClick={async () => {
          const blob = await exportFullBackup();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'island-campaign-backup.json';
          a.click();
        }}>Export full backup</button>
        <input type="file" accept="application/json" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await restoreFullBackup(file);
          alert('Backup restored');
        }} />
      </div>

      <div className="card">
        <button className="btn-primary" onClick={() => seedDemoData()}>Generate demo fake data</button>
      </div>
    </div>
  );
}
