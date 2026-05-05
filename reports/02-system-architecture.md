# Chapter 2: System Architecture

## 2.1 Architecture Type

The system follows an **Enterprise Microservice-Ready Modular Monolithic Architecture**.

| Term | Meaning |
|---|---|
| **Monolithic** | The entire backend runs as a single deployable application (one `main.ts` entry point). It is NOT split into multiple independently deployed microservices. |
| **Modular** | Even though it is monolithic, the code is organized into *independent modules* (auth, users, services, appointments, products). Each module has its own controller, service, and schema. This means it is *easy to maintain and easy to split into microservices later*. |
| **Microservice-Ready** | Because of the modular design, if the salon business grows and needs to handle thousands of users, individual modules (like appointments or payments) can be extracted into independent microservices without rewriting the entire application. |
| **Enterprise-Level** | The architecture uses patterns (dependency injection, guards, interceptors) commonly found in large corporate applications, not simple tutorial-level code. |

---

## 2.2 The Three-Layer Architecture

```
┌──────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                    │
│                   (Angular 17)                        │
│                                                      │
│  • What the user sees and interacts with              │
│  • Components, pages, forms, buttons                  │
│  • Runs in the user's browser                         │
│  • Sends HTTP requests to the backend                 │
│  • Uses Angular Material for UI components            │
│  • Uses Tailwind CSS for responsive design            │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP/HTTPS (REST API Calls)
                       ▼
┌──────────────────────────────────────────────────────┐
│                APPLICATION LAYER                      │
│                    (NestJS)                            │
│                                                      │
│  • The brain of the system                            │
│  • Receives HTTP requests from Angular                │
│  • Validates data, applies business logic             │
│  • Authenticates users (JWT), authorizes actions      │
│  • Communicates with the database                     │
│  • Returns JSON responses to Angular                  │
└──────────────────────┬───────────────────────────────┘
                       │ Mongoose ODM (MongoDB Driver)
                       ▼
┌──────────────────────────────────────────────────────┐
│                   DATA LAYER                          │
│                (MongoDB Atlas)                        │
│                                                      │
│  • Stores all persistent data                         │
│  • User accounts, services, appointments, products    │
│  • NoSQL document database (JSON-like documents)      │
│  • Hosted in the cloud (MongoDB Atlas)                │
│  • Horizontally scalable                              │
└──────────────────────────────────────────────────────┘
```

---

## 2.3 End-to-End Data Flow

Here is exactly how data moves through the system when a customer books an appointment:

```
Step 1: Customer clicks "Book Appointment" button in the browser
           ↓
Step 2: Angular component captures form data (service, date, time)
           ↓
Step 3: Angular service (appointment.service.ts) sends HTTP POST
        request to NestJS backend via HttpClient
           ↓
Step 4: NestJS receives the request at the AppointmentsController
           ↓
Step 5: The JWT AuthGuard intercepts and validates the token
        (Is this user logged in? Is the token valid? Is it expired?)
           ↓
Step 6: If authorized, the controller passes data to AppointmentsService
           ↓
Step 7: The service applies business logic:
        - Is the date in the future?
        - Is the time slot available?
        - Is the service valid?
           ↓
Step 8: The service uses Mongoose to save the document to MongoDB
        (Appointments collection)
           ↓
Step 9: MongoDB returns a success confirmation with the created document
           ↓
Step 10: NestJS sends a JSON response back to Angular
           ↓
Step 11: Angular receives the response and updates the UI
         ("Appointment booked successfully!")
```

---

## 2.4 Scalability Approach

The system is designed to scale in the following way:

- **Vertical Scaling (Short-term):** Upgrade the server (more RAM, more CPU) on the cloud provider
- **Horizontal Scaling (Long-term):** Run multiple instances of the NestJS backend behind a load balancer
- **Database Scaling:** MongoDB Atlas natively supports replica sets and sharding for horizontal data distribution
- **Frontend Scaling:** Angular is a static SPA (Single Page Application) — it can be served from a CDN (Content Delivery Network) with essentially zero scaling concerns

---

## 2.5 Inter-Layer Communication

| From | To | Protocol | Format |
|---|---|---|---|
| Angular (Browser) | NestJS (Server) | HTTP/HTTPS | JSON |
| NestJS (Server) | MongoDB Atlas (Cloud) | MongoDB Wire Protocol | BSON (Binary JSON) |
| Angular (Browser) | CDN (Static Assets) | HTTPS | HTML, CSS, JS |

---

## 2.6 Architecture Diagram Summary

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                           │
│                                                         │
│   ┌─────────────┐    ┌──────────────┐                   │
│   │   Browser   │───▶│  Angular 17  │                   │
│   │  (Chrome,   │    │  SPA App     │                   │
│   │   Firefox)  │    │              │                   │
│   └─────────────┘    └──────┬───────┘                   │
│                             │ HTTP REST API              │
└─────────────────────────────┼───────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────┐
│                    SERVER SIDE                           │
│                             ▼                           │
│   ┌──────────────────────────────────────────┐          │
│   │              NestJS Backend               │          │
│   │                                          │          │
│   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │          │
│   │  │ Auth │ │Users │ │Servic│ │Appoint│   │          │
│   │  │Module│ │Module│ │Module│ │Module │   │          │
│   │  └──────┘ └──────┘ └──────┘ └──────┘   │          │
│   │  ┌──────┐ ┌──────┐ ┌──────┐            │          │
│   │  │Produc│ │Orders│ │Paymen│            │          │
│   │  │Module│ │Module│ │Module│            │          │
│   │  └──────┘ └──────┘ └──────┘            │          │
│   └──────────────────┬───────────────────────┘          │
│                      │ Mongoose ODM                     │
│                      ▼                                  │
│   ┌──────────────────────────────────────────┐          │
│   │           MongoDB Atlas (Cloud)           │          │
│   └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```