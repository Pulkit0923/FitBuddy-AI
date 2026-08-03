# 🏋️ FitBuddy AI - Personalized Workout & Diet Assistant 🥗

[![Next.js](https://img.shields.io/badge/next.js-v15.2.4-emerald?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/convex-v1.23.0-indigo?style=flat-square)](https://convex.dev/)
[![Gemini](https://img.shields.io/badge/gemini--api-flash-cyan?style=flat-square)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)

FitBuddy AI is a premium, SaaS-inspired workout and diet assistant platform. It leverages advanced conversational AI and the Gemini Flash LLM to build custom fitness programs, design tailored meal plans, and track your metrics in real-time.

## ✨ Features

- **🎙️ AI Voice Coach**: Engage in a real-time voice call with your personal AI assistant to formulate workout splits and nutrition templates.
- **⚙️ Manual Preferences**: Submit your physical stats, restrictions, and target schedules through a sleek form interface.
- **📊 Metric Dashboard**:
  - **Workout Streak**: Tracks active routines dynamically.
  - **Calorie Tracker**: Logs energy milestones.
  - **BMI Calculator**: Compute your Body Mass Index with dynamic color alerts.
  - **Water Intake Tracker**: Track daily hydration targets with an interactive cup counter.
- **📄 Download Plan as PDF**: Export your personalized fitness plans instantly as print-ready A4 PDF documents.
- **🔒 Guest & Profile Modes**: Seamlessly save and view plans under clerk accounts or automatically fall back to guest profiles.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (Turbopack, App Router, React 19)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & Sync**: Convex (Cloud worker nodes, mutations, and queries)
- **AI Integrations**:
  - **Vapi**: Web voice assistant platform.
  - **Google Generative AI**: Gemini LLM SDK for structured program generation.
- **Authentication**: Clerk User Management

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Vapi Voice Assistant Settings
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id

# Convex Cloud Database Configuration
CONVEX_DEPLOYMENT=dev:your_convex_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://your_convex_deployment_name.convex.cloud

# Gemini Generative AI Key
GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Getting Started

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Set up Convex database and push functions
```bash
npx convex dev --once
```

### 3. Run the development server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

## 📦 Production Build

Verify code validity and compile:
```bash
npm run build
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
