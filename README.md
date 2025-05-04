HabitVault
Live Demo: https://habit-vault-dd7b9.web.app/

A clean, focused MVP for tracking daily habits. HabitVault helps you build consistency through simple check‑ins, streak counters, calendar heatmaps, and performance charts. All data is scoped to the authenticated user via Firebase Auth & Firestore.

🚀 Features
Email/Password Authentication: Secure sign‑up & sign‑in

Add & Manage Habits: Name, schedule (every day, weekdays, custom), start date

Daily Check‑Ins: One‑click toggle for “Completed” or “Missed”

Streak Counters: Current streak & longest streak per habit

Calendar Heatmap: 6‑month rolling view of daily completions

Analytics Dashboard:

Daily completion bar chart (week/month)

Overall completion pie chart

Table of each habit’s completion rate

User Settings: Dark mode, daily reminder time, week‑start day

Local Persistence: State stored in localStorage and Firestore

📦 Tech Stack
Frontend: React 18 + Vite + TypeScript + Tailwind CSS

Charts: Recharts, react-calendar-heatmap

Date Utilities: date-fns

Backend: Firebase Auth & Firestore

Hosting: Firebase Hosting
