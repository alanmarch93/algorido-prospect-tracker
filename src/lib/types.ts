export type Stage = "Outreach" | "Contacted" | "Interested" | "Demo Set" | "Converted" | "Lost";
export type LeadSource = "LinkedIn" | "Twitter" | "Referral" | "Cold Email" | "Event" | "Other";
export type ActivityType = "note" | "email" | "call" | "demo" | "status_change" | "created";

export interface Prospect {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  company_name: string;
  website: string | null;
  stage: Stage;
  lead_source: LeadSource;
  score: number;
  notes: string | null;
  account_value: number;
  amount_invested: number | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  prospect_id: string;
  user_id: string;
  type: ActivityType;
  title: string;
  body: string | null;
  created_at: string;
}
