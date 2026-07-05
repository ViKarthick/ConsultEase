# ConsultEase

**Consultancy Project Data Acquisition & Management System**

ConsultEase is a full-stack, serverless web platform that helps academic institutions record, track, and manage faculty consultancy projects. It replaces spreadsheets, emails, and physical paperwork with a single system for project submission, document storage, deadline reminders, and administrative oversight — built on **React** for the frontend and **Google Apps Script + Google Sheets + Google Drive** for the backend.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MUI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Backend-Google%20Apps%20Script-4285F4?logo=googlesheets&logoColor=white)
![License](https://img.shields.io/badge/license-Unlicensed-lightgrey)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Setup (Google Apps Script)](#backend-setup-google-apps-script)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [Known Limitations & Roadmap](#known-limitations--roadmap)
- [Contributing](#contributing)

---

## Overview

Academic consultancy projects involve coordinating project details, financial data, supporting documents, and deadlines across many faculty members. Manual tracking through spreadsheets and email is error-prone and hard to audit.

ConsultEase centralizes this workflow with:
- Role-based logins for **faculty** and **admin** users
- A structured project intake form with PDF document upload
- Faculty and admin dashboards with filtering, export, and bulk actions
- Automated email notifications and deadline reminders

The system is intentionally **serverless** — Google Sheets acts as the database and Google Drive as file storage, both driven through Google Apps Script web app endpoints, so there's no dedicated backend server or database to host.

## Key Features

### Role-Based Authentication
- Faculty login validated against credentials stored in Google Sheets.
- A dedicated admin login path for institution-wide monitoring and control.
- New faculty can self-register; registration data is written directly to the Sheet.

### Faculty Dashboard (`ProjectsDashboard.jsx`)
- Shows only the projects belonging to the logged-in faculty member.
- Add, edit, and delete consultancy projects.
- Filter by academic year, industry, amount, and faculty name.
- Export filtered results to CSV.

### Consultancy Project Form (`ConsultancyForm.jsx`)
- Captures project title, industry, academic year, investigators, financial details, and summary.
- Uploads bills and agreements as PDFs directly to Google Drive.
- Supports edit mode with pre-filled data for existing projects.
- Client-side validation with toast notifications on submit.

### Admin Dashboard (`AdminDashboard.jsx`)
- Institution-wide view of all submitted consultancy projects.
- Filtering by academic year, investigator, industry, and funding range.
- Per-project actions plus bulk deletion.
- Faculty ↔ project mapping for oversight.
- Export project or user lists to Excel/CSV (via `xlsx` and `jspdf`).

### Automated Email Workflow
- Confirmation emails when a project is added or updated.
- Periodic reminders as a deadline approaches, plus a final reminder on the due date.
- Missed-deadline alerts.
- Implemented with Apps Script time-based triggers and `MailApp`.

### Centralized Document Management
- Faculty upload agreements/bills as PDFs, stored in a controlled Google Drive folder.
- Only the resulting file URL is stored in the Sheet, keeping row data lightweight.
- Deleting a project or user moves its associated files to Drive trash rather than orphaning them.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Material UI (MUI) 7, react-toastify |
| Exports | `xlsx`, `jspdf` / `jspdf-autotable` |
| Backend | Google Apps Script (deployed as web apps) |
| Database | Google Sheets |
| File storage | Google Drive |
| Email | Apps Script `MailApp` with time-based triggers |

## Project Structure

```
ConsultEase/
├── public/
│   └── index.html
├── src/
│   ├── App.js                  # Route definitions
│   ├── index.js                # React entry point
│   ├── Login.jsx / Login.css
│   ├── Register.jsx
│   ├── ConsultancyForm.jsx / ConsultancyForm.css
│   ├── ProjectsDashboard.jsx / ProjectsDashboard.css   # Faculty dashboard
│   └── AdminDashboard.jsx / AdminDashboard.css
├── appscipt.js                 # Google Apps Script backend (Sheets/Drive/Mail logic)
├── appscript1.js                # Additional Apps Script backend logic
├── package.json
└── README.md
```

> **Note:** `appscipt.js` and `appscript1.js` are not run by the React app directly — they're the source for the Google Apps Script projects that must be deployed separately as web apps (see below).

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ and npm
- A Google account with access to Google Sheets, Drive, and Apps Script

### Installation

```bash
git clone https://github.com/ViKarthick/ConsultEase.git
cd ConsultEase
npm install
npm start
```

The app runs on [http://localhost:3000](http://localhost:3000) by default (via `react-scripts start`).

## Backend Setup (Google Apps Script)

The frontend talks to one or more Google Apps Script **web app** deployments instead of a traditional REST API:

1. Create a Google Sheet to act as the database (e.g. with a `Sheet1` tab for projects and a users/logins tab).
2. Open **Extensions → Apps Script** in that Sheet and paste in the contents of `appscipt.js` (and `appscript1.js` if you're splitting responsibilities, e.g. auth vs. project CRUD).
3. Run `initialSetup()` once to bind the script to the active spreadsheet (`scriptProp.setProperty('key', ...)`).
4. Create/target a Google Drive folder for uploaded documents and update the folder ID used by `uploadToDrive()`.
5. Deploy the script as a **Web App** (`Deploy → New deployment → Web app`), with access set to "Anyone" (or "Anyone with the account" depending on your institution's requirements).
6. Copy each deployment's `/exec` URL — you'll need it in the frontend configuration step below.

## Configuration

Currently, the Apps Script `/exec` URLs are **hardcoded directly** inside the components that call them (`Login.jsx`, `Register.jsx`, `ConsultancyForm.jsx`, `ProjectsDashboard.jsx`, `AdminDashboard.jsx`). To point the app at your own backend:

1. Deploy your own Apps Script web app(s) as described above.
2. Replace the `scriptUrl` (and any additional `scriptUrl1`, etc.) constants in each of the files above with your deployment URLs.

**Suggested improvement:** move these URLs into a single `.env` file (e.g. `REACT_APP_LOGIN_API`, `REACT_APP_PROJECTS_API`, `REACT_APP_ADMIN_API`) and reference them via `process.env`, so the same codebase can be redeployed against different Sheets without editing source files.

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Runs the app in development mode at `localhost:3000` |

> The current `package.json` only defines a `start` script. Consider adding `build`, `test`, and `eject` (standard for Create React App) if not already present locally.


## Contributing

1. Fork the repo and create a feature branch.
2. Keep frontend changes in `src/` and backend/Apps Script changes in `appscipt.js` / `appscript1.js` in sync with your deployed web apps.
3. Open a pull request describing the change and any new Apps Script deployment steps it requires.

---

*Built to reduce manual workload and improve transparency in academic consultancy project tracking.*
