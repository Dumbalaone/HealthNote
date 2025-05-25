import React from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-500 p-1.5 mr-2">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Healthnote+
            </span>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Never Miss a Medical Appointment Again
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Healthnote+ automates appointment reminders for healthcare
                providers and patients, sending timely notifications via SMS,
                WhatsApp, or email.
              </p>
              <div className="flex space-x-4">
                <Button size="lg" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl flex-shrink-0">
              <div className="w-80 h-64 rounded-lg bg-blue-500 p-6 text-white flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-medium">Appointment Reminder</h3>
                    <p className="text-blue-100 text-sm">Dr. Sarah Johnson</p>
                  </div>
                  <Bell className="h-6 w-6" />
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Tomorrow, 10:00 AM</span>
                  </div>
                  <p className="text-sm text-blue-100">
                    Don't forget your appointment at City Medical Center. Please
                    arrive 15 minutes early.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How Healthnote+ Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A simple solution for healthcare providers and patients to stay
              connected and on schedule
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Schedule Appointments
              </h3>
              <p className="text-slate-600">
                Easily create and manage appointments for patients with a few
                clicks.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Automate Reminders
              </h3>
              <p className="text-slate-600">
                Set up automatic reminders to be sent via SMS, WhatsApp, or
                email at the perfect time.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Reduce No-Shows
              </h3>
              <p className="text-slate-600">
                Significantly decrease missed appointments with timely reminders
                to patients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to streamline your appointment process?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join Healthnote+ today and never worry about missed appointments
            again.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register" className="flex items-center">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="rounded-full bg-blue-500 p-1.5 mr-2">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Healthnote+</span>
            </div>
            <div className="text-sm">
              © 2023 Healthnote+ | All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
