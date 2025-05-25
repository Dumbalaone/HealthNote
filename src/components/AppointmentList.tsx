import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  Edit,
  Trash,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Appointment } from "@/lib/types";
import { deleteAppointment } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onAddReminder: (appointmentId: string) => void;
  onRefresh: () => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onEdit,
  onAddReminder,
  onRefresh,
}) => {
  const { userType } = useAuth();
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const { error } = await deleteAppointment(appointmentToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Appointment deleted",
        description: "The appointment has been successfully deleted.",
      });

      onRefresh();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete appointment.",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Scheduled
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (appointments.length === 0) {
    return (
      <Card className="w-full bg-slate-50 border-dashed">
        <CardContent className="pt-6 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-lg font-medium text-slate-900">
            No appointments
          </p>
          <p className="text-sm text-slate-500">
            {userType === "doctor"
              ? "You have no scheduled appointments with patients."
              : "You have no scheduled appointments with doctors."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {userType === "doctor"
                    ? `Appointment with ${appointment.patient?.name}`
                    : `Appointment with Dr. ${appointment.doctor?.name}`}
                </CardTitle>
                <CardDescription>
                  {format(parseISO(appointment.date), "EEEE, MMMM d, yyyy")}
                </CardDescription>
              </div>
              {getStatusBadge(appointment.status)}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center text-sm text-slate-600 mb-3">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {appointment.time} · {appointment.duration} minutes
              </span>
            </div>
            {appointment.notes && (
              <p className="text-sm text-slate-600 mt-2">{appointment.notes}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex items-center">
              {getStatusIcon(appointment.status)}
              <span className="ml-2 text-sm text-slate-500">
                {appointment.status === "scheduled"
                  ? "Upcoming"
                  : appointment.status}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddReminder(appointment.id)}
              >
                <Bell className="mr-2 h-4 w-4" />
                Reminder
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    ...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(appointment)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(appointment)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </Card>
      ))}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the appointment. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
