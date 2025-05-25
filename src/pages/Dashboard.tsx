import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Bell, Clock, Users, User, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getAppointments } from "@/lib/supabase";
import { Appointment } from "@/lib/types";
import { Layout } from "@/components/Layout";
import { AppointmentList } from "@/components/AppointmentList";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/AppointmentForm";
import { ReminderForm } from "@/components/ReminderForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard: React.FC = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");

  const fetchAppointments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await getAppointments(user.id, user.user_type);

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setAppointments(data);

        const currentDate = new Date();
        const upcoming = data.filter(
          (appointment) =>
            appointment.status === "scheduled" &&
            new Date(`${appointment.date}T${appointment.time}`) > currentDate,
        );

        setUpcomingAppointments(
          upcoming
            .sort(
              (a, b) =>
                new Date(`${a.date}T${a.time}`).getTime() -
                new Date(`${b.date}T${b.time}`).getTime(),
            )
            .slice(0, 5),
        );
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load appointments.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, toast]);

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleAddReminder = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setReminderDialogOpen(true);
  };

  const handleAppointmentSuccess = () => {
    setAppointmentDialogOpen(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  const handleReminderSuccess = () => {
    setReminderDialogOpen(false);
    toast({
      title: "Reminder created",
      description: "The reminder has been set successfully.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <Dialog
            open={appointmentDialogOpen}
            onOpenChange={setAppointmentDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedAppointment
                    ? "Edit Appointment"
                    : "Create New Appointment"}
                </DialogTitle>
                <DialogDescription>
                  {selectedAppointment
                    ? "Update the appointment details below."
                    : "Enter the appointment details below."}
                </DialogDescription>
              </DialogHeader>
              <AppointmentForm
                appointment={selectedAppointment || undefined}
                onSuccess={handleAppointmentSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Your next scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-start pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="bg-blue-50 text-blue-700 p-2 rounded-md mr-3">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {userType === "doctor"
                            ? `Appointment with ${appointment.patient?.name}`
                            : `Appointment with Dr. ${appointment.doctor?.name}`}
                        </p>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>
                            {format(new Date(appointment.date), "MMM d")} at{" "}
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-2">
                    No upcoming appointments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Bell className="mr-2 h-5 w-5 text-amber-500" />
                Active Reminders
              </CardTitle>
              <CardDescription>
                Reminders for upcoming appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <Bell className="h-12 w-12 text-amber-400" />
                <p className="text-slate-600 text-center">
                  Reminders are automatically sent based on your appointment
                  schedule
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (upcomingAppointments.length > 0) {
                      handleAddReminder(upcomingAppointments[0].id);
                    } else {
                      toast({
                        title: "No appointments",
                        description:
                          "Create an appointment first to set reminders.",
                      });
                    }
                  }}
                >
                  Configure Reminders
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                {userType === "doctor" ? (
                  <>
                    <Users className="mr-2 h-5 w-5 text-violet-500" />
                    Your Patients
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5 text-violet-500" />
                    Your Profile
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {userType === "doctor"
                  ? "Manage your patient information"
                  : "Your personal information and settings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-xl font-semibold text-slate-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-slate-900">{user?.name}</h3>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/profile">View Profile</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="all">All Appointments</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <AppointmentList
              appointments={upcomingAppointments}
              onEdit={handleEditAppointment}
              onAddReminder={handleAddReminder}
              onRefresh={fetchAppointments}
            />
          </TabsContent>
          <TabsContent value="all">
            <AppointmentList
              appointments={appointments}
              onEdit={handleEditAppointment}
              onAddReminder={handleAddReminder}
              onRefresh={fetchAppointments}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Reminder</DialogTitle>
            <DialogDescription>
              Set up a reminder for this appointment.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointmentId && (
            <ReminderForm
              appointmentId={selectedAppointmentId}
              onSuccess={handleReminderSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
