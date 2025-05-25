export interface User {
  id: string;
  email: string;
  user_type: "doctor" | "patient";
  name: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  phone?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface Reminder {
  id: string;
  appointment_id: string;
  type: "sms" | "whatsapp" | "email";
  time_before: number; // in minutes
  message: string;
  status: "pending" | "sent" | "failed";
  recipient_type: "doctor" | "patient" | "both";
}

export interface NotificationType {
  value: "sms" | "whatsapp" | "email";
  label: string;
  icon: string;
}

export interface TimeBeforeOption {
  value: number;
  label: string;
}
