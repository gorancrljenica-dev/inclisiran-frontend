# CLAUDE.md — Inclisiran Frontend

Guidance for Claude Code when working in this repository.

---

## Project Overview

Frontend za Inclisiran Dose Tracker — interni medicinski alat za praćenje terapije inkliziranon.

Backend radi na: `http://localhost:3000`
Frontend radi na: `http://localhost:3002` (ili sljedeći slobodni port)

---

## Tech Stack

| Tehnologija | Verzija | Napomena |
|---|---|---|
| Next.js | 16.2.1 | App Router, Turbopack za dev |
| React | 19.2.4 | |
| TypeScript | 5 | strict mode |
| Tailwind CSS | **v3.4** | v4 nije kompatibilan sa Turbopack |
| PostCSS | 8 | postcss.config.js (CommonJS) |
| Fetch | native | bez axiosa |

---

## Kritična napomena — Tailwind

**Tailwind v4 ne radi sa Next.js 16 Turbopack.**

Uvijek koristiti **Tailwind v3**:

- `tailwind.config.js` sa `content` paths
- `postcss.config.js` sa `tailwindcss: {}` i `autoprefixer: {}`
- `globals.css` sa tri direktive:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Ne koristiti `@import "tailwindcss"` (Tailwind v4 sintaksa).

---

## File Structure

```
app/
├── types.ts                        — DashboardEntry, GroupedDashboard, PatientOverview, ScheduleEntry, TherapyWithSchedules
├── globals.css                     — Tailwind directives
├── layout.tsx                      — Root layout
├── page.tsx                        — Redirect → /dashboard
├── hooks/
│   ├── useDashboardData.ts         — Fetch + grupiranje podataka
│   └── usePatientData.ts           — Parallel fetch: overview + schedule + dashboard (za ime)
├── components/
│   ├── SummaryCards.tsx            — Kartice: Kasni / Danas / Nadolazeće
│   ├── StatusBadge.tsx             — Badge sa bojama po statusu
│   ├── PatientCard.tsx             — Kartica pacijenta; ime = link → /patient/[id]
│   ├── PatientList.tsx             — Lista pacijenata sa naslovom i empty state
│   ├── RecordDoseModal.tsx         — Modal za unos doze (POST /dose)
│   ├── PatientHeader.tsx           — Ime + ID + ← Povratak na Dashboard button
│   ├── PatientStatus.tsx           — Dominantni status blok (kasni=crveni, on track=zeleni)
│   ├── ScheduleList.tsx            — Raspored doza sa status pillovima (6 stanja)
│   └── DoseHistory.tsx             — Historija izvrseno doza, sortirano DESC
├── dashboard/
│   └── page.tsx                    — Dashboard: header + "+ Novi pacijent" link
├── patient/
│   ├── [id]/
│   │   └── page.tsx                — Patient detail: decodeURIComponent(id), overview + schedule + history
│   └── new/
│       └── page.tsx                — Forma: kreiraj pacijenta + pokreni terapiju + opcionalni lipidi
└── utils/
    └── formatDate.ts               — YYYY-MM-DD → DD.MM.YYYY
tailwind.config.js                  — content: ["./app/**/*.{js,ts,jsx,tsx}"]
postcss.config.js                   — tailwindcss + autoprefixer (CommonJS format)
next.config.ts                      — Proxy rewrite: /api/* → http://localhost:3000/*
```

---

## API Endpoints (korišteni)

| Endpoint | Gdje | Svrha |
|---|---|---|
| `GET /dashboard` | `useDashboardData` | Lista kasni + na_redu pacijenata |
| `POST /dose` | `RecordDoseModal` | Unos doze |
| `GET /patient/:id/overview` | `usePatientData` | Status, zadnja/sljedeća doza, aktivna terapija |
| `GET /schedule/:patient_id` | `usePatientData` | Sve terapije i raspored doza |
| `POST /patients` | `/patient/new` | Kreiranje pacijenta (`{ id, ime_prezime }`) |
| `POST /therapy/start` | `/patient/new` | Pokretanje terapije (`{ patient_id, start_date }`) |

**Nema GET /patients endpointa u backendu.** Ime pacijenta se dobiva iz `GET /dashboard` (filter po `patient_id`).

**GET /reports/historical** vraća aggregate po mjesecu bez `patient_id` — ne može se filtrirati per-patient. Historija doza se čita iz `izvrseno` entries u `GET /schedule/:patient_id`.

---

## Backend Response Shape

### GET /dashboard

```typescript
{
  patient_id: string;
  ime_prezime: string;
  therapy_id: string;
  schedule_id: string;
  planned_date: string; // YYYY-MM-DD
  type: string;
  status: "kasni" | "na_redu";
}[]
```

### POST /dose — Body

```typescript
{
  therapy_id: string;
  actual_date: string; // YYYY-MM-DD, ne smije biti u budućnosti
}
```

---

## Proxy Setup

`next.config.ts` rewrite prosljeđuje sve `/api/*` pozive na `http://localhost:3000/*`:

```ts
rewrites() {
  return [{ source: "/api/:path*", destination: "http://localhost:3000/:path*" }]
}
```

Fetch pozivi u frontend kodu uvijek koriste `/api/...` prefiks.

---

## Data Layer

`useDashboardData` hook:

1. Fetcha `GET /dashboard` (jedna ruta)
2. Grupira entries po logici:
   - `status === "kasni"` → `overdue`
   - `status === "na_redu"` + `planned_date === today` → `today`
   - `status === "na_redu"` + `planned_date > today` → `upcoming`
3. Vraća `{ data, loading, error, refresh }`

**Ne mijenjati grupiranje bez razumijevanja backend logike.** `kasni`/`na_redu` su computed statusi iz backend `getEffectiveScheduleStatus()`.

---

## Patient Detail — /patient/[id]

**Kritično:** `decodeURIComponent(id)` — uvijek dekodiraj route param prije API poziva i prikaza.

Ime pacijenta nije dostupno u overview/schedule endpointima — fetchamo `GET /dashboard` i filtriramo po `patient_id`.

Dose history = `izvrseno` entries iz `GET /schedule/:patient_id` (ne koristiti `/reports/historical`).

Status blok je vizualno dominantan:
- `overdue` → `border-2 border-red-400`, naslov `text-2xl font-bold text-red-700`
- `on_track` → `border border-green-300`, naslov `text-2xl font-bold text-green-700`

---

## Add Patient — /patient/new

Sekvencijalni flow:
1. `POST /api/patients` → dobije `{ id, ime_prezime, created_at }`
2. `POST /api/therapy/start` s `patient_id` iz koraka 1
3. Redirect → `/patient/[id]`

Lipidi su opcionalni (collapsible sekcija) — nisu implementirani u backendu, čuvaju se samo u frontend stanju. Polja: ukupni kolesterol, LDL, HDL, trigliceridi, datum mjerenja.

---

## Dashboard Struktura

```
Header (naslov + osvježi)
SummaryCards (Kasni | Danas | Nadolazeće)

Section: Za akciju
  Subsection: Kasni (crveni label) — overdue entries
  Subsection: Danas (žuti label)   — today entries
  [hidden ako nema entries]

Section: Sljedeće
  upcoming entries (na_redu, planned_date > today)
```

---

## StatusBadge boje

| Status | Boja |
|---|---|
| `kasni` | Crvena (bg-red-100 text-red-700) |
| `danas` | Žuta (bg-yellow-100 text-yellow-700) |
| `nadolazece` | Plava (bg-blue-100 text-blue-700) |

---

## RecordDoseModal — Flow

1. Otvara se klikom na "Unesi dozu"
2. Default datum = danas, max = danas (ne može budući datum)
3. Na submit: button disabled, prikazuje "Spremanje..."
4. Na uspjeh: prikazuje zelenu potvrdu "Doza uspješno unesena ✓", zatvara se nakon 1.5s, refresha dashboard
5. Na grešku: prikazuje poruku sa backend error tekstom

---

## Pokretanje

```bash
# Terminal 1 — Backend
cd C:\Users\Elma\Inclisiran_Dose_Tracker
node src/server.js

# Terminal 2 — Frontend
cd C:\Users\Elma\inclisiran-frontend
npm run dev
```

Backend mora biti pokrenut PRIJE otvaranja dashboarda.

---

## Implementirani Sprintovi

| Sprint | Status | Opis |
|---|---|---|
| Sprint 1 — Dashboard | ✅ DONE | Prikaz pacijenata, grupiranje, unos doze, feedback |
| Playwright Testing | ✅ DONE | 7/7 testova prolazi, headless Chromium |
| Sprint 2 — Patient Detail | ✅ DONE | /patient/[id]: status blok, raspored, historija, unos doze |
| Sprint 3 — Add Patient | ✅ DONE | /patient/new: kreiranje pacijenta + terapija + opcionalni lipidi |

---

## Testing — Playwright

### Setup

| Paket | Verzija |
|---|---|
| `@playwright/test` | ^1.58.2 |
| Browser | Chromium (headless) |
| Config | `playwright.config.ts` |
| Testovi | `tests/dashboard.spec.ts` |

### Pokretanje

```bash
# Backend i frontend moraju biti pokrenuti PRIJE testova
npm test          # headless, list reporter
npm run test:ui   # Playwright UI mode (interaktivno)
```

### Testovi (7/7)

| Test | Opis |
|---|---|
| `ucitava dashboard stranicu` | h1 vidljiv, sadrži "Inclisiran" |
| `prikazuje summary kartice` | 3x `[data-testid="summary-card"]` |
| `prikazuje sekciju Za akciju ili Nema pacijenata` | jedan od dva teksta vidljiv |
| `osvjezi button postoji i klikabilan je` | button "Osvježi" radi |
| `otvara modal klikom na Unesi dozu` | `role="dialog"` vidljiv, heading provjeren |
| `modal sadrzi date input i submit button` | date input + "Potvrdi dozu" button |
| `modal se zatvara klikom na X` | X button zatvara modal |

### Kritična napomena — beforeEach

```typescript
await page.waitForSelector('[data-testid="summary-card"]', { timeout: 15000 });
```

**Ne koristiti `networkidle` ni `waitForSelector('h1, p')`.**
- `networkidle` timeouta (API poziv blokira)
- `waitForSelector('h1, p')` hvata "Učitavanje..." paragraf prerano

`[data-testid="summary-card"]` se pojavljuje tek kad API vrati podatke — siguran signal da je dashboard spreman.

### data-testid atributi

| Komponenta | Atribut |
|---|---|
| `SummaryCards.tsx` | `data-testid="summary-card"` na svakoj kartici |
| `RecordDoseModal.tsx` | `role="dialog"` na overlay divu, `aria-label="Zatvori"` na X buttonu |

---

## Non-Negotiable Constraints

1. **Ne dodavati axios ili druge HTTP biblioteke** — samo native fetch
2. **Ne dodavati state management biblioteke** — samo React useState/hooks
3. **Ne dodavati UI biblioteke** — samo Tailwind utility klase
4. **Tailwind v3** — ne upgradati na v4 dok Turbopack ne dobije punu podršku
5. **postcss.config.js mora biti CommonJS** — `.mjs` ne čita Turbopack
6. **Svi API pozivi idu kroz `/api/` proxy** — direktni pozivi na localhost:3000 uzrokuju CORS greške
