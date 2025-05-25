# 🩺 Follow-Up Reminder System

A smart appointment reminder system that helps clinics and private doctors track patient follow-ups automatically. Built with [Builder.io](https://www.builder.io) for frontend and [Supabase](https://supabase.com) for backend services.

---

## 📌 Problem Statement

Clinics and private doctors often lose track of patient follow-ups, resulting in missed appointments, reduced care adherence, and lost revenue. This app solves that by sending automated follow-up reminders to both doctors and patients through SMS, WhatsApp, and other channels.

---

## 🚀 Live App

👉 [**Click here to view the live app**](https://health-note.vercel.app/)  


---

## 🚀 Pitch Deck Template

🎤 .[**Click here to view the pitch deck**](https://www.canva.com/design/DAGoXkHelI8/rx9fu0Vmg9iZMjp1IX6r3A/edit?utm_content=DAGoXkHelI8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton) 

---

## 🧰 Tech Stack

| Tool         | Purpose                                  |
|--------------|-------------------------------------------|
| **Builder.io**   | Visual drag-and-drop UI builder         |
| **Supabase**     | Backend: Auth, database, and API       |
| **Bolt.new**     | Automated messaging (SMS, WhatsApp)    |
| **Lovable.dev**  | Backend logic + auto-generated endpoints |
| **Cursor AI**    | AI-assisted code reviews & fixes       |
| **MGX (optional)**| UI scaffolding / prototyping         |
| **Rork.app (optional)** | Mobile preview / prototyping  |

---

## 🔑 Key Features

- ✅ Doctor and patient portals (separate logins)
- 📅 Follow-up reminder scheduling
- 📲 Auto-send reminders via SMS, WhatsApp, etc.
- 🧠 Uses Supabase Auth and RLS for security
- 🧾 Admin dashboard for clinics to manage patients and appointments

---

## 🗂️ Folder Structure

```bash
/my-app
├── public/
├── src/
│   ├── components/      # Builder.io components
│   ├── views/           # Main views/pages
│   ├── supabase/        # Supabase client setup
│   └── utils/           # Helper functions
├── builder.config.json  # Builder.io config
└── README.md
