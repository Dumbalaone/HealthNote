import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MessageSquare, Smartphone, Mail } from "lucide-react";
import { Reminder, NotificationType, TimeBeforeOption } from "@/lib/types";
import { createReminder, updateReminder } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  type: z.enum(["sms", "whatsapp", "email"]),
  time_before: z.coerce.number().min(5),
  message: z.string().min(1, { message: "Message is required" }),
  recipient_type: z.enum(["doctor", "patient", "both"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ReminderFormProps {
  appointmentId: string;
  reminder?: Reminder;
  onSuccess?: () => void;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({
  appointmentId,
  reminder,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const notificationTypes: NotificationType[] = [
    { value: "sms", label: "SMS", icon: "Smartphone" },
    { value: "whatsapp", label: "WhatsApp", icon: "MessageSquare" },
    { value: "email", label: "Email", icon: "Mail" },
  ];

  const timeBeforeOptions: TimeBeforeOption[] = [
    { value: 15, label: "15 minutes before" },
    { value: 30, label: "30 minutes before" },
    { value: 60, label: "1 hour before" },
    { value: 120, label: "2 hours before" },
    { value: 1440, label: "1 day before" },
    { value: 2880, label: "2 days before" },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: reminder
      ? {
          type: reminder.type,
          time_before: reminder.time_before,
          message: reminder.message,
          recipient_type: reminder.recipient_type,
        }
      : {
          type: "sms",
          time_before: 60,
          message: "Reminder: You have an appointment coming up.",
          recipient_type: "patient",
        },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const reminderData = {
        appointment_id: appointmentId,
        type: values.type,
        time_before: values.time_before,
        message: values.message,
        recipient_type: values.recipient_type,
        status: "pending",
      };

      let result;
      if (reminder) {
        result = await updateReminder(reminder.id, reminderData);
      } else {
        result = await createReminder(reminderData);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: `Reminder ${reminder ? "updated" : "created"}`,
        description: `The reminder has been successfully ${reminder ? "updated" : "created"}.`,
      });

      if (onSuccess) {
        onSuccess();
      }

      if (!reminder) {
        form.reset();
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${reminder ? "update" : "create"} reminder.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "MessageSquare":
        return <MessageSquare className="h-4 w-4" />;
      case "Smartphone":
        return <Smartphone className="h-4 w-4" />;
      case "Mail":
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {notificationTypes.map((type) => (
                    <div
                      key={type.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={type.value}
                        id={`type-${type.value}`}
                      />
                      <Label
                        htmlFor={`type-${type.value}`}
                        className="flex items-center gap-2"
                      >
                        {getIconComponent(type.icon)}
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Choose how the reminder will be sent.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time_before"
          render={({ field }) => (
            <FormItem>
              <FormLabel>When to Send</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select when to send the reminder" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeBeforeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                How long before the appointment the reminder should be sent.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the reminder message"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The message that will be sent in the reminder. You can use{" "}
                {"{doctor_name}"}, {"{patient_name}"}, {"{date}"}, and{" "}
                {"{time}"} as placeholders.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recipient_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Send To</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who should receive the reminder" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="patient">Patient Only</SelectItem>
                  <SelectItem value="doctor">Doctor Only</SelectItem>
                  <SelectItem value="both">Both Doctor and Patient</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose who should receive this reminder.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Saving..."
            : reminder
              ? "Update Reminder"
              : "Create Reminder"}
        </Button>
      </form>
    </Form>
  );
};
