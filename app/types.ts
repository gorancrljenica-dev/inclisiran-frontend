// Matches exactly what GET /dashboard returns
export interface DashboardEntry {
  patient_id: string;
  ime_prezime: string;
  therapy_id: string;
  schedule_id: string;
  planned_date: string; // YYYY-MM-DD
  type: string;
  status: "kasni" | "na_redu";
}

export interface GroupedDashboard {
  overdue: DashboardEntry[];
  today: DashboardEntry[];
  upcoming: DashboardEntry[];
}

// GET /patient/:id/overview
export interface PatientOverview {
  patient_id: string;
  active_therapy: {
    id: string;
    start_date: string;
    status: string;
  } | null;
  last_dose: {
    planned_date: string;
    schedule_id: string;
  } | null;
  next_dose: {
    planned_date: string;
    schedule_id: string;
    delayed_days: number | null;
  } | null;
  status:
    | { label: "overdue" | "on_track"; reason: string; delayed_days: number | null }
    | "no_active_therapy";
}

// GET /schedule/:patient_id
export interface ScheduleEntry {
  id: string;
  therapy_id: string;
  planned_date: string; // YYYY-MM-DD
  type: string;
  order_index: number;
  status: string; // computed by backend: planirano|na_redu|kasni|izvrseno|propusteno|reset_potreban
}

export interface TherapyWithSchedules {
  therapy: {
    id: string;
    patient_id: string;
    start_date: string;
    status: string;
  };
  schedules: ScheduleEntry[];
}
