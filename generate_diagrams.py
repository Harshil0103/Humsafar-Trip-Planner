import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# Ensure directory exists
assets_dir = os.path.join(os.path.dirname(__file__), 'report_assets')
os.makedirs(assets_dir, exist_ok=True)

# Set common font styling
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

def create_wad_fig1():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    title_box = patches.FancyBboxPatch((5, 88), 90, 9, boxstyle="round,pad=0.5", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(title_box)
    ax.text(50, 92.5, "HUMSAFAR: 3-TIER FULL-STACK WEB ARCHITECTURE", color="white", fontsize=13, fontweight='bold', ha='center', va='center')

    # 1. Presentation Tier (Client)
    c_box = patches.FancyBboxPatch((5, 54), 26, 28, boxstyle="round,pad=0.8", ec="#2563EB", fc="#EFF6FF", lw=2)
    ax.add_patch(c_box)
    ax.text(18, 77, "PRESENTATION TIER\n(Client-Side SPA)", color="#1E40AF", fontsize=10, fontweight='bold', ha='center')
    ax.text(18, 64, "• React 18 & Vite (HMR)\n• React Router v6\n• Context API (Auth/Toast)\n• Leaflet & OpenStreetMap\n• Custom CSS Design System\n• Lucide Modern Icons", 
            color="#1E293B", fontsize=8, ha='center', va='center')

    # 2. Application / Logic Tier (Backend API)
    b_box = patches.FancyBboxPatch((37, 54), 26, 28, boxstyle="round,pad=0.8", ec="#0D9488", fc="#F0FDFA", lw=2)
    ax.add_patch(b_box)
    ax.text(50, 77, "APPLICATION TIER\n(REST API Server)", color="#0F766E", fontsize=10, fontweight='bold', ha='center')
    ax.text(50, 64, "• Node.js & Express 5\n• Modular Router / Controllers\n• JWT Token Verification\n• Bcrypt Security Hashing\n• CORS & Morgan Logging\n• Error Handling Middleware", 
            color="#1E293B", fontsize=8, ha='center', va='center')

    # 3. Data Tier (Persistence)
    d_box = patches.FancyBboxPatch((69, 54), 26, 28, boxstyle="round,pad=0.8", ec="#7C3AED", fc="#F5F3FF", lw=2)
    ax.add_patch(d_box)
    ax.text(82, 77, "DATA PERSISTENCE TIER\n(Hybrid Polyglot)", color="#6D28D9", fontsize=10, fontweight='bold', ha='center')
    ax.text(82, 64, "• SQLite (Embedded RDBMS)\n  - ACID Transactions\n  - B-Tree Indexing\n  - Foreign Key Cascades\n• Cloud Firestore (NoSQL)\n  - Hierarchical Collections\n  - Cloud Backup & Sync", 
            color="#1E293B", fontsize=8, ha='center', va='center')

    ax.annotate('', xy=(37, 70), xytext=(31, 70), arrowprops=dict(arrowstyle='<->', color='#2563EB', lw=2.5, mutation_scale=15))
    ax.text(34, 72.5, "HTTP / JSON\nREST API", color="#1E40AF", fontsize=7.5, fontweight='bold', ha='center')

    ax.annotate('', xy=(69, 70), xytext=(63, 70), arrowprops=dict(arrowstyle='<->', color='#0D9488', lw=2.5, mutation_scale=15))
    ax.text(66, 72.5, "SQL / IPC &\nFirebase SDK", color="#0F766E", fontsize=7.5, fontweight='bold', ha='center')

    s_box = patches.FancyBboxPatch((5, 12), 90, 34, boxstyle="round,pad=0.6", ec="#64748B", fc="#F8FAFC", lw=1.5, ls='--')
    ax.add_patch(s_box)
    ax.text(50, 42, "CROSS-CUTTING CONCERNS & INFRASTRUCTURE SUBSYSTEMS", color="#334155", fontsize=9.5, fontweight='bold', ha='center')

    p1 = patches.FancyBboxPatch((8, 16), 25, 22, boxstyle="round,pad=0.4", ec="#CBD5E1", fc="#FFFFFF")
    ax.add_patch(p1)
    ax.text(20.5, 33, "Security & Auth", color="#0F172A", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(20.5, 23, "• JWT Bearer Tokens\n• Bcrypt Salt (10 Rounds)\n• Role-Based Guard (RBAC)\n• Data Isolation Filters", color="#475569", fontsize=7.5, ha='center')

    p2 = patches.FancyBboxPatch((37.5, 16), 25, 22, boxstyle="round,pad=0.4", ec="#CBD5E1", fc="#FFFFFF")
    ax.add_patch(p2)
    ax.text(50, 33, "Geo-Spatial & Analytics", color="#0F172A", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(50, 23, "• Leaflet Dynamic Pins\n• Real-Time Budget Gauge\n• Multi-Day Day-Planner\n• Transit & Stay Trackers", color="#475569", fontsize=7.5, ha='center')

    p3 = patches.FancyBboxPatch((67, 16), 25, 22, boxstyle="round,pad=0.4", ec="#CBD5E1", fc="#FFFFFF")
    ax.add_patch(p3)
    ax.text(79.5, 33, "ETL & Sync Engine", color="#0F172A", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(79.5, 23, "• SQLite-to-Firestore Sync\n• Subcollection Generator\n• Automated E2E Test Suite\n• 100% Pass Verification", color="#475569", fontsize=7.5, ha='center')

    path = os.path.join(assets_dir, 'wad_fig1_architecture.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_wad_fig2():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "REACT COMPONENT HIERARCHY & STATE MANAGEMENT", color="white", fontsize=12, fontweight='bold', ha='center', va='center')

    r_box = patches.FancyBboxPatch((35, 76), 30, 8, boxstyle="round,pad=0.4", ec="#2563EB", fc="#DBEAFE", lw=2)
    ax.add_patch(r_box)
    ax.text(50, 80, "<App /> Root Router", color="#1E40AF", fontsize=9.5, fontweight='bold', ha='center', va='center')

    ctx_box = patches.FancyBboxPatch((20, 62), 60, 8, boxstyle="round,pad=0.4", ec="#0D9488", fc="#CCFBF1", lw=1.5)
    ax.add_patch(ctx_box)
    ax.text(50, 66, "<AuthProvider>  |  <ToastProvider>  (Global Context State)", color="#0F766E", fontsize=9, fontweight='bold', ha='center', va='center')

    nav_box = patches.FancyBboxPatch((6, 48), 24, 7, boxstyle="round,pad=0.3", ec="#64748B", fc="#F1F5F9")
    ax.add_patch(nav_box)
    ax.text(18, 51.5, "<Navbar /> (Auth State)", color="#334155", fontsize=8, fontweight='bold', ha='center', va='center')

    routes_box = patches.FancyBboxPatch((35, 48), 30, 7, boxstyle="round,pad=0.3", ec="#2563EB", fc="#EFF6FF", lw=1.5)
    ax.add_patch(routes_box)
    ax.text(50, 51.5, "<Routes> (React Router v6)", color="#1E40AF", fontsize=8.5, fontweight='bold', ha='center', va='center')

    foot_box = patches.FancyBboxPatch((70, 48), 24, 7, boxstyle="round,pad=0.3", ec="#64748B", fc="#F1F5F9")
    ax.add_patch(foot_box)
    ax.text(82, 51.5, "<Footer /> (Static)", color="#334155", fontsize=8, fontweight='bold', ha='center', va='center')

    p_box = patches.FancyBboxPatch((5, 14), 26, 28, boxstyle="round,pad=0.5", ec="#3B82F6", fc="#F8FAFC")
    ax.add_patch(p_box)
    ax.text(18, 38, "PUBLIC PAGES", color="#1D4ED8", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(18, 25, "• <LandingPage />\n• <DestinationsPage />\n  - <DestinationCard />\n• <LoginPage />\n• <RegisterPage />\n• <FirestoreExplorerPage />", 
            color="#334155", fontsize=7.5, ha='center')

    u_box = patches.FancyBboxPatch((35, 6), 34, 36, boxstyle="round,pad=0.5", ec="#10B981", fc="#F0FDF4", lw=2)
    ax.add_patch(u_box)
    ax.text(52, 38, "PROTECTED USER PAGES\n<ProtectedRoute>", color="#047857", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(52, 21, "• <DashboardPage />\n  - <TripCard /> Grid\n• <CreateTripPage /> / <EditTripPage />\n• <TripDetailPage /> (Master Hub)\n  - <InteractiveMap /> (Leaflet)\n  - <BudgetChart /> (Spending Gauge)\n  - Day-by-Day Timeline Items\n  - Accommodations & Transit Stays\n  - Packing Checklist Tracker\n• <ProfilePage />", 
            color="#1E293B", fontsize=7.5, ha='center')

    a_box = patches.FancyBboxPatch((73, 14), 22, 28, boxstyle="round,pad=0.5", ec="#F59E0B", fc="#FFFBEB")
    ax.add_patch(a_box)
    ax.text(84, 38, "ADMIN PORTAL\n<AdminRoute>", color="#B45309", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(84, 25, "• <AdminDashboardPage />\n  - System Metrics KPI\n  - Destinations CRUD\n  - Registered Users Table\n  - Role Management", 
            color="#334155", fontsize=7.5, ha='center')

    ax.plot([50, 50], [76, 70], color='#2563EB', lw=1.5)
    ax.plot([50, 50], [62, 55], color='#0D9488', lw=1.5)
    ax.plot([18, 82], [55, 55], color='#64748B', lw=1)
    ax.plot([18, 18], [55, 48], color='#64748B', lw=1)
    ax.plot([82, 82], [55, 48], color='#64748B', lw=1)

    ax.plot([50, 18], [48, 42], color='#3B82F6', lw=1, ls=':')
    ax.plot([50, 52], [48, 42], color='#10B981', lw=1.5)
    ax.plot([50, 84], [48, 42], color='#F59E0B', lw=1, ls=':')

    path = os.path.join(assets_dir, 'wad_fig2_component_hierarchy.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_wad_fig3():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "EXPRESS 5 REST API REQUEST-RESPONSE LIFECYCLE", color="white", fontsize=12, fontweight='bold', ha='center', va='center')

    steps = [
        ("1. HTTP Request", "Client initiates fetch/axios with Bearer JWT & JSON Payload", "#EFF6FF", "#2563EB", 10),
        ("2. Global Middleware", "CORS policy, JSON BodyParser (10mb), Morgan Dev Logger", "#F0FDFA", "#0D9488", 26),
        ("3. Modular Router", "URL Matching: /api/auth, /api/destinations, /api/trips, /api/admin", "#F5F3FF", "#7C3AED", 42),
        ("4. Auth Guard", "authenticateToken verifies JWT, extracts req.user { id, role }", "#FFFBEB", "#D97706", 58),
        ("5. Controller & Logic", "Validation, SQL Queries (sqlite3), Async Handler Execution", "#ECFDF5", "#059669", 74),
        ("6. JSON Response", "Standardized JSON Payload or Centralized Error Handler (500/403/404)", "#FEF2F2", "#DC2626", 90),
    ]

    for title, desc, fc, ec, x in steps:
        box = patches.FancyBboxPatch((x - 7, 30), 14, 46, boxstyle="round,pad=0.5", ec=ec, fc=fc, lw=2)
        ax.add_patch(box)
        ax.text(x, 70, title, color=ec, fontsize=8.5, fontweight='bold', ha='center', va='center')
        ax.text(x, 48, desc, color="#1E293B", fontsize=7, ha='center', va='center', wrap=True)

        if x < 90:
            ax.annotate('', xy=(x + 8.5, 53), xytext=(x + 5.5, 53),
                        arrowprops=dict(arrowstyle='->', color='#475569', lw=2, mutation_scale=12))

    b_box = patches.FancyBboxPatch((5, 8), 90, 14, boxstyle="round,pad=0.4", ec="#64748B", fc="#F8FAFC")
    ax.add_patch(b_box)
    ax.text(50, 16, "Key Architectural Features: Full Async/Await Non-Blocking I/O • Strict User Data Isolation\nStandardized HTTP Status Codes (200 OK, 201 Created, 400 Bad Request, 401/403 Forbidden, 404 Not Found)", 
            color="#334155", fontsize=8, ha='center', va='center')

    path = os.path.join(assets_dir, 'wad_fig3_rest_api_lifecycle.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_wad_fig4():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "END-TO-END AUTHENTICATION & TOKEN AUTHORIZATION FLOW", color="white", fontsize=12, fontweight='bold', ha='center', va='center')

    b1 = patches.FancyBboxPatch((5, 20), 20, 60, boxstyle="round,pad=0.5", ec="#2563EB", fc="#EFF6FF", lw=2)
    ax.add_patch(b1)
    ax.text(15, 75, "CLIENT (React UI)", color="#1E40AF", fontsize=9, fontweight='bold', ha='center')
    ax.text(15, 52, "1. User submits login\n(email, password)\n\n4. Stores JWT in\nlocalStorage & AuthContext\n\n5. Subsequent calls attach:\nAuthorization: Bearer <token>", 
            color="#1E293B", fontsize=7.5, ha='center')

    b2 = patches.FancyBboxPatch((30, 20), 30, 60, boxstyle="round,pad=0.5", ec="#0D9488", fc="#F0FDFA", lw=2)
    ax.add_patch(b2)
    ax.text(45, 75, "AUTH SERVICE (Express)", color="#0F766E", fontsize=9, fontweight='bold', ha='center')
    ax.text(45, 50, "2. Validates inputs\n\n3. bcrypt.compare(pass, hash)\n   If match -> jwt.sign(\n   { id, role, email }, SECRET)\n\n6. Middleware: jwt.verify()\n   -> req.user = decoded\n   -> Enforce RBAC & Isolation", 
            color="#1E293B", fontsize=7.5, ha='center')

    b3 = patches.FancyBboxPatch((65, 20), 30, 60, boxstyle="round,pad=0.5", ec="#7C3AED", fc="#F5F3FF", lw=2)
    ax.add_patch(b3)
    ax.text(80, 75, "DATABASE (SQLite / Firebase)", color="#6D28D9", fontsize=9, fontweight='bold', ha='center')
    ax.text(80, 50, "• Users table stores:\n  - password_hash (Bcrypt)\n  - role ('user' / 'admin')\n\n• Trips queried with:\n  WHERE user_id = req.user.id\n\n• Admin endpoints verify:\n  req.user.role === 'admin'", 
            color="#1E293B", fontsize=7.5, ha='center')

    ax.annotate('', xy=(30, 68), xytext=(25, 68), arrowprops=dict(arrowstyle='->', color='#2563EB', lw=2))
    ax.text(27.5, 70, "POST /login", color="#2563EB", fontsize=6.5, fontweight='bold', ha='center')

    ax.annotate('', xy=(65, 62), xytext=(60, 62), arrowprops=dict(arrowstyle='->', color='#0D9488', lw=2))
    ax.text(62.5, 64, "SELECT *", color="#0D9488", fontsize=6.5, fontweight='bold', ha='center')

    ax.annotate('', xy=(60, 50), xytext=(65, 50), arrowprops=dict(arrowstyle='->', color='#7C3AED', lw=2))
    ax.text(62.5, 52, "User Hash", color="#7C3AED", fontsize=6.5, fontweight='bold', ha='center')

    ax.annotate('', xy=(25, 42), xytext=(30, 42), arrowprops=dict(arrowstyle='->', color='#059669', lw=2))
    ax.text(27.5, 44, "200 + JWT", color="#059669", fontsize=6.5, fontweight='bold', ha='center')

    f_box = patches.FancyBboxPatch((5, 5), 90, 10, boxstyle="round,pad=0.4", ec="#64748B", fc="#F8FAFC")
    ax.add_patch(f_box)
    ax.text(50, 10, "Zero-Trust Architecture: Token expired? -> 401 Unauthorized | Wrong User/Unauthorized Trip? -> 403 Forbidden", 
            color="#334155", fontsize=8, fontweight='bold', ha='center', va='center')

    path = os.path.join(assets_dir, 'wad_fig4_auth_security_flow.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_wad_fig5():
    # UI Wireframe & Layout Architecture
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "HUMSAFAR: RESPONSIVE UI LAYOUT & WIREFRAME SCHEMATIC", color="white", fontsize=12, fontweight='bold', ha='center', va='center')

    # Top Navbar Mock
    nav = patches.FancyBboxPatch((5, 78), 90, 7, boxstyle="round,pad=0.2", ec="#1E293B", fc="#0F172A")
    ax.add_patch(nav)
    ax.text(8, 81.5, "🧭 HUMSAFAR", color="#818CF8", fontsize=9, fontweight='bold', va='center')
    ax.text(35, 81.5, "Destinations    Dashboard    Firestore Explorer    Admin", color="#94A3B8", fontsize=7.5, va='center')
    ax.text(88, 81.5, "[👤 Profile] [🚪 Logout]", color="#38BDF8", fontsize=7.5, ha='right', va='center')

    # Main Trip Hero Banner
    hero = patches.FancyBboxPatch((5, 58), 90, 17, boxstyle="round,pad=0.3", ec="#3B82F6", fc="#1E293B")
    ax.add_patch(hero)
    ax.text(8, 70, "🇯🇵 Spring Cherry Blossom Tour in Kyoto", color="#FFFFFF", fontsize=11, fontweight='bold')
    ax.text(8, 64, "📅 Nov 10 - Nov 15, 2026 (6 Days)  •  👥 2 Travelers  •  💵 Budget: $3,200  •  Status: ACTIVE", color="#94A3B8", fontsize=8)
    ax.text(8, 60, "Buttons: [➕ Add Activity]  [🏨 Add Stay]  [✈️ Add Transit]  [💰 Log Expense]  [📋 Duplicate]", color="#38BDF8", fontsize=7.5)

    # 3 Column Layout below
    # Col 1: Day-by-Day Timeline
    c1 = patches.FancyBboxPatch((5, 8), 34, 46, boxstyle="round,pad=0.4", ec="#CBD5E1", fc="#F8FAFC", lw=1.5)
    ax.add_patch(c1)
    ax.text(22, 50, "🧭 Day-by-Day Itinerary Timeline", color="#0F172A", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(22, 28, "• Day 1: Arrival & Historic Higashiyama\n  - 09:30 Matcha Tasting @ Uji ($35)\n  - 14:00 Kiyomizu-dera Temple ($10)\n  - 18:00 Gion Geisha District Tour ($60)\n\n• Day 2: Arashiyama Bamboo Grove\n  - 08:30 Sagano Scenic Train ($18)\n  - 12:00 Tenryu-ji Zen Gardens ($12)\n\n• Day 3: Fushimi Inari Shrine Hike\n  - 07:00 10,000 Torii Gates Trail", 
            color="#334155", fontsize=7, ha='center')

    # Col 2: Interactive Leaflet Map
    c2 = patches.FancyBboxPatch((41, 8), 28, 46, boxstyle="round,pad=0.4", ec="#0D9488", fc="#F0FDFA", lw=1.5)
    ax.add_patch(c2)
    ax.text(55, 50, "🗺️ Interactive Leaflet Map", color="#0F766E", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(55, 28, "[ OpenStreetMap Geo-Canvas ]\n\n📍 Kyoto Station (Transit Pin)\n📍 Machiya Villa (Hotel Indigo Pin)\n📍 Kiyomizu-dera (Green Sight Pin)\n📍 Arashiyama (Emerald Sight Pin)\n\n• Live Dynamic Marker Plotting\n• Popup Info Cards on Click\n• Auto-Centering Lat/Long Bounds", 
            color="#1E293B", fontsize=7, ha='center')

    # Col 3: Budget Chart & Packing Tracker
    c3 = patches.FancyBboxPatch((71, 8), 24, 46, boxstyle="round,pad=0.4", ec="#7C3AED", fc="#F5F3FF", lw=1.5)
    ax.add_patch(c3)
    ax.text(83, 50, "💰 Live Budget & Checklist", color="#6D28D9", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(83, 28, "Spent: $320.00 / $3,200 (10%)\n[=== Spending Gauge Bar ===]\n\nBreakdown by Category:\n• Food: $180.00 (56%)\n• Transit: $140.00 (44%)\n\n🎒 Packing Progress: 5/8 (62%)\n[x] Passport & JR Pass\n[x] Power Adapter\n[ ] Universal eSIM", 
            color="#1E293B", fontsize=7, ha='center')

    path = os.path.join(assets_dir, 'wad_fig5_ui_wireframes_layout.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_adbms_fig1():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 90), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 94, "HUMSAFAR: COMPLETE RELATIONAL ENTITY-RELATIONSHIP (ER) SCHEMA", color="white", fontsize=12, fontweight='bold', ha='center', va='center')

    u = patches.FancyBboxPatch((4, 58), 24, 26, boxstyle="round,pad=0.4", ec="#2563EB", fc="#EFF6FF", lw=2)
    ax.add_patch(u)
    ax.text(16, 80, "USERS", color="#1E40AF", fontsize=9.5, fontweight='bold', ha='center')
    ax.text(16, 68, "PK  id (INT)\n    name (VARCHAR)\n    email (VARCHAR, UQ)\n    password_hash (TEXT)\n    role ('user'|'admin')\n    avatar_url (TEXT)\n    created_at (DATETIME)", color="#1E293B", fontsize=7.2, ha='center')

    d = patches.FancyBboxPatch((72, 58), 24, 26, boxstyle="round,pad=0.4", ec="#0D9488", fc="#F0FDFA", lw=2)
    ax.add_patch(d)
    ax.text(84, 80, "DESTINATIONS", color="#0F766E", fontsize=9.5, fontweight='bold', ha='center')
    ax.text(84, 68, "PK  id (INT)\n    name, country, city\n    region, description\n    popular_attractions (JSON)\n    recommended_activities (JSON)\n    estimated_daily_cost\n    latitude, longitude, rating", color="#1E293B", fontsize=7.2, ha='center')

    t = patches.FancyBboxPatch((36, 52), 28, 32, boxstyle="round,pad=0.5", ec="#B45309", fc="#FEF3C7", lw=2.5)
    ax.add_patch(t)
    ax.text(50, 80, "TRIPS (Master Entity)", color="#92400E", fontsize=10, fontweight='bold', ha='center')
    ax.text(50, 65, "PK  id (INT)\nFK  user_id (INT) -> USERS(id)\nFK  destination_id (INT) -> DEST(id)\n    title (VARCHAR)\n    destination_name (VARCHAR)\n    start_date, end_date (DATE)\n    travelers_count (INT)\n    estimated_budget (DECIMAL)\n    status ('planning'|'active'|...)", color="#1E293B", fontsize=7.2, ha='center')

    children = [
        ("ITINERARY_DAYS", "PK id\nFK trip_id\n   day_number\n   date\n   title, notes", 6, 12, 17, 28, "#7C3AED", "#F5F3FF"),
        ("ITINERARY_ITEMS", "PK id\nFK day_id\nFK trip_id\n   title, category\n   start/end_time\n   location, cost\n   order_index", 25, 12, 16, 28, "#4F46E5", "#EEF2FF"),
        ("ACTIVITIES", "PK id\nFK trip_id\n   name, category\n   location, date\n   start/end_time\n   cost, booking_ref\n   status", 43, 12, 15, 28, "#059669", "#ECFDF5"),
        ("ACCOMMODATIONS", "PK id\nFK trip_id\n   name, type\n   check_in, check_out\n   nights, price/night\n   total_cost, booking_ref", 60, 12, 17, 28, "#D97706", "#FFFBEB"),
        ("TRANSPORTATIONS", "PK id\nFK trip_id\n   type (Flight/Train)\n   origin, destination\n   dep/arr_time\n   cost, booking_ref", 79, 12, 17, 28, "#DC2626", "#FEF2F2"),
    ]

    for name, fields, x, y, w, h, ec, fc in children:
        c_box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.3", ec=ec, fc=fc, lw=1.5)
        ax.add_patch(c_box)
        ax.text(x + w/2, y + h - 4, name, color=ec, fontsize=7.8, fontweight='bold', ha='center')
        ax.text(x + w/2, y + h/2 - 3, fields, color="#1E293B", fontsize=6.5, ha='center')

        ax.plot([50, x + w/2], [52, y + h], color='#64748B', lw=1.2, ls='--')

    ax.annotate('', xy=(36, 68), xytext=(28, 68), arrowprops=dict(arrowstyle='<->', color='#2563EB', lw=2))
    ax.text(32, 70.5, "1 : N\n(CASCADE)", color="#1E40AF", fontsize=7, fontweight='bold', ha='center')

    ax.annotate('', xy=(64, 68), xytext=(72, 68), arrowprops=dict(arrowstyle='<->', color='#0D9488', lw=2))
    ax.text(68, 70.5, "1 : N\n(SET NULL)", color="#0F766E", fontsize=7, fontweight='bold', ha='center')

    ax.plot([23, 25], [26, 26], color='#7C3AED', lw=2)
    ax.text(24, 28, "1 : N", color="#7C3AED", fontsize=6.5, fontweight='bold', ha='center')

    f_box = patches.FancyBboxPatch((4, 2), 92, 7, boxstyle="round,pad=0.3", ec="#94A3B8", fc="#F8FAFC")
    ax.add_patch(f_box)
    ax.text(50, 5.5, "Referential Integrity: ON DELETE CASCADE propagates from Trips to Itineraries, Activities, Stays, Transit, & Expenses.", color="#334155", fontsize=7.5, ha='center', va='center')

    path = os.path.join(assets_dir, 'adbms_fig1_er_diagram.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_adbms_fig2():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "CLOUD FIRESTORE NoSQL HIERARCHICAL DOCUMENT-COLLECTION MODEL", color="white", fontsize=11.5, fontweight='bold', ha='center', va='center')

    r1 = patches.FancyBboxPatch((5, 52), 42, 30, boxstyle="round,pad=0.5", ec="#2563EB", fc="#EFF6FF", lw=2)
    ax.add_patch(r1)
    ax.text(26, 77, "COLLECTION: users/", color="#1E40AF", fontsize=9.5, fontweight='bold', ha='center')
    ax.text(26, 64, "Document: {userId}\n• id: string\n• name: string\n• email: string\n• role: string ('user' | 'admin')\n• trips_count: number\n• updated_at: timestamp", 
            color="#1E293B", fontsize=7.5, ha='center')

    sub1 = patches.FancyBboxPatch((8, 12), 36, 34, boxstyle="round,pad=0.4", ec="#0D9488", fc="#F0FDFA", lw=2)
    ax.add_patch(sub1)
    ax.text(26, 41, "SUBCOLLECTION: users/{userId}/trips/", color="#0F766E", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(26, 26, "Document: {tripId}\n• title, destination_name, start/end_date\n• travelers_count, estimated_budget\n• itinerary_days: [ { day_number, items: [...] } ]\n• activities: [ { name, category, cost } ]\n• accommodations: [ { name, nights, cost } ]\n• transportations: [ { type, provider, cost } ]\n• expenses: [ { category, amount } ]", 
            color="#1E293B", fontsize=6.8, ha='center')

    ax.annotate('', xy=(26, 46), xytext=(26, 52), arrowprops=dict(arrowstyle='->', color='#0D9488', lw=2))

    r2 = patches.FancyBboxPatch((53, 52), 42, 30, boxstyle="round,pad=0.5", ec="#B45309", fc="#FEF3C7", lw=2)
    ax.add_patch(r2)
    ax.text(74, 77, "COLLECTION: destinations/", color="#92400E", fontsize=9.5, fontweight='bold', ha='center')
    ax.text(74, 64, "Document: {destinationId}\n• name, country, city, region\n• description, image_url, rating\n• popular_attractions: [ string ]\n• recommended_activities: [ string ]\n• estimated_daily_cost: number", 
            color="#1E293B", fontsize=7.5, ha='center')

    r3 = patches.FancyBboxPatch((53, 12), 42, 34, boxstyle="round,pad=0.5", ec="#7C3AED", fc="#F5F3FF", lw=2)
    ax.add_patch(r3)
    ax.text(74, 41, "COLLECTION: trips/ (Global Flat Index)", color="#6D28D9", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(74, 26, "Document: {tripId}\n• user_id, user_name, user_email\n• Complete de-normalized embedded arrays\n• Optimized for Global Search & Public Sharing\n• Summary Metrics (total_planned_activities,\n  total_expenses_amount, total_stays)", 
            color="#1E293B", fontsize=6.8, ha='center')

    path = os.path.join(assets_dir, 'adbms_fig2_nosql_firestore_hierarchy.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_adbms_fig3():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "HYBRID POLYGLOT DUAL-WRITE & ETL SYNCHRONIZATION PIPELINE", color="white", fontsize=11.5, fontweight='bold', ha='center', va='center')

    s1 = patches.FancyBboxPatch((5, 22), 24, 56, boxstyle="round,pad=0.5", ec="#2563EB", fc="#EFF6FF", lw=2)
    ax.add_patch(s1)
    ax.text(17, 72, "SOURCE (Relational)\nSQLite 3 Master", color="#1E40AF", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(17, 45, "• Normalized Tables (10)\n• FK Cascades\n• ACID Transactions\n• Local Fast Queries\n• Indexed Lookups", color="#1E293B", fontsize=7.5, ha='center')

    s2 = patches.FancyBboxPatch((35, 22), 30, 56, boxstyle="round,pad=0.5", ec="#0D9488", fc="#F0FDFA", lw=2)
    ax.add_patch(s2)
    ax.text(50, 72, "ETL & SYNC WORKER\n(Node.js Script / Pipeline)", color="#0F766E", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(50, 45, "1. Fetch normalized rows\n2. Tree Aggregation (Days,\n   Activities, Stays, Expenses)\n3. Compute Metrics\n   (total_spent, items_count)\n4. Multi-Tenant Batching\n5. setDoc(..., { merge: true })", color="#1E293B", fontsize=7.2, ha='center')

    s3 = patches.FancyBboxPatch((71, 22), 24, 56, boxstyle="round,pad=0.5", ec="#7C3AED", fc="#F5F3FF", lw=2)
    ax.add_patch(s3)
    ax.text(83, 72, "TARGET (NoSQL Cloud)\nGoogle Cloud Firestore", color="#6D28D9", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(83, 45, "• users/{userId}/trips/\n• Global trips/ index\n• Real-Time Cloud Listeners\n• Offline Persistence\n• Cloud Security Rules", color="#1E293B", fontsize=7.5, ha='center')

    ax.annotate('', xy=(35, 50), xytext=(29, 50), arrowprops=dict(arrowstyle='->', color='#2563EB', lw=2.5, mutation_scale=15))
    ax.text(32, 53, "Extract", color="#2563EB", fontsize=7, fontweight='bold', ha='center')

    ax.annotate('', xy=(71, 50), xytext=(65, 50), arrowprops=dict(arrowstyle='->', color='#0D9488', lw=2.5, mutation_scale=15))
    ax.text(68, 53, "Transform\n& Load", color="#0D9488", fontsize=7, fontweight='bold', ha='center')

    f_box = patches.FancyBboxPatch((5, 6), 90, 11, boxstyle="round,pad=0.3", ec="#64748B", fc="#F8FAFC")
    ax.add_patch(f_box)
    ax.text(50, 11.5, "Advantage: Best of both worlds — Relational ACID consistency for Core Transactions +\nNoSQL Cloud Scalability & High Availability for Global Clients.", color="#334155", fontsize=7.8, ha='center', va='center')

    path = os.path.join(assets_dir, 'adbms_fig3_hybrid_polyglot_sync.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_adbms_fig4():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "B-TREE INDEXING & QUERY EXECUTION OPTIMIZATION", color="white", fontsize=12, fontweight='bold', ha='center', va='center')

    b1 = patches.FancyBboxPatch((5, 22), 42, 58, boxstyle="round,pad=0.5", ec="#DC2626", fc="#FEF2F2", lw=2)
    ax.add_patch(b1)
    ax.text(26, 74, "WITHOUT INDEX (Full Table Scan)", color="#B91C1C", fontsize=9, fontweight='bold', ha='center')
    ax.text(26, 48, "• Query: SELECT * FROM trips WHERE user_id = 4\n• Complexity: O(N) Linear Time\n• Execution Plan:\n  SCAN trips\n• Disk I/O: Reads every page across table\n• Scalability: Severe degradation as trips grow", 
            color="#1E293B", fontsize=7.5, ha='center')

    b2 = patches.FancyBboxPatch((53, 22), 42, 58, boxstyle="round,pad=0.5", ec="#059669", fc="#ECFDF5", lw=2)
    ax.add_patch(b2)
    ax.text(74, 74, "WITH B-TREE INDEX (idx_trips_user)", color="#047857", fontsize=9, fontweight='bold', ha='center')
    ax.text(74, 48, "• DDL: CREATE INDEX idx_trips_user ON trips(user_id)\n• Complexity: O(log N) Logarithmic Time\n• Execution Plan:\n  SEARCH trips USING INDEX idx_trips_user\n• Disk I/O: Traverses tree depth (2-3 page reads)\n• Latency: Sub-millisecond instant response", 
            color="#1E293B", fontsize=7.5, ha='center')

    f_box = patches.FancyBboxPatch((5, 6), 90, 11, boxstyle="round,pad=0.3", ec="#64748B", fc="#F8FAFC")
    ax.add_patch(f_box)
    ax.text(50, 11.5, "Indexes Configured in Humsafar: idx_trips_user, idx_itinerary_days_trip, idx_itinerary_items_day,\nidx_activities_trip, idx_accommodations_trip, idx_transportations_trip, idx_expenses_trip.", 
            color="#334155", fontsize=7.5, ha='center', va='center')

    path = os.path.join(assets_dir, 'adbms_fig4_indexing_btree_query_plan.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

def create_adbms_fig5():
    # ACID Transaction & WAL Mode
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    t_box = patches.FancyBboxPatch((5, 88), 90, 8, boxstyle="round,pad=0.4", ec="#1E3A8A", fc="#1E3A8A")
    ax.add_patch(t_box)
    ax.text(50, 92, "TRANSACTION MANAGEMENT & WRITE-AHEAD LOGGING (WAL)", color="white", fontsize=12, fontweight='bold', ha='center', va='center')

    # 4 ACID Pillars
    pillars = [
        ("ATOMICITY (A)", "BEGIN TRANSACTION ... COMMIT/ROLLBACK\nAll child items cloned or none on failure.", 6, "#2563EB", "#EFF6FF"),
        ("CONSISTENCY (C)", "PRAGMA foreign_keys = ON\nReferential integrity enforced on all FK relations.", 28, "#0D9488", "#F0FDFA"),
        ("ISOLATION (I)", "Multi-version concurrency with WAL mode.\nReaders never block writers; writers never block readers.", 51, "#D97706", "#FFFBEB"),
        ("DURABILITY (D)", "Disk synch flushed to .wal & main .db\nCrash-safe instant recovery on process restart.", 74, "#059669", "#ECFDF5"),
    ]

    for title, desc, x, ec, fc in pillars:
        box = patches.FancyBboxPatch((x, 32), 20, 48, boxstyle="round,pad=0.4", ec=ec, fc=fc, lw=2)
        ax.add_patch(box)
        ax.text(x + 10, 72, title, color=ec, fontsize=8.5, fontweight='bold', ha='center')
        ax.text(x + 10, 50, desc, color="#1E293B", fontsize=7.2, ha='center', va='center', wrap=True)

    # WAL Architecture Box
    w_box = patches.FancyBboxPatch((5, 8), 90, 18, boxstyle="round,pad=0.4", ec="#64748B", fc="#F8FAFC")
    ax.add_patch(w_box)
    ax.text(50, 20, "SQLite WAL Mode Architecture: tripplanner.db (Main DB) + tripplanner.db-wal (Log) + tripplanner.db-shm (Shared Memory Index)", color="#0F172A", fontsize=8.5, fontweight='bold', ha='center')
    ax.text(50, 12, "Guarantees concurrent non-blocking reads during background ETL replication and multi-user travel planning.", color="#475569", fontsize=7.5, ha='center')

    path = os.path.join(assets_dir, 'adbms_fig5_acid_transaction_wal.png')
    plt.tight_layout()
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()

if __name__ == '__main__':
    create_wad_fig1()
    create_wad_fig2()
    create_wad_fig3()
    create_wad_fig4()
    create_wad_fig5()
    create_adbms_fig1()
    create_adbms_fig2()
    create_adbms_fig3()
    create_adbms_fig4()
    create_adbms_fig5()
    print("All 10 diagram assets generated successfully!")
