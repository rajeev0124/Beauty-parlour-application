# Chapter 1: Project Overview

## 1.1 Introduction

The **Beauty Parlour Management System** is an enterprise-level web application designed to automate and digitize the complete operations of a modern beauty salon. This system provides a customer portal, admin portal, appointment booking system, product management, order processing, and payment integration — all under one unified platform.

The system is designed using **Angular 17** for the frontend, **NestJS** for the backend, and **MongoDB Atlas** as the cloud database.

Most beauty salons still operate on phone calls, paper registers, and walk-in chaos. This system digitizes the entire operation, enabling customers to browse services, book appointments, and buy products from their phone or laptop — 24/7, without phone calls.

---

## 1.2 Objectives

The core objectives of this system are:

- **Provide a digital platform** for salon operations — replacing manual processes with an automated online system
- **Enable online appointment booking** — customers can book, reschedule, or cancel appointments at any time
- **Improve customer experience** — through a modern, responsive, mobile-friendly interface
- **Provide a secure authentication system** — using JWT tokens and bcrypt password hashing
- **Provide an admin management system** — giving salon managers full control over services, appointments, products, and users
- **Support enterprise scalability** — the modular architecture allows the system to grow from a single salon to a multi-branch enterprise

---

## 1.3 Business Goals

| # | Business Goal | Description |
|---|---|---|
| 1 | **Increase Customer Engagement** | Customers can browse services, book appointments, and buy products from their phone or laptop — 24/7. No phone calls needed. |
| 2 | **Improve Operational Efficiency** | The admin no longer flips through paper registers. Everything — appointments, payments, staff — is on one dashboard. |
| 3 | **Reduce Manual Work** | Automatic appointment scheduling, automatic order tracking, and automatic payment recording eliminate human error and repetitive work. |
| 4 | **Increase Revenue Through Online Booking** | When booking is available 24/7 online, the salon captures customers who would have otherwise gone to a competitor because they couldn't reach the receptionist. |

---

## 1.4 System Users

The system identifies **four distinct user roles**, each with a different level of access and responsibility:

| Role | Who They Are | What They Can Do |
|---|---|---|
| **Customer** | A person who visits or wants to visit the salon | Browse services, view products, book appointments, place product orders, make payments, view their booking history |
| **Admin** | The salon manager or front-desk operator | Manage services (add/edit/delete), manage appointments (approve/reject/reschedule), manage products, view all orders, view all customer records |
| **Super Admin** | The business owner or IT administrator | Everything the Admin can do, PLUS manage admins, view business analytics, configure system settings, manage user accounts globally |
| **Staff** | The beauticians, stylists, and therapists | View their assigned appointments, update appointment status (completed/in-progress), view service details |

---

## 1.5 Core Business Workflows

### Workflow 1: Customer Registration & Login
```
Customer visits website → Clicks "Register" → Fills name, email, password
→ System creates account in database → Customer logs in
→ System generates JWT token → Customer accesses dashboard
```

### Workflow 2: Appointment Booking (Core Revenue Workflow)
```
Customer browses services → Selects a service (e.g., "Bridal Makeup - ₹5000")
→ Selects date and time → Submits appointment request
→ System saves appointment with status "pending"
→ Admin sees new appointment on dashboard → Approves or rejects it
→ Customer is notified of status change
```

### Workflow 3: Product Purchase
```
Customer browses products → Adds items to cart → Proceeds to checkout
→ System creates an order → Payment is processed
→ Order status is updated → Admin fulfills the order
```

### Workflow 4: Admin Service Management
```
Admin logs in → Navigates to "Manage Services"
→ Adds new service (name, description, price, duration, category)
→ Service becomes visible on customer-facing website
→ Admin can edit price, update description, or delete the service
```

### Workflow 5: Payment Processing
```
Customer completes booking or order → System generates payment record
→ Payment is recorded with userId, amount, and status
→ Admin can view all payment records on dashboard
```

---

## 1.6 Business Value Chain

```
┌─────────────────────────────────────────────────────┐
│              BUSINESS VALUE CHAIN                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Online Presence → More Visibility → More Customers │
│         ↓                                           │
│  24/7 Booking → No Lost Customers → More Revenue    │
│         ↓                                           │
│  Digital Records → Less Manual Error → Lower Costs  │
│         ↓                                           │
│  Product Sales → Additional Revenue Stream          │
│         ↓                                           │
│  Customer Data → Marketing Insights → Repeat Visits │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 1.7 Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Angular 17 | Component-based SPA framework |
| **UI Components** | Angular Material | Enterprise-grade UI component library |
| **Styling** | Tailwind CSS | Utility-first responsive CSS framework |
| **Backend** | NestJS | Enterprise Node.js framework with TypeScript |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL document database |
| **Authentication** | JWT + bcrypt | Stateless token-based authentication with secure password hashing |
| **ODM** | Mongoose | Object Document Mapper for MongoDB |