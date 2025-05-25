import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getAppointments } from "@/lib/supabase";
import { Appointment } from "@/lib/types";
import { Layout } from "@/components/Layout";
import { AppointmentList } from "@/components/AppointmentList";
import { AppointmentForm } from "@/components/AppointmentForm";
import { ReminderForm } from "@/components/ReminderForm";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Appointments: React.FC = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");
  const [activeTab, setActiveTab] = useState("all");

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
        filterAppointments(data, date, activeTab);
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

  const filterAppointments = (
    appointmentsToFilter: Appointment[],
    selectedDate?: Date,
    tab = "all",
  ) => {
    let filtered = [...appointmentsToFilter];

    // Filter by date if selected
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter(
        (appointment) => appointment.date === dateString,
      );
    }

    // Filter by status based on active tab
    if (tab !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === tab);
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateCompare =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, toast]);

  useEffect(() => {
    if (appointments.length > 0) {
      filterAppointments(appointments, date, activeTab);
    }
  }, [date, activeTab]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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

  const clearFilters = () => {
    setDate(undefined);
    setActiveTab("all");
    filterAppointments(appointments, undefined, "all");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
            <p className="text-slate-600">
              Manage and schedule your appointments
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

        <div className="flex flex-col md:flex-row items-start gap-4 pb-6">
          <div className="w-full md:w-auto flex-shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          {(date || activeTab !== "all") && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <AppointmentList
            appointments={filteredAppointments}
            onEdit={handleEditAppointment}
            onAddReminder={handleAddReminder}
            onRefresh={fetchAppointments}
          />
        )}
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

export default Appointments;
