import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  getDoctors,
  getPatients,
  createAppointment,
  updateAppointment,
} from "@/lib/supabase";
import { Appointment, Doctor, Patient } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  doctor_id: z.string().min(1, { message: "Doctor is required" }),
  patient_id: z.string().min(1, { message: "Patient is required" }),
  date: z.date({ required_error: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  duration: z.coerce
    .number()
    .min(5, { message: "Duration must be at least 5 minutes" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  onSuccess?: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onSuccess,
}) => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: appointment
      ? {
          doctor_id: appointment.doctor_id,
          patient_id: appointment.patient_id,
          date: new Date(appointment.date),
          time: appointment.time,
          duration: appointment.duration,
          notes: appointment.notes || "",
        }
      : {
          doctor_id: userType === "doctor" ? user?.id || "" : "",
          patient_id: userType === "patient" ? user?.id || "" : "",
          duration: 30,
          notes: "",
        },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userType === "patient" || (userType === "doctor" && !appointment)) {
          const { data: doctorsData } = await getDoctors();
          if (doctorsData) setDoctors(doctorsData);
        }

        if (userType === "doctor" || (userType === "patient" && !appointment)) {
          const { data: patientsData } = await getPatients();
          if (patientsData) setPatients(patientsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load doctors and patients.",
        });
      }
    };

    fetchData();
  }, [toast, userType, user, appointment]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const appointmentData = {
        doctor_id: values.doctor_id,
        patient_id: values.patient_id,
        date: format(values.date, "yyyy-MM-dd"),
        time: values.time,
        duration: values.duration,
        notes: values.notes,
        status: "scheduled",
      };

      let result;
      if (appointment) {
        result = await updateAppointment(appointment.id, appointmentData);
      } else {
        result = await createAppointment(appointmentData);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: `Appointment ${appointment ? "updated" : "created"}`,
        description: `The appointment has been successfully ${appointment ? "updated" : "created"}.`,
      });

      if (onSuccess) {
        onSuccess();
      }

      form.reset();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${appointment ? "update" : "create"} appointment.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {userType === "patient" && (
          <FormField
            control={form.control}
            name="doctor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}{" "}
                        {doctor.specialty ? `(${doctor.specialty})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {userType === "doctor" && (
          <FormField
            control={form.control}
            name="patient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="Select time"
                      {...field}
                      className="pl-10"
                    />
                  </FormControl>
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" min="5" step="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about the appointment"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Saving..."
            : appointment
              ? "Update Appointment"
              : "Create Appointment"}
        </Button>
      </form>
    </Form>
  );
};
