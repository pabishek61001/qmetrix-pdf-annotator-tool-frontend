# QMetrix PDF Takeoff & Annotation Tool – Frontend

A professional, high-performance web client built for **Quantity Surveying & Cost Estimations**, developed as part of the Full Stack Developer assessment for **QMetrix Consultancy**.

---

## 🚀 Overview
The **QMetrix Frontend** is a modern, responsive Next.js web application. It allows quantity surveyors and estimators to upload structural PDF drawings, interactively map room boundaries using precise vertex coordinate capture ("One Click" takeoff engine), compute real-time areas and costs using geometric formulas, and synchronize all project data seamlessly to MongoDB via a RESTful backend API.

---

## 🛠️ Tech Stack
* **Framework:** Next.js (App Router, Server-Side Rendering & Client Components)
* **Styling:** Tailwind CSS (Enterprise-grade UI components, dark drafting themes, glassmorphism)
* **Icons:** Lucide React
* **Geometry & Math:** HTML5 Canvas, Shoelace Formula for precise polygon area calculations
* **Deployment:** Vercel

---

## ✨ Key Features
1. **Blueprint Takeoff Dashboard:** Real-time metrics overview displaying total projects, accumulated room area takeoffs, and estimated construction valuations.
2. **Interactive Estimation Canvas:** Advanced canvas workspace allowing users to map room boundaries, capture vertex coordinates, and dynamically generate Bills of Quantities (BOQ).
3. **Cloud Synchronization:** Securely saves project name, descriptions, and polygon markings, allowing users to reopen and review annotations anytime.
4. **Responsive Layouts:** Mobile-friendly grid tables and high-contrast drafting board designs.

---

## 📁 Project Directory Structure
qmetrix-pdf-annotator-frontend/
├── public/                             # Static assets & sample blueprints
├── src/
│   ├── app/
│   │   ├── layout.js                   # Root layout with global Tailwind styling & font variables
│   │   ├── page.jsx                    # Main Dashboard (SSR with dynamic rendering)
│   │   └── workspace/
│   │       ├── page.jsx                # Interactive Room Estimation Canvas & Editor
│   │       └── components/
│   │           ├── BoqSidebar.jsx      # Bill of Quantities sidebar & room manager
│   │           ├── CanvasViewer.jsx    # Core canvas viewer & mobile rendering engine
│   │           ├── PDFViewerCanvas.jsx # Main orchestrator for PDF view & polygon overlay
│   │           └── ProjectFormModal.jsx# Save project metadata form modal
│   ├── components/
│   │   ├── SavedProjects.jsx           # Responsive data table & project cards
│   │   └── Navbar.jsx                  # Application navigation bar
│   ├── providers/
│   │   └── ToastProvider.jsx           # Global notification context provider
│   └── utils/
│       └── geometryUtils.js            # Shoelace formula & scale conversion helpers
├── .env.local                          # Local environment configuration
└── package.json                        # Dependencies and build scripts