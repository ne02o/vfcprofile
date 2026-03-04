export type Category =
  | 'Support'
  | 'Undecided'
  | 'Against'
  | 'NoShowRisk'
  | 'OtherCandidate'
  | 'Unknown';

export type ContactMethod = 'In-person' | 'Call' | 'WhatsApp' | 'Family link' | null;
export type VisitStatus = 'NotVisited' | 'Visited' | 'Callback' | 'Resolved';

export interface Person {
  id: string;
  island: string;
  houseName: string;
  fullName: string;
  sex: 'M' | 'F' | null;
  nationalId: string;
  phone?: string;
  addressText?: string;
  area?: string;
  lat?: number;
  lng?: number;
  householdKey: string;
  category: Category;
  confidence: 1 | 2 | 3 | 4 | 5;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  contactMethod: ContactMethod;
  influencer?: string;
  assignedVolunteer?: string;
  visitStatus: VisitStatus;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  householdKey: string;
  island: string;
  houseName: string;
  memberIds: string[];
  householdStatus: 'Priority' | 'LeaningSupport' | 'Opposition' | 'Unknown';
  notes?: string;
  lat?: number;
  lng?: number;
  updatedAt: string;
}

export interface ImportRow {
  island: string;
  houseName: string;
  fullName: string;
  sex?: string;
  nationalId?: string;
}
