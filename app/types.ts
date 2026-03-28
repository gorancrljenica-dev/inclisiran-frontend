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
