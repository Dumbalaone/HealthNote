import React, { useState } from "react";
import { Bell, Smartphone, MessageSquare, Mail, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Layout } from "@/components/Layout";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const Settings: React.FC = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();

  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [defaultReminderTime, setDefaultReminderTime] = useState("60");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = () => {
    setSaving(true);

    // Simulating an API call
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
      setSaving(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">
            Manage your account and notification preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive appointment reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-slate-500" />
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                  <Label htmlFor="whatsapp-notifications">
                    WhatsApp Notifications
                  </Label>
                </div>
                <Switch
                  id="whatsapp-notifications"
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label htmlFor="default-reminder-time">
                  Default Reminder Time
                </Label>
                <Select
                  value={defaultReminderTime}
                  onValueChange={setDefaultReminderTime}
                >
                  <SelectTrigger id="default-reminder-time">
                    <SelectValue placeholder="Select when to send reminders by default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="120">2 hours before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                    <SelectItem value="2880">2 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number">
                  Phone Number for SMS/WhatsApp
                </Label>
                <Input
                  id="phone-number"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Used for SMS and WhatsApp notifications
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={user?.name || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-type">Account Type</Label>
                  <Input
                    id="account-type"
                    value={
                      userType === "doctor" ? "Healthcare Provider" : "Patient"
                    }
                    readOnly
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Healthnote+</CardTitle>
                <CardDescription>Application information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Healthnote+ v1.0.0</p>
                    <p className="text-xs text-slate-500">
                      Appointment Reminder System
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm">
                    Healthnote+ helps healthcare providers and patients manage
                    appointments and stay on top of schedules with automated
                    reminders.
                  </p>
                  <p className="text-xs text-slate-500">
                    © 2023 Healthnote+ | All rights reserved
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
