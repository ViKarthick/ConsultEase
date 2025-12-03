# ConsultEase – Consultancy Project Data Acquisition & Management System

ConsultEase is a full-stack, web-based platform designed to streamline the recording, tracking, and management of consultancy projects within academic institutions.  
It replaces manual paperwork and fragmented data storage with an integrated system built using **React**, **Google Apps Script**, **Google Sheets**, and **Google Drive**.  
The platform supports role-based access, automated reminders, real-time dashboards, and secure document management.

---

## Overview

Academic consultancy projects require coordinated handling of project details, financial information, documentation, and deadlines.  
Most institutions rely on spreadsheets, emails, and physical files, making the process error-prone and time-consuming.

ConsultEase provides a centralized solution that automates core workflows, ensures data consistency, and improves administrative efficiency.

---

## Key Features

### 1. Role-Based Authentication
- Secure login for faculty using stored credentials.
- Admin login with elevated privileges for global monitoring and control.
- Authentication data stored and validated through Google Apps Script and Sheets. :contentReference[oaicite:1]{index=1}

### 2. Faculty Dashboard
- Displays only the projects associated with the logged-in faculty member.
- Supports adding, editing, and deleting consultancy projects.
- Filtering options for academic year, industry, amount, and faculty name.
- Export options for downloading filtered data as CSV.
- Real-time data fetching from Apps Script ensures consistency with the backend. :contentReference[oaicite:2]{index=2}

### 3. Consultancy Project Form
- Collects complete project details: title, industry, academic year, investigators, financial data, and summary.
- Supports PDF uploads for bills and agreements.
- Automatically renames and uploads files securely to Google Drive.
- Handles edit mode with pre-filled existing data.
- Integrates form validation and post-submission redirection. :contentReference[oaicite:3]{index=3}

### 4. Admin Dashboard
- Comprehensive view of all consultancy projects submitted across the institution.
- Advanced filtering based on academic year, investigator, industry, and funding range.
- Supports per-project operations and bulk deletions.
- Displays user–project mapping for effective oversight.
- Allows exporting filtered project data or user lists to Excel/CSV. :contentReference[oaicite:4]{index=4}

### 5. Automated Email Workflow
- Sends confirmation emails when projects are added or updated.
- Sends periodic reminders for approaching deadlines.
- Issues a final reminder on the deadline date.
- Sends alerts for missed deadlines.
- Implemented using time-based triggers and MailApp in Apps Script. :contentReference[oaicite:5]{index=5}

### 6. Centralized Document Management
- Faculty can upload agreements, bills, and other documents in PDF format.
- Files stored securely in Google Drive with controlled access.
- Sheet rows store only file URLs for lightweight database usage.
- On deletion of a project or user, associated files are automatically moved to trash. :contentReference[oaicite:6]{index=6}

---

## System Architecture

**Frontend:**  
- React.js for UI  
- Material-UI for styling  
- Client-side routing via React Router  

**Backend:**  
- Google Apps Script for API endpoints  
- Handling CRUD operations, authentication, Drive uploads, and email notifications  

**Database:**  
- Google Sheets as the structured data store  

**File Storage:**  
- Google Drive for all project-related documents  

This design ensures a fully serverless system with minimal operational overhead.

---

## Project Outcomes

Through this project, we implemented a scalable and maintainable system capable of supporting real-world institutional workflows.  
The solution reduces manual workload, improves data accessibility, and ensures transparent, trackable consultancy project management.
