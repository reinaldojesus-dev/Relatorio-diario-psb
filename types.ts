

export interface ReportItemState {
  status: 'ok' | 'issue';
  observation: string;
}

export interface ReportSectionData {
  [key:string]: ReportItemState;
}

export interface ReportData {
  [key: string]: ReportSectionData;
}

export interface Report {
  id: string;
  date: string;
  collaborator: string;
  data: ReportData;
}

export interface User {
  email: string;
  name: string;
  password?: string;
}

export interface ChangeLogEntry {
  user: string;
  email: string;
  date: string;
  change: string;
}

export interface LoginHistoryEntry {
  user: string;
  email: string;
  date: string;
}

export interface PreventiveMaintenance {
    id: string;
    equipment: string;
    date: string;
    photo: string;
    collaborator: string;
}

export interface EquipmentLogEntry {
    id: string;
    equipment: string;
    date: string;
    description: string;
}

export enum AppView {
    REPORT,
    PREVENTIVE_FORM,
    PREVENTIVE_LIST
}