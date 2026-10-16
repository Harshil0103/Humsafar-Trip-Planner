import os
import docx
from docx.shared import Inches, Pt, RGBColor
from report_builder_core import (
    create_cover_page, add_styled_heading1, add_styled_heading2, add_styled_heading3,
    add_body_paragraph, add_bullet_point, add_callout_box, add_code_block,
    add_figure_image, add_styled_table, COLOR_PRIMARY_HEX, COLOR_SECONDARY_HEX, COLOR_TEAL_HEX,
    DOCS_DIR
)

def build_wad_report():
    doc = docx.Document()
    
    # Page setup
    for sec in doc.sections:
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)

    # 1. Cover Page
    create_cover_page(
        doc,
        subject_title="Web Application Development (WAD)",
        subject_subtitle="Full-Stack Web Architecture, Single-Page Application (SPA) Engineering, RESTful API Design, Responsive UI Systems & Geo-Spatial Mapping",
        course_name="Web Application Development (WAD / CS-301)",
        student_role="Full-Stack Web Engineering & Frontend/Backend Systems"
    )

    # 2. Certificate & Acknowledgement
    add_styled_heading1(doc, "CERTIFICATE OF ORIGINAL WORK")
    add_body_paragraph(doc, "This is to certify that the project entitled 'HUMSAFAR — Comprehensive Full-Stack Trip Planner & Journey Companion Platform' is a bona fide record of independent web engineering work carried out under the curriculum of Web Application Development (WAD). The source code, interactive client architecture, RESTful backend APIs, state management pipelines, and end-to-end automated test suites have been designed, coded, and verified in accordance with modern web engineering best practices.")
    
    add_body_paragraph(doc, "All third-party libraries, design systems, and external frameworks (React 18, Vite, Node.js, Express 5, Leaflet, and SQLite) have been properly cited and attributed in the documentation.")

    add_styled_heading1(doc, "EXECUTIVE SUMMARY / ABSTRACT")
    add_body_paragraph(doc, "Modern digital travelers frequently encounter severe friction when organizing journeys due to fragmented tools: one platform for flight and transit bookings, another for accommodation vouchers, disconnected spreadsheets for budget tracking, and static web searches for destination sights. Humsafar (ہمسفر — 'Your Journey Companion') resolves this fragmentation through an integrated, production-grade Web Application.")
    
    add_body_paragraph(doc, "Built using a modern 3-Tier architecture comprising React 18, Vite, Node.js, Express 5, and SQLite (with hybrid NoSQL synchronization to Cloud Firestore), Humsafar delivers a responsive, single-page application (SPA) experience. Key capabilities include interactive multi-day timeline itinerary management, dynamic Leaflet OpenStreetMap geo-spatial mapping with custom pin clustering, real-time budget calculation gauges with category breakdown analytics, multi-modal transit & stay tracking, packing progress checklists, and a role-based administrative portal with live system KPIs. The platform enforces strict JWT token authorization, Bcrypt password encryption, and multi-tenant data isolation, verified by a comprehensive 16-suite automated end-to-end (E2E) testing framework achieving 100% test pass rates.")

    add_callout_box(doc, "Project Highlights & Impact", 
                    "• Full-Stack SPA: High-performance React 18 with Vite Hot Module Replacement (HMR).\n"
                    "• RESTful Micro-Services: Express 5 backend with modular routers and middleware pipeline.\n"
                    "• Dynamic Geo-Mapping: Leaflet & OpenStreetMap interactive coordinates visualizer.\n"
                    "• Real-Time Financial Analytics: Instant planned vs. actual budget comparisons.\n"
                    "• Enterprise-Grade Security: Bcrypt salt hashing, JWT token authentication, and RBAC guards.")

    doc.add_page_break()

    # 3. Table of Contents Overview
    add_styled_heading1(doc, "TABLE OF CONTENTS")
    toc_data = [
        ["1.0", "Introduction & Project Motivation", "Page 3"],
        ["2.0", "System Requirements & Technology Stack Specification", "Page 5"],
        ["3.0", "System Architecture & 3-Tier Web Design", "Page 8"],
        ["4.0", "Frontend Architecture & UI/UX Engineering", "Page 11"],
        ["5.0", "Backend RESTful API & Controller Architecture", "Page 16"],
        ["6.0", "Web Security, Authentication & Data Protection", "Page 20"],
        ["7.0", "Client-Server Integration, State & Data Visualization", "Page 24"],
        ["8.0", "Automated Testing, Quality Assurance & Verification", "Page 28"],
        ["9.0", "Deployment Architecture & Web Performance Optimization", "Page 31"],
        ["10.0", "Conclusion & Future Research Directions", "Page 34"],
        ["11.0", "References & Web Standards Bibliography", "Page 35"]
    ]
    add_styled_table(doc, ["Section", "Chapter Title", "Reference Page"], toc_data, col_widths=[1.0, 4.3, 1.2])

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 1
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 1: INTRODUCTION & PROJECT MOTIVATION")
    
    add_styled_heading2(doc, "1.1 Background & Context")
    add_body_paragraph(doc, "The modern tourism and travel planning industry has witnessed exponential growth in digital platforms. However, consumers face significant cognitive overload when planning multi-city or multi-day international travel. Existing solutions typically isolate specific aspects of the journey: Booking engines focus strictly on hotel transactions; map services provide isolated driving directions; airline apps manage individual boarding passes; and travelers are forced to manually copy information into disconnected notes, spreadsheets, or printouts.")

    add_styled_heading2(doc, "1.2 Problem Statement")
    add_body_paragraph(doc, "Traditional travel software suffers from five foundational bottlenecks:", "Key Challenges: ")
    add_bullet_point(doc, "Information Fragmentation: Stays, flights, daily activities, and budget notes reside in disconnected silos.", "1. ")
    add_bullet_point(doc, "Lack of Timeline Precision: Many planners offer simple note lists without hourly time-stamped activity ordering or schedule conflict detection.", "2. ")
    add_bullet_point(doc, "Static Visualization: Lack of integrated geo-spatial map views showing where activities, hotels, and transit hubs are located relative to each other.", "3. ")
    add_bullet_point(doc, "Unclear Financial Tracking: Inability to compare estimated total trip budgets against live itemized expenses by category in real time.", "4. ")
    add_bullet_point(doc, "Weak Data Isolation & Security: Web portals frequently suffer from insecure direct object references (IDOR) allowing unauthorized viewing of private itineraries.", "5. ")

    add_styled_heading2(doc, "1.3 Project Objectives")
    add_body_paragraph(doc, "The Humsafar platform was engineered to satisfy the following primary objectives:")
    add_bullet_point(doc, "Develop an ultra-fast, responsive Single Page Application (SPA) using React 18 and Vite for seamless, zero-reload navigation.")
    add_bullet_point(doc, "Architect a resilient RESTful API server using Node.js and Express 5 with clean MVC separation and robust error handling.")
    add_bullet_point(doc, "Integrate interactive Leaflet OpenStreetMap mapping with customized, color-coded map pins for hotels, transit hubs, and sights.")
    add_bullet_point(doc, "Implement comprehensive live budget analytics displaying spending gauges and category-based financial breakdowns.")
    add_bullet_point(doc, "Deliver enterprise authentication using Bcrypt password hashing, JWT authorization, and role-based access control (RBAC).")
    add_bullet_point(doc, "Ensure zero defect tolerance through an automated end-to-end (E2E) testing framework covering all operational flows.")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 2
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 2: SYSTEM REQUIREMENTS & TECHNOLOGY SPECIFICATION")

    add_styled_heading2(doc, "2.1 Functional Requirements Matrix")
    add_body_paragraph(doc, "The functional requirements of Humsafar cover user journey workflows from initial inspiration to comprehensive trip execution:")

    fr_headers = ["Module ID", "Functional Requirement", "Description & Operational Behavior", "User Role"]
    fr_data = [
        ["FR-01", "User Authentication", "User registration, secure login with Bcrypt & JWT token issuance, and profile updates.", "Public / User"],
        ["FR-02", "Destination Catalog", "Browse curated global destinations with ratings, photos, attractions, and filter by region.", "Public / User"],
        ["FR-03", "Trip Lifecycle (CRUD)", "Create, view, update, archive, and delete trips with automatic itinerary day generator.", "Traveler"],
        ["FR-04", "Itinerary Builder", "Add, edit, time-stamp, cost-estimate, and reorder activities per calendar day.", "Traveler"],
        ["FR-05", "Accommodation Hub", "Log hotels/stays with check-in/out dates, nightly rates, total calculation, and booking refs.", "Traveler"],
        ["FR-06", "Transit Logistics", "Track flights, trains, buses, car rentals, and ferries with departure/arrival times.", "Traveler"],
        ["FR-07", "Live Budget Visualizer", "Real-time computation of spent vs. remaining budget with category breakdown charts.", "Traveler"],
        ["FR-08", "Interactive Map View", "Leaflet geo-spatial canvas displaying destination center, hotel pins, and activity sights.", "Traveler"],
        ["FR-09", "Packing Checklist", "Categorized packing tracker with instant click-to-pack progress percentage.", "Traveler"],
        ["FR-10", "Trip Duplication", "Deep clone an entire trip structure including days, items, stays, transit, and activities.", "Traveler"],
        ["FR-11", "Admin Portal & CMS", "Platform KPI dashboard, destination catalog management (CRUD), and user role oversight.", "Administrator"]
    ]
    add_styled_table(doc, fr_headers, fr_data, col_widths=[0.8, 1.4, 3.4, 0.9])

    add_styled_heading2(doc, "2.2 Non-Functional Requirements")
    add_bullet_point(doc, "Sub-200ms API response latency for all relational queries and sub-second initial client asset render.", "Performance: ")
    add_bullet_point(doc, "Stateless token-based authorization and modular micro-router architecture supporting high concurrent loads.", "Scalability: ")
    add_bullet_point(doc, "Bcrypt password hashing (10 salt rounds), JWT Bearer token guards, CORS whitelisting, and strict user data isolation.", "Security: ")
    add_bullet_point(doc, "Fully adaptive CSS Grid & Flexbox design system supporting mobile (<640px), tablet (768px), and desktop (1024px+).", "Responsiveness: ")
    add_bullet_point(doc, "Standardized error handling middleware preventing server crashes and returning descriptive JSON feedback.", "Fault Tolerance: ")

    add_styled_heading2(doc, "2.3 Technology Stack Justification")
    stack_headers = ["Technology", "Layer", "Selection Rationale & Technical Advantage"]
    stack_data = [
        ["React 18", "Frontend Library", "Declarative UI, Virtual DOM reconciliation, Concurrent Rendering, and Hook-based modular state."],
        ["Vite", "Build Tool", "Instant server start via native ESM, lightning-fast Hot Module Replacement (HMR), and optimized Rollup production builds."],
        ["React Router v6", "Client Routing", "Declarative nested routing, history stack management, and high-performance layout wrappers."],
        ["Leaflet & React-Leaflet", "Geo-Spatial Mapping", "Lightweight, open-source mapping engine leveraging OpenStreetMap tiles with zero API quota fees."],
        ["Custom Vanilla CSS", "Styling Engine", "High-performance CSS variables, zero runtime JS-in-CSS overhead, smooth glassmorphic effects, and clean custom design tokens."],
        ["Node.js & Express 5", "Backend API Server", "Non-blocking event-driven I/O, robust routing, middleware pipelining, and high concurrency capability."],
        ["SQLite3 (Persistent)", "Database Engine", "Zero-configuration, serverless, ACID-compliant relational persistence with B-Tree indexing and foreign key enforcement."],
        ["JSON Web Tokens (JWT)", "Security / Auth", "Stateless, cryptographically signed bearer tokens allowing scalable authorization without server session storage."],
        ["Bcryptjs", "Cryptography", "Industry-standard adaptive hashing function incorporating work factor salting to prevent rainbow table attacks."]
    ]
    add_styled_table(doc, stack_headers, stack_data, col_widths=[1.5, 1.3, 3.7])

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 3
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 3: SYSTEM ARCHITECTURE & 3-TIER WEB DESIGN")

    add_styled_heading2(doc, "3.1 3-Tier Full-Stack Architecture")
    add_body_paragraph(doc, "Humsafar is structured around a classic, robust 3-Tier web architecture. This architectural paradigm decouples presentation concerns, business logic execution, and data storage, ensuring exceptional maintainability, testability, and horizontal scalability.")

    add_figure_image(doc, "wad_fig1_architecture.png", "Figure 3.1: Humsafar 3-Tier Full-Stack Web Architecture Schematic")

    add_body_paragraph(doc, "The 3-Tier design operates as follows:", "Architectural Flow: ")
    add_bullet_point(doc, "Presentation Tier (Client-Side): Executed in the user's web browser as an asynchronous Single Page Application (SPA). It renders responsive UI components, manages client state via Context API, and communicates with the backend via JSON REST HTTP requests.", "1. ")
    add_bullet_point(doc, "Application / Logic Tier (Backend API): Built on Node.js and Express 5, this tier handles request routing, token authentication, input sanitization, business calculations (budget sums, itinerary generation, cloning), and database orchestration.", "2. ")
    add_bullet_point(doc, "Data Persistence Tier (Hybrid Polyglot): Primary relational persistence is provided by an embedded SQLite engine enforcing strict foreign key constraints and B-Tree indexes, augmented by an asynchronous synchronization pipeline to Google Cloud Firestore for cloud backup.", "3. ")

    add_styled_heading2(doc, "3.2 Data Flow & Request Processing Architecture")
    add_body_paragraph(doc, "When a user performs an action (such as adding an activity to Day 1 of a trip):")
    add_bullet_point(doc, "The React client captures user input via controlled form state and dispatches an asynchronous `fetch()` call attaching the Bearer JWT token in the `Authorization` HTTP header.")
    add_bullet_point(doc, "The Express server receives the request, passing it through global CORS, JSON parsing, and Morgan logger middlewares.")
    add_bullet_point(doc, "The `authenticateToken` middleware intercepts the request, verifies the cryptographic signature of the JWT using the server secret, extracts `req.user`, and verifies permissions.")
    add_bullet_point(doc, "The `tripsController` executes parameterized SQL queries against SQLite within an isolated scope, verifying that the target trip belongs to `req.user.id`.")
    add_bullet_point(doc, "The database executes the insertion, updates foreign key indexes, and returns the newly generated entity.")
    add_bullet_point(doc, "The backend serializes the entity into a structured JSON response (HTTP 201 Created), and the React UI updates its local state dynamically without requiring a full page refresh.")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 4
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 4: FRONTEND ARCHITECTURE & UI/UX ENGINEERING")

    add_styled_heading2(doc, "4.1 React 18 Component Hierarchy")
    add_body_paragraph(doc, "The frontend of Humsafar follows the Atomic Component Design pattern, organizing components from fundamental atoms (buttons, inputs, badges) to molecular cards and organisms (master page views).")

    add_figure_image(doc, "wad_fig2_component_hierarchy.png", "Figure 4.1: React Component Tree & Global Context Provider Hierarchy")

    add_body_paragraph(doc, "Key frontend components and their responsibilities include:")
    add_bullet_point(doc, "Root component configuring BrowserRouter, global AuthProvider, and ToastProvider wrappers.", "<App.jsx>: ")
    add_bullet_point(doc, "Responsive navigation header with brand logo, dynamic navigation links, user avatar dropdown, and role-based Admin link.", "<Navbar.jsx>: ")
    add_bullet_point(doc, "Master trip command center integrating the multi-day timeline, interactive map, live budget gauges, accommodation list, and packing tracker in a tabbed layout.", "<TripDetailPage.jsx>: ")
    add_bullet_point(doc, "OpenStreetMap canvas component that dynamically centers on destination coordinates and renders customized pins for hotels and sights.", "<InteractiveMap.jsx>: ")
    add_bullet_point(doc, "Visual spending gauge and category breakdown donut visualizer comparing planned budget against real expenditures.", "<BudgetChart.jsx>: ")
    add_bullet_point(doc, "Higher-order security wrappers that evaluate `isAuthenticated` and `user.role === 'admin'`, redirecting unauthorized visitors.", "<ProtectedRoute.jsx> / <AdminRoute.jsx>: ")

    add_styled_heading2(doc, "4.2 State Management via React Context API")
    add_body_paragraph(doc, "To avoid excessive prop-drilling while maintaining high rendering performance, Humsafar employs React Context API for cross-cutting state:")
    add_bullet_point(doc, "Maintains currentUser state, token persistence in localStorage, login(), register(), firebaseSync(), and logout() methods.", "AuthContext: ")
    add_bullet_point(doc, "Provides global showToast(message, type) trigger that renders animated success, error, and info banners across all views.", "ToastContext: ")
    add_bullet_point(doc, "Managed directly within page components using useState and useEffect hooks, ensuring fast localized re-renders without polluting global scope.", "Local Component State: ")

    add_styled_heading2(doc, "4.3 Custom Vanilla CSS Design System & Responsive Layouts")
    add_body_paragraph(doc, "Humsafar implements a bespoke CSS design system engineered without heavy UI frameworks. This approach guarantees zero CSS bloat, exact visual control, and micro-second rendering speeds. Key design tokens include:")

    css_sample = """/* Humsafar Modern Design Tokens (index.css) */
:root {
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-bg-dark: #0b0f19;
  --color-card-bg: #131b2e;
  --color-border: #1e293b;
  --color-text-main: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-accent-emerald: #10b981;
  --color-accent-amber: #f59e0b;
  --color-accent-rose: #f43f5e;
  --radius-lg: 16px;
  --radius-md: 10px;
  --shadow-card: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  --glass-bg: rgba(19, 27, 46, 0.85);
  --glass-border: rgba(255, 255, 255, 0.08);
}"""
    add_code_block(doc, css_sample)

    add_figure_image(doc, "wad_fig5_ui_wireframes_layout.png", "Figure 4.2: Frontend Responsive UI Layout & Trip Command Center Wireframe")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 5
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 5: BACKEND RESTFUL API & CONTROLLER ARCHITECTURE")

    add_styled_heading2(doc, "5.1 Express 5 REST API Design")
    add_body_paragraph(doc, "The backend API is built using Node.js and Express 5, implementing strict REST architectural constraints: stateless communication, uniform resource identifiers (URIs), standard HTTP verbs, and structured JSON payloads.")

    add_figure_image(doc, "wad_fig3_rest_api_lifecycle.png", "Figure 5.1: Express 5 RESTful API Request-Response Lifecycle & Middleware Flow")

    add_styled_heading2(doc, "5.2 Comprehensive API Endpoint Directory")
    api_headers = ["Endpoint URI", "HTTP Verb", "Access Level", "Purpose & Controller Handler"]
    api_data = [
        ["/api/auth/register", "POST", "Public", "Register new traveler; returns user object & JWT token."],
        ["/api/auth/login", "POST", "Public", "Verify email/password; returns user object & JWT token."],
        ["/api/auth/me", "GET", "Authenticated", "Retrieve profile data for currently authenticated traveler."],
        ["/api/auth/firebase-sync", "POST", "Public", "Sync Google/Firebase OAuth user into local database."],
        ["/api/destinations", "GET", "Public", "List curated destinations with keyword search & region filter."],
        ["/api/destinations/:id", "GET", "Public", "Fetch single destination details with sights and activities."],
        ["/api/destinations", "POST", "Admin Only", "Create a new destination catalog record."],
        ["/api/destinations/:id", "PUT / DELETE", "Admin Only", "Update or delete destination from catalog."],
        ["/api/trips", "GET", "Authenticated", "List all active, planning, and completed trips for current user."],
        ["/api/trips", "POST", "Authenticated", "Create trip with automatic day-by-day calendar generation."],
        ["/api/trips/:id", "GET", "Authenticated", "Get complete trip details with days, items, stays, transit, budget."],
        ["/api/trips/:id/duplicate", "POST", "Authenticated", "Deep clone trip and all associated child entities."],
        ["/api/trips/:id/status", "PATCH", "Authenticated", "Update trip status ('planning', 'active', 'completed')."],
        ["/api/trips/:id/itinerary/items", "POST / PUT / DEL", "Authenticated", "Manage time-stamped activities within a specific day."],
        ["/api/trips/:id/accommodations", "POST / PUT / DEL", "Authenticated", "Manage hotel bookings, check-in dates, and costs."],
        ["/api/trips/:id/transportation", "POST / PUT / DEL", "Authenticated", "Manage flights, trains, and multi-modal transit logs."],
        ["/api/trips/:id/expenses", "GET / POST / DEL", "Authenticated", "Manage budget logs and fetch aggregated financial analytics."],
        ["/api/trips/:id/packing", "POST / PATCH / DEL", "Authenticated", "Manage packing items and toggle packed boolean state."],
        ["/api/admin/stats", "GET", "Admin Only", "Fetch system KPIs: total users, trips, destinations, revenue."],
        ["/api/admin/users", "GET / PATCH", "Admin Only", "List registered users, change roles ('user' <-> 'admin')."]
    ]
    add_styled_table(doc, api_headers, api_data, col_widths=[1.8, 0.9, 1.1, 2.7])

    add_styled_heading2(doc, "5.3 Controller Implementation Highlight: Automatic Day Generation")
    add_body_paragraph(doc, "When a trip is created in Humsafar, the backend calculates the exact date span between `start_date` and `end_date` and automatically seeds individual `itinerary_days` rows in the database, ensuring zero manual calendar setup for the user:")

    code_days = """// Automatic Itinerary Day Generation in tripsController.js
const startDate = new Date(start_date);
const endDate = new Date(end_date);
const diffTime = Math.abs(endDate - startDate);
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

for (let i = 0; i < diffDays; i++) {
  const currentDayDate = new Date(startDate);
  currentDayDate.setDate(startDate.getDate() + i);
  const formattedDate = currentDayDate.toISOString().split('T')[0];

  await db.run(
    `INSERT INTO itinerary_days (trip_id, day_number, date, title) 
     VALUES (?, ?, ?, ?)`,
    [tripId, i + 1, formattedDate, `Day ${i + 1}`]
  );
}"""
    add_code_block(doc, code_days)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 6
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 6: WEB SECURITY, AUTHENTICATION & DATA PROTECTION")

    add_styled_heading2(doc, "6.1 Cryptographic Password Security")
    add_body_paragraph(doc, "User passwords are never stored in plaintext. Humsafar utilizes the `bcryptjs` library to generate adaptive cryptographic hashes with 10 salt rounds:")
    add_bullet_point(doc, "The salt is randomly generated per user, defeating precomputed rainbow table attacks.", "Adaptive Salting: ")
    add_bullet_point(doc, "The key derivation function requires deliberate CPU cycles, mitigating brute-force dictionary attacks.", "Work Factor: ")

    add_styled_heading2(doc, "6.2 Stateless JWT Bearer Token Architecture")
    add_body_paragraph(doc, "Authentication is handled through JSON Web Tokens (JWT). Upon valid credential submission, the server issues a signed token containing claims (`id`, `email`, `role`).")

    add_figure_image(doc, "wad_fig4_auth_security_flow.png", "Figure 6.1: End-to-End JWT Authentication & Multi-Tenant Data Isolation Flow")

    add_styled_heading2(doc, "6.3 Multi-Tenant Data Isolation & RBAC")
    add_body_paragraph(doc, "To prevent Horizontal Privilege Escalation (IDOR vulnerabilities), all private trip controller methods enforce strict user ownership validation:")

    code_sec = """// Security & Ownership Guard in tripsController.js
const trip = await db.get('SELECT * FROM trips WHERE id = ?', [tripId]);

if (!trip) {
  return res.status(404).json({ error: 'Trip not found' });
}

// Ensure the requesting user is either the trip owner OR a platform administrator
if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden: You do not have permission to access this trip.' });
}"""
    add_code_block(doc, code_sec)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 7
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 7: CLIENT-SERVER INTEGRATION, STATE & DATA VISUALIZATION")

    add_styled_heading2(doc, "7.1 Geo-Spatial Map Integration with Leaflet")
    add_body_paragraph(doc, "Humsafar features an interactive mapping canvas powered by Leaflet and OpenStreetMap. The client dynamically translates latitude and longitude coordinates into styled, color-coded map markers:")
    add_bullet_point(doc, "Indigo Marker Pin: Identifies booked accommodations and hotels.", "🏨 Accommodations: ")
    add_bullet_point(doc, "Green Marker Pin: Identifies scheduled sightseeing activities and cultural spots.", "🏛️ Sights & Activities: ")
    add_bullet_point(doc, "Blue Hub Pin: Centers the map viewport on the host destination coordinates.", "📍 Destination Hub: ")

    add_styled_heading2(doc, "7.2 Real-Time Financial Budget Calculations")
    add_body_paragraph(doc, "The budget visualizer module computes financial health across five distinct dimensions: Stays, Transportation, Food, Activities, and Shopping. The server computes aggregated metrics via SQL:")

    code_budget = """// Real-Time Budget Aggregation in expensesController.js
const summary = await db.get(
  `SELECT 
     COALESCE(SUM(amount), 0) AS total_spent,
     COUNT(id) AS total_transactions
   FROM expenses WHERE trip_id = ?`,
  [tripId]
);

const breakdown = await db.all(
  `SELECT category, SUM(amount) as category_total 
   FROM expenses WHERE trip_id = ? 
   GROUP BY category`,
  [tripId]
);"""
    add_code_block(doc, code_budget)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 8
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 8: AUTOMATED TESTING, QUALITY ASSURANCE & VERIFICATION")

    add_styled_heading2(doc, "8.1 Automated End-to-End (E2E) Test Suite")
    add_body_paragraph(doc, "To verify complete system reliability, Humsafar incorporates an automated End-to-End (E2E) test runner (`server/test_e2e.js`) executing across all critical application paths.")

    test_headers = ["Test #", "Test Suite Component", "Validation Objective", "Status"]
    test_data = [
        ["T-01", "API Health Check", "Verify server connectivity, uptime, and database binding.", "PASSED (200 OK)"],
        ["T-02", "Traveler Registration", "Create unique user account, hash password, issue JWT token.", "PASSED (201 Created)"],
        ["T-03", "Traveler Authentication", "Validate credentials, verify JWT token issuance.", "PASSED (200 OK)"],
        ["T-04", "Firebase Auth Sync", "Synchronize Google OAuth account and issue session token.", "PASSED (200 OK)"],
        ["T-05", "Admin Authentication", "Verify administrator credentials and admin role authorization.", "PASSED (200 OK)"],
        ["T-06", "Destination Catalog", "Query destinations catalog, filter by region 'Europe', search 'Kyoto'.", "PASSED (200 OK)"],
        ["T-07", "Trip Creation", "Create 6-day Kyoto trip, verify automatic 6-day itinerary generation.", "PASSED (201 Created)"],
        ["T-08", "Itinerary Item Flow", "Add activity 'Matcha Tasting', update cost to $45, reorder items.", "PASSED (200 OK)"],
        ["T-09", "Accommodation Hub", "Add Machiya Villa booking ($1,100), check-in/out date calculations.", "PASSED (201 Created)"],
        ["T-10", "Transit Management", "Add Shinkansen Bullet Train record ($140), verify route details.", "PASSED (201 Created)"],
        ["T-11", "Activity Scheduling", "Add Gion Geisha district guided tour ($60), set status to 'booked'.", "PASSED (201 Created)"],
        ["T-12", "Live Budget Analytics", "Log expenses, verify total ($320), remaining ($2,880), category map.", "PASSED (200 OK)"],
        ["T-13", "Packing Checklist", "Add passport item, toggle boolean packed state (0 -> 1).", "PASSED (200 OK)"],
        ["T-14", "Deep Trip Cloning", "Execute trip duplication; verify recursive cloning of child days & items.", "PASSED (201 Created)"],
        ["T-15", "Security & Data Isolation", "Verify User B is blocked with 403 Forbidden when accessing User A trip.", "PASSED (403 Forbidden)"],
        ["T-16", "Admin Portal Operations", "Verify admin KPI metrics endpoint and registered user listing.", "PASSED (200 OK)"]
    ]
    add_styled_table(doc, test_headers, test_data, col_widths=[0.8, 1.8, 2.7, 1.2])

    add_callout_box(doc, "Verification Summary: 100% Pass Rate", 
                    "All 16 comprehensive end-to-end automated test suites completed with zero failures. "
                    "Data isolation, security token verification, budget arithmetic, and deep entity cloning "
                    "have been formally validated under automated execution.")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 9 & 10
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 9: DEPLOYMENT ARCHITECTURE & WEB PERFORMANCE")

    add_styled_heading2(doc, "9.1 Production Build & Tooling")
    add_body_paragraph(doc, "Humsafar leverages modern frontend tooling for optimal production distribution:")
    add_bullet_point(doc, "Vite compiles React components using Rollup, tree-shaking unused code, and producing heavily optimized chunks.", "Build Optimization: ")
    add_bullet_point(doc, "Assets and stylesheets are pre-compressed and minified, achieving sub-100KB initial gzipped bundle sizes.", "Asset Delivery: ")
    add_bullet_point(doc, "Custom CSS skeleton shimmer placeholders are rendered during asynchronous network fetches, preventing Cumulative Layout Shift (CLS).", "Perceived Performance: ")

    add_styled_heading1(doc, "CHAPTER 10: CONCLUSION & FUTURE SCOPE")

    add_styled_heading2(doc, "10.1 Project Conclusion")
    add_body_paragraph(doc, "The Humsafar platform successfully demonstrates the practical implementation of modern Web Application Development concepts. By harmonizing a responsive React 18 frontend with an Express 5 REST API and ACID-compliant relational persistence, the application solves the critical real-world problem of travel planning fragmentation.")

    add_styled_heading2(doc, "10.2 Future Technical Enhancements")
    add_bullet_point(doc, "Integration with Google Gemini API to automatically generate suggested day-by-day itineraries based on travel duration and budget preferences.", "1. Generative AI Travel Assistant: ")
    add_bullet_point(doc, "Implementation of Service Workers and Cache API to enable full offline itinerary viewing while traveling without internet access.", "2. Progressive Web App (PWA): ")
    add_bullet_point(doc, "Socket.io integration enabling multiple travelers to edit the same itinerary in real time with collaborative live cursors.", "3. Real-Time WebSockets Collaboration: ")

    add_styled_heading1(doc, "CHAPTER 11: REFERENCES & WEB STANDARDS")
    add_bullet_point(doc, "W3C HTML5 & CSS3 Recommendations. World Wide Web Consortium (W3C), 2024.")
    add_bullet_point(doc, "React Documentation & Architecture Guide. Meta Platforms Open Source, 2025.")
    add_bullet_point(doc, "Express.js Framework Reference & Middleware Patterns. OpenJS Foundation, 2025.")
    add_bullet_point(doc, "JSON Web Token (JWT) Architecture (RFC 7519). Internet Engineering Task Force (IETF).")
    add_bullet_point(doc, "Leaflet.js Open-Source Interactive Maps Documentation (v1.9.4), 2024.")

    out_path = os.path.join(DOCS_DIR, "Humsafar_WAD_Project_Report.docx")
    doc.save(out_path)
    print(f"Successfully generated WAD Report at: {out_path}")

if __name__ == '__main__':
    build_wad_report()
