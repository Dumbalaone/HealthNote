import React, { useState, useEffect } from "react";
import {
  Bell,
  Loader2,
  Check,
  X,
  MessageSquare,
  Smartphone,
  Mail,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getAppointments, getReminders, deleteReminder } from "@/lib/supabase";
import { Appointment, Reminder } from "@/lib/types";
import { Layout } from "@/components/Layout";
import { ReminderForm } from "@/components/ReminderForm";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ReminderWithAppointment extends Reminder {
  appointment?: Appointment;
}

const Reminders: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<ReminderWithAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null,
  );
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all appointments
      const { data: appointmentsData, error: appointmentsError } =
        await getAppointments(user.id, user.user_type);

      if (appointmentsError) {
        throw new Error(appointmentsError.message);
      }

      if (appointmentsData) {
        setAppointments(appointmentsData);

        // Get reminders for all appointments
        const allReminders: ReminderWithAppointment[] = [];

        for (const appointment of appointmentsData) {
          const { data: reminderData, error: reminderError } =
            await getReminders(appointment.id);

          if (reminderError) {
            console.error(
              `Error fetching reminders for appointment ${appointment.id}:`,
              reminderError,
            );
            continue;
          }

          if (reminderData) {
            const remindersWithAppointment = reminderData.map((reminder) => ({
              ...reminder,
              appointment,
            }));

            allReminders.push(...remindersWithAppointment);
          }
        }

        setReminders(allReminders);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reminders.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, toast]);

  const handleCreateReminder = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedReminder(null);
    setReminderDialogOpen(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedAppointmentId(reminder.appointment_id);
    setSelectedReminder(reminder);
    setReminderDialogOpen(true);
  };

  const handleDeleteReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteReminder = async () => {
    if (!selectedReminder) return;

    try {
      const { error } = await deleteReminder(selectedReminder.id);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Reminder deleted",
        description: "The reminder has been successfully deleted.",
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete reminder.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReminder(null);
    }
  };

  const handleReminderSuccess = () => {
    setReminderDialogOpen(false);
    fetchData();
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "sms":
        return <Smartphone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Pending
          </Badge>
        );
      case "sent":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTimeBeforeText = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes before`;
    } else if (minutes === 60) {
      return "1 hour before";
    } else if (minutes < 1440) {
      return `${minutes / 60} hours before`;
    } else if (minutes === 1440) {
      return "1 day before";
    } else {
      return `${minutes / 1440} days before`;
    }
  };

  const filteredReminders =
    filterStatus === "all"
      ? reminders
      : reminders.filter((reminder) => reminder.status === filterStatus);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reminders</h1>
            <p className="text-slate-600">Manage your appointment reminders</p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reminders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleCreateReminder(value)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Create new reminder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" disabled>
                  Select an appointment
                </SelectItem>
                {appointments
                  .filter((appointment) => appointment.status === "scheduled")
                  .map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {appointment.doctor?.name && appointment.patient?.name
                        ? `Dr. ${appointment.doctor.name} / ${appointment.patient.name}`
                        : `Appointment on ${appointment.date}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredReminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getNotificationTypeIcon(reminder.type)}
                      {reminder.type.charAt(0).toUpperCase() +
                        reminder.type.slice(1)}{" "}
                      Reminder
                    </CardTitle>
                    {getStatusBadge(reminder.status)}
                  </div>
                  <CardDescription>
                    {reminder.appointment?.date && (
                      <>
                        For appointment on {reminder.appointment.date} at{" "}
                        {reminder.appointment.time}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="text-sm text-slate-600">
                      <strong>Timing:</strong>{" "}
                      {getTimeBeforeText(reminder.time_before)}
                    </div>
                    <div className="text-sm text-slate-600">
                      <strong>Send to:</strong>{" "}
                      {reminder.recipient_type === "both"
                        ? "Both doctor and patient"
                        : reminder.recipient_type === "doctor"
                          ? "Doctor only"
                          : "Patient only"}
                    </div>
                    <div className="text-sm text-slate-600 p-2 bg-slate-50 rounded-md mt-2">
                      "{reminder.message}"
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditReminder(reminder)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDeleteReminder(reminder)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="w-full bg-slate-50 border-dashed">
            <CardContent className="pt-6 text-center">
              <Bell className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-lg font-medium text-slate-900">
                No reminders found
              </p>
              <p className="text-sm text-slate-500 mb-4">
                You haven't set up any reminders for your appointments yet.
              </p>
              {appointments.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleCreateReminder(appointments[0].id)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first reminder
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReminder ? "Edit Reminder" : "Create New Reminder"}
            </DialogTitle>
            <DialogDescription>
              {selectedReminder
                ? "Update the reminder details below."
                : "Set up a reminder for this appointment."}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointmentId && (
            <ReminderForm
              appointmentId={selectedAppointmentId}
              reminder={selectedReminder || undefined}
              onSuccess={handleReminderSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this reminder. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReminder}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Reminders;
