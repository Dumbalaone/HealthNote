import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gvntiuztwdqymsmucevn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bnRpdXp0d2RxeW1zbXVjZXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDc2NjYsImV4cCI6MjA2MzY4MzY2Nn0.XQuqTVs9tyOec7OcYVaHS0fwVj2ZTR3Rkxrkr80lzM4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common database operations
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signUp = async (
  email: string,
  password: string,
  userData: { user_type: string; name: string },
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });

  if (!error && data.user) {
    // Create a profile based on user type
    const table = userData.user_type === "doctor" ? "doctors" : "patients";

    await supabase.from(table).insert({
      id: data.user.id,
      name: userData.name,
      email: email,
    });
  }

  return { data, error };
};

// Appointment functions
export const getAppointments = async (userId: string, userType: string) => {
  const field = userType === "doctor" ? "doctor_id" : "patient_id";

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      doctors:doctor_id(*),
      patients:patient_id(*)
    `,
    )
    .eq(field, userId);

  return { data, error };
};

export const createAppointment = async (appointment: any) => {
  const { data, error } = await supabase
    .from("appointments")
    .insert(appointment)
    .select();

  return { data, error };
};

export const updateAppointment = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select();

  return { data, error };
};

export const deleteAppointment = async (id: string) => {
  const { error } = await supabase.from("appointments").delete().eq("id", id);

  return { error };
};

// Reminder functions
export const getReminders = async (appointmentId: string) => {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("appointment_id", appointmentId);

  return { data, error };
};

export const createReminder = async (reminder: any) => {
  const { data, error } = await supabase
    .from("reminders")
    .insert(reminder)
    .select();

  return { data, error };
};

export const updateReminder = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("reminders")
    .update(updates)
    .eq("id", id)
    .select();

  return { data, error };
};

export const deleteReminder = async (id: string) => {
  const { error } = await supabase.from("reminders").delete().eq("id", id);

  return { error };
};

// Get all doctors for patient appointment creation
export const getDoctors = async () => {
  const { data, error } = await supabase.from("doctors").select("*");

  return { data, error };
};

// Get all patients for doctor
export const getPatients = async () => {
  const { data, error } = await supabase.from("patients").select("*");

  return { data, error };
};
