# PDR World — Fiber Optic & Network Infrastructure Platform

![Live Website](https://img.shields.io/badge/Live-Website-success?style=for-the-badge&logo=vercel)
**Live Website:** [https://pdr-sable.vercel.app/](https://pdr-sable.vercel.app/)
**Repository:** [https://github.com/shubhamcodes56/pdr-world](https://github.com/shubhamcodes56/pdr-world)

Modern enterprise-grade product catalogue and RFQ platform built for PDR World, focused on fiber optic infrastructure, active/passive networking components, cable management, testing equipment, and industrial optical solutions.

## 🚀 Features

### Product Catalogue

* Structured multi-category product architecture
* Active Components
* Passive Components
* Cable Management
* Test & Measuring Equipment
* Optical Fiber Drone
* Maintenance Tools

### Product Experience

* Dedicated product detail pages
* Technical specifications
* Datasheet preview support
* Responsive product grids
* Consistent product image rendering
* Product categorization aligned with wireframe structure

### RFQ (Request For Quote) System

* Add to Quote workflow
* Interactive Quote Cart
* 2-step RFQ submission experience
* Product quantity management
* Compact request summary
* Inquiry submission form

### Datasheet System

* Legacy datasheet migration from original PDR website
* Inline PDF preview support
* Fallback dynamic datasheet generation
* Product-to-datasheet mapping system

### Media & Resources

* Video gallery support
* Technical demonstrations
* Factory tour previews
* Resources section

### UX Improvements

* Mobile responsive layout
* Clean category hierarchy
* Improved spacing and visual rhythm
* Consistent image pipeline across:
  * catalogue
  * product pages
  * cart
  * RFQ summary

---

# 🛠️ Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* jsPDF
* Node.js utility scripts

---

# 📂 Project Structure

```bash
src/
 ├── components/
 ├── pages/
 ├── data/
 ├── styles/
 ├── lib/
 ├── hooks/
 └── assets/
```

---

# ⚙️ Installation

```bash
git clone https://github.com/Foremark-Technologies/pdr.git

cd pdr

npm install
```

---

# ▶️ Run Development Server

```bash
npm run dev
```

---

# 🏗️ Production Build

```bash
npm run build
```

---

# 📑 Datasheet Architecture

The project supports two datasheet systems:

### 1. Real Legacy Datasheets

Mapped PDFs migrated from the original PDR website.

### 2. Fallback Dynamic Datasheets

Auto-generated PDFs using jsPDF for products without legacy datasheets.

---

# 🧩 RFQ Workflow

```text
Add to Quote
   ↓
Quote Cart
   ↓
Proceed to Request
   ↓
Request Details Form
   ↓
Submit RFQ
```

---

# 🔒 Stability & Architecture Notes

* SEO-safe routing preserved
* Product slugs remain stable
* Datasheet mappings preserved
* Canonical image resolution system implemented
* Responsive behavior maintained
* Wireframe-aligned catalogue structure

---

# 📸 Key Improvements Completed

* Catalogue cleanup & wireframe alignment
* Product hierarchy restructuring
* Duplicate removal
* Datasheet migration & preview support
* RFQ UX enhancement
* Cart image consistency fixes
* Product image pipeline unification
* Video section improvements
* Responsive layout refinements

---

# 👨💻 Development Notes

This repository contains the modernized implementation of the PDR World product and RFQ ecosystem with focus on:

* scalable product architecture
* enterprise RFQ workflows
* technical catalogue usability
* legacy asset preservation
* modern responsive UX

---
