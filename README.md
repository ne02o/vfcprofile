# Island Campaign Outreach

Local-first campaign CRM for council elections. Built with React + Vite + TypeScript + Tailwind, Dexie (IndexedDB), Recharts, Leaflet, and SheetJS.

## Features
- Dashboard KPI + category charts
- CRM list with search/filter, triage, bulk category actions, and priority score sorting
- Household grouping and status derivation
- Map view with household markers + clustering + manual pin placement queue
- Planner with filterable visit checklist + nearest-neighbor route ordering
- CSV/XLSX import wizard with header auto-mapping and dedup
- Optional pasted-text import for PDF extracted tables (non-OCR)
- App lock PIN
- Backup/Restore full local database
- Demo fake data generator

## Data model highlights
- `Person`: includes category, confidence, contact status, follow-up fields, volunteer assignment, notes/tags.
- `Household`: auto-grouped by `householdKey = island + houseName`, with derived status priority.
- Dedup strategy:
  1. Primary: `nationalId`
  2. Fallback: `(island + houseName + fullName)`

## Priority Score Formula
Implemented in `src/lib/scoring.ts`:
- Base by category: NoShowRisk/Undecided highest, Support medium, Against/OtherCandidate lowest.
- Boost when not contacted recently.
- Additional boost for NoShowRisk as election date gets closer.
- Household priority boost.
- Follow-up overdue boost.

## Run
```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Import flow
1. Go to **Settings** → **Import CSV/XLSX Wizard**.
2. Upload CSV/XLSX.
3. Auto-map headers (supports variants like `House`, `HouseName`, `NID`, etc.) or map manually.
4. Run import.

## Template
Use `templates/sample_voters_template.csv` as the starter format.

## Privacy
All data is stored locally in browser IndexedDB by default. Export backup periodically from Settings.
