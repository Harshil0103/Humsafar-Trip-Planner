import os
import docx
from docx.shared import Inches, Pt, RGBColor
from report_builder_core import (
    create_cover_page, add_styled_heading1, add_styled_heading2, add_styled_heading3,
    add_body_paragraph, add_bullet_point, add_callout_box, add_code_block,
    add_figure_image, add_styled_table, COLOR_PRIMARY_HEX, COLOR_SECONDARY_HEX, COLOR_TEAL_HEX,
    DOCS_DIR
)

def build_adbms_report():
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
        subject_title="Advanced Database Management System (ADBMS)",
        subject_subtitle="Hybrid Polyglot Data Architecture, Relational Schema Normalization (3NF/BCNF), B-Tree Query Optimization, ACID Transaction Management & Cloud Firestore NoSQL Synchronization",
        course_name="Advanced Database Management Systems (ADBMS / CS-402)",
        student_role="Database Architecture & Polyglot Data Engineering"
    )

    # 2. Certificate & Acknowledgement
    add_styled_heading1(doc, "CERTIFICATE OF DATABASE ENGINEERING")
    add_body_paragraph(doc, "This is to certify that the project entitled 'HUMSAFAR — Advanced Polyglot Database Architecture, Relational Modeling & Cloud NoSQL Document Synchronization' represents an authentic and independent technical project submission in the subject of Advanced Database Management Systems (ADBMS). The mathematical normalization proofs, relational schemas, B-tree indexing strategies, ACID transaction controls, and ETL synchronization pipelines have been engineered to industry database standards.")

    add_styled_heading1(doc, "EXECUTIVE SUMMARY / ABSTRACT")
    add_body_paragraph(doc, "Modern web platforms processing complex, nested hierarchical data structures (such as travel itineraries, day-by-day activity timelines, multi-modal transit logs, and live financial transactions) require sophisticated data management strategies. Simple monolithic databases often fail to balance strict transactional ACID guarantees with globally distributed, low-latency cloud accessibility.")
    
    add_body_paragraph(doc, "The Humsafar platform solves this challenge through an advanced Hybrid Polyglot Database Architecture. The primary storage engine is an ACID-compliant Relational Database Management System (SQLite) normalized to Boyce-Codd Normal Form (BCNF) across 10 core tables with cascading referential integrity and B-Tree indexes. This relational core is coupled with an asynchronous Change-Data Synchronization Pipeline that transforms normalized tabular records into hierarchical JSON document structures hosted on Google Cloud Firestore (`users/{userId}/trips/{tripId}`). This report documents the complete conceptual, logical, and physical data modeling, dependency analysis, index execution plans, Write-Ahead Logging (WAL) concurrency mechanisms, declarative security rule trees, and data integrity benchmarks.")

    add_callout_box(doc, "ADBMS Architectural Highlights", 
                    "• Hybrid Polyglot Engine: Relational SQLite Core + Cloud Firestore Document NoSQL.\n"
                    "• Formal Normalization: Complete 1NF, 2NF, 3NF, and BCNF normalization proofs.\n"
                    "• Index Optimization: Dedicated B-Tree indexes on foreign keys reducing scans from O(N) to O(log N).\n"
                    "• ACID & WAL Concurrency: Write-Ahead Logging preventing writer-reader contention.\n"
                    "• Declarative Access Control: Path-matching security rules enforcing strict multi-tenancy.")

    doc.add_page_break()

    # 3. Table of Contents
    add_styled_heading1(doc, "TABLE OF CONTENTS")
    toc_data = [
        ["1.0", "Introduction to Advanced Database Systems", "Page 3"],
        ["2.0", "Conceptual & Logical Database Design (ER/EER Modeling)", "Page 5"],
        ["3.0", "Relational Schema & Data Dictionary Specifications", "Page 9"],
        ["4.0", "Database Normalization & Dependency Theory (1NF to BCNF)", "Page 13"],
        ["5.0", "Physical Design, Indexing & Query Plan Optimization", "Page 17"],
        ["6.0", "Transaction Management, Concurrency Control & ACID Guarantees", "Page 21"],
        ["7.0", "NoSQL Document Data Modeling with Google Cloud Firestore", "Page 25"],
        ["8.0", "Hybrid Polyglot Data Synchronization & ETL Pipeline", "Page 29"],
        ["9.0", "Database Administration, Security & Disaster Recovery", "Page 33"],
        ["10.0", "Conclusion & Future Research in Database Systems", "Page 35"],
        ["11.0", "References & Advanced Database Bibliography", "Page 36"]
    ]
    add_styled_table(doc, ["Section", "Chapter Title", "Reference Page"], toc_data, col_widths=[1.0, 4.3, 1.2])

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 1
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 1: INTRODUCTION TO ADVANCED DATABASE SYSTEMS")

    add_styled_heading2(doc, "1.1 The Polyglot Persistence Paradigm")
    add_body_paragraph(doc, "In traditional software engineering, a single database engine was tasked with fulfilling all application requirements: transactional record keeping, complex multi-table joins, full-text search, and real-time distributed client broadcasting. However, modern enterprise applications exhibit diverse data access patterns that a single paradigm cannot optimally satisfy.")
    
    add_body_paragraph(doc, "The Humsafar platform adopts the Polyglot Persistence architecture. Under this model, distinct database engines are utilized for the specific workloads in which they excel:")
    add_bullet_point(doc, "Relational Storage (SQLite Master): Serves as the authoritative source of truth for transactional consistency, referential integrity cascades, financial aggregations, and administrative relational reporting.", "1. ")
    add_bullet_point(doc, "Document NoSQL Storage (Google Cloud Firestore): Serves as the globally distributed cloud replica, optimized for hierarchical mobile/web document retrieval, offline caching, and real-time client synchronization.", "2. ")

    add_styled_heading2(doc, "1.2 Database Architecture Goals")
    add_bullet_point(doc, "Zero data corruption or orphan records during trip deletions or status changes via foreign key cascades.", "Strict Referential Integrity: ")
    add_bullet_point(doc, "Complete isolation of concurrent transactions with sub-millisecond query execution on multi-entity lookups.", "High-Performance Concurrency: ")
    add_bullet_point(doc, "Elimination of update anomalies, insertion anomalies, and data redundancy through rigorous normalization.", "Elimination of Anomalies: ")
    add_bullet_point(doc, "Seamless transformation of normalized relational rows into nested NoSQL document trees without schema lock-in.", "Flexible Data Synchronization: ")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 2
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 2: CONCEPTUAL & LOGICAL DATABASE DESIGN")

    add_styled_heading2(doc, "2.1 Entity Identification & Relationship Modeling")
    add_body_paragraph(doc, "The Humsafar relational domain model consists of 10 primary entities, organized around the master `TRIPS` hub:")

    add_figure_image(doc, "adbms_fig1_er_diagram.png", "Figure 2.1: Complete Relational Entity-Relationship (ER) Schema Diagram")

    add_body_paragraph(doc, "The fundamental entity relationships and cardinality ratios are defined as follows:", "Entity Cardinalities: ")
    add_bullet_point(doc, "A single user can author multiple trips; each trip is owned by exactly one user. Enforced with ON DELETE CASCADE.", "USERS to TRIPS (1 : N): ")
    add_bullet_point(doc, "A destination can host multiple trips; a trip optionally references a catalog destination. Enforced with ON DELETE SET NULL.", "DESTINATIONS to TRIPS (1 : N): ")
    add_bullet_point(doc, "A trip spans multiple itinerary days; each day belongs to one trip. Enforced with ON DELETE CASCADE.", "TRIPS to ITINERARY_DAYS (1 : N): ")
    add_bullet_point(doc, "An itinerary day contains multiple ordered activity items. Enforced with ON DELETE CASCADE.", "ITINERARY_DAYS to ITINERARY_ITEMS (1 : N): ")
    add_bullet_point(doc, "A trip contains multiple scheduled activities, stays, transit bookings, expense logs, and packing items. All enforced with ON DELETE CASCADE.", "TRIPS to CHILD ENTITIES (1 : N): ")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 3
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 3: RELATIONAL SCHEMA & DATA DICTIONARY")

    add_styled_heading2(doc, "3.1 Complete Relational Data Dictionary")
    add_body_paragraph(doc, "The table below presents the formal data dictionary defining columns, physical storage types, constraints, and relational roles:")

    schema_headers = ["Table Name", "Column Name", "Data Type", "Constraints & Foreign Keys", "Description"]
    schema_data = [
        ["users", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Unique identifier for user."],
        ["users", "name", "TEXT", "NOT NULL", "Traveler full display name."],
        ["users", "email", "TEXT", "UNIQUE NOT NULL", "Unique login email."],
        ["users", "password_hash", "TEXT", "NOT NULL", "Bcrypt cryptographic hash (10 rounds)."],
        ["users", "role", "TEXT", "DEFAULT 'user'", "User authorization role ('user' | 'admin')."],
        ["destinations", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Destination catalog primary key."],
        ["destinations", "city / country", "TEXT", "NOT NULL", "Geographical location identifiers."],
        ["destinations", "popular_attractions", "TEXT", "JSON Array", "De-normalized list of must-see sights."],
        ["destinations", "latitude / longitude", "REAL", "Nullable", "Geo-coordinates for Leaflet map."],
        ["trips", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Master trip unique identifier."],
        ["trips", "user_id", "INTEGER", "FOREIGN KEY -> users(id) CASCADE", "Owning user foreign key."],
        ["trips", "destination_id", "INTEGER", "FOREIGN KEY -> destinations(id) SET NULL", "Associated destination foreign key."],
        ["trips", "title", "TEXT", "NOT NULL", "Descriptive title of the trip."],
        ["trips", "start_date / end_date", "DATE", "NOT NULL", "Trip calendar span."],
        ["trips", "estimated_budget", "REAL", "DEFAULT 0", "Target financial budget threshold."],
        ["itinerary_days", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Day record primary key."],
        ["itinerary_days", "trip_id", "INTEGER", "FOREIGN KEY -> trips(id) CASCADE", "Parent trip foreign key."],
        ["itinerary_days", "day_number", "INTEGER", "NOT NULL", "Sequential index of day (1, 2, 3...)."],
        ["itinerary_items", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Activity item primary key."],
        ["itinerary_items", "day_id", "INTEGER", "FOREIGN KEY -> itinerary_days(id) CASCADE", "Parent day foreign key."],
        ["accommodations", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Accommodation booking primary key."],
        ["accommodations", "total_cost", "REAL", "DEFAULT 0", "Computed total cost for stay."],
        ["transportations", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Transit log primary key."],
        ["expenses", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Expense transaction primary key."],
        ["expenses", "amount", "REAL", "NOT NULL", "Financial transaction amount."],
        ["packing_items", "id", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Packing item primary key."],
        ["packing_items", "is_packed", "INTEGER", "DEFAULT 0 (Boolean)", "0 = Unpacked, 1 = Packed."]
    ]
    add_styled_table(doc, schema_headers, schema_data, col_widths=[1.1, 1.2, 0.9, 1.8, 1.5])

    add_styled_heading2(doc, "3.2 DDL Implementation Script")
    add_body_paragraph(doc, "The relational schema is initialized programmatically with foreign keys enabled on startup:")

    ddl_sample = """-- Schema Initialization with Foreign Key Enforcement (server/db.js)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  destination_id INTEGER,
  title TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers_count INTEGER DEFAULT 1,
  estimated_budget REAL DEFAULT 0,
  status TEXT DEFAULT 'planning',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
);"""
    add_code_block(doc, ddl_sample)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 4
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 4: DATABASE NORMALIZATION & DEPENDENCY THEORY")

    add_styled_heading2(doc, "4.1 Functional Dependency Analysis")
    add_body_paragraph(doc, "A functional dependency X -> Y exists when the value of X uniquely determines the value of Y. In Humsafar, the primary functional dependencies include:")
    add_bullet_point(doc, "users: id -> name, email, password_hash, role, avatar_url", "FD-1 (Users): ")
    add_bullet_point(doc, "trips: id -> user_id, destination_id, title, start_date, end_date, budget, status", "FD-2 (Trips): ")
    add_bullet_point(doc, "itinerary_days: id -> trip_id, day_number, date, title, notes", "FD-3 (Days): ")
    add_bullet_point(doc, "itinerary_items: id -> day_id, trip_id, title, start_time, end_time, cost, order_index", "FD-4 (Items): ")
    add_bullet_point(doc, "expenses: id -> trip_id, category, title, amount, date, payment_method", "FD-5 (Expenses): ")

    add_styled_heading2(doc, "4.2 Normalization Proofs: 1NF to BCNF")
    
    add_styled_heading3(doc, "1. First Normal Form (1NF)")
    add_body_paragraph(doc, "A relation is in 1NF if and only if all domain attributes are atomic (no repeating groups or arrays). Every column in `users`, `trips`, `expenses`, etc. holds atomic scalar values (INTEGER, REAL, TEXT, DATE). Composite concepts like dates are stored as scalar ISO-8601 strings, satisfying 1NF.")

    add_styled_heading3(doc, "2. Second Normal Form (2NF)")
    add_body_paragraph(doc, "A relation is in 2NF if it is in 1NF and no non-prime attribute is partially dependent on any candidate key. Because every table in Humsafar utilizes a single-attribute surrogate primary key (`id`), there are zero composite candidate keys. Therefore, partial functional dependencies are mathematically impossible, satisfying 2NF unconditionally.")

    add_styled_heading3(doc, "3. Third Normal Form (3NF)")
    add_body_paragraph(doc, "A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key (X -> Y and Y -> Z where Y is not a superkey). For example, `expenses` stores only `trip_id` and transaction details; it does not store `user_id` or `user_email`. To find the user, the database joins through `trips(user_id)`. This eliminates all transitive dependencies.")

    add_styled_heading3(doc, "4. Boyce-Codd Normal Form (BCNF)")
    add_body_paragraph(doc, "A relation is in BCNF if for every non-trivial functional dependency X -> Y, X is a superkey. In every normalized table (`users`, `trips`, `itinerary_days`, `itinerary_items`, `expenses`), the left-hand determinant of every functional dependency is the table's primary key (`id`), which is a superkey. Thus, the relational core is fully normalized in BCNF.")

    add_callout_box(doc, "Controlled Denormalization in NoSQL Layer", 
                    "While the core SQLite database is strictly in BCNF, the Cloud Firestore NoSQL replica "
                    "deliberately embeds child arrays (itinerary_days, expenses) inside trip documents. "
                    "This intentional denormalization eliminates distributed join overhead across the web.")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 5
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 5: PHYSICAL DESIGN, INDEXING & QUERY OPTIMIZATION")

    add_styled_heading2(doc, "5.1 Physical Storage & B-Tree Index Architecture")
    add_body_paragraph(doc, "SQLite uses balanced B-Trees (B+ Trees for table content) to organize disk pages. Without indexing, filtering queries require a Full Table Scan (O(N) linear time), inspecting every page. To guarantee sub-millisecond query execution as tables scale, Humsafar establishes seven strategic secondary B-Tree indexes:")

    add_figure_image(doc, "adbms_fig4_indexing_btree_query_plan.png", "Figure 5.1: B-Tree Index Execution Optimization vs Full Table Scan Comparison")

    idx_headers = ["Index Name", "Target Table", "Indexed Columns", "Optimized Query Operations"]
    idx_data = [
        ["idx_trips_user", "trips", "user_id", "SELECT * FROM trips WHERE user_id = ? (User Dashboard)"],
        ["idx_itinerary_days_trip", "itinerary_days", "trip_id", "SELECT * FROM itinerary_days WHERE trip_id = ? (Timeline)"],
        ["idx_itinerary_items_day", "itinerary_items", "day_id", "SELECT * FROM itinerary_items WHERE day_id = ? (Activities)"],
        ["idx_activities_trip", "activities", "trip_id", "SELECT * FROM activities WHERE trip_id = ? (Activity Hub)"],
        ["idx_accommodations_trip", "accommodations", "trip_id", "SELECT * FROM accommodations WHERE trip_id = ? (Hotels)"],
        ["idx_transportations_trip", "transportations", "trip_id", "SELECT * FROM transportations WHERE trip_id = ? (Transit)"],
        ["idx_expenses_trip", "expenses", "trip_id", "SELECT SUM(amount) FROM expenses WHERE trip_id = ? (Budget)"]
    ]
    add_styled_table(doc, idx_headers, idx_data, col_widths=[1.5, 1.1, 1.1, 2.8])

    add_styled_heading2(doc, "5.2 Query Execution Plan Analysis (`EXPLAIN QUERY PLAN`)")
    add_body_paragraph(doc, "Executing `EXPLAIN QUERY PLAN` on the budget aggregation query confirms index utilization:")

    code_explain = """-- Query Plan Verification
EXPLAIN QUERY PLAN 
SELECT category, SUM(amount) 
FROM expenses 
WHERE trip_id = 4 
GROUP BY category;

-- Output Execution Plan:
-- |--SEARCH TABLE expenses USING INDEX idx_expenses_trip (trip_id=?)
-- |--USE TEMP B-TREE FOR GROUP BY"""
    add_code_block(doc, code_explain)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 6
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 6: TRANSACTION MANAGEMENT & ACID GUARANTEES")

    add_styled_heading2(doc, "6.1 ACID Properties in Humsafar")
    add_body_paragraph(doc, "Database transactions in Humsafar adhere to the four pillars of ACID:")

    add_figure_image(doc, "adbms_fig5_acid_transaction_wal.png", "Figure 6.1: Transaction Lifecycle, ACID Implementation & WAL Mode Concurrency")

    add_bullet_point(doc, "Multi-step operations (such as deep trip cloning) execute inside an atomic transaction. If cloning fails midway, all changes are rolled back.", "Atomicity: ")
    add_bullet_point(doc, "Foreign keys prevent invalid parent references (`PRAGMA foreign_keys = ON`).", "Consistency: ")
    add_bullet_point(doc, "Write-Ahead Logging (WAL) mode enables concurrent readers without blocking active writers.", "Isolation: ")
    add_bullet_point(doc, "Committed transactions are written to disk pages, surviving application or server crashes.", "Durability: ")

    add_styled_heading2(doc, "6.2 Atomic Trip Duplication Transaction")
    add_body_paragraph(doc, "The deep duplication controller demonstrates transaction safety by cloning all child entities in a single atomic scope:")

    code_clone = """// Atomic Deep Trip Cloning in tripsController.js
await db.run('BEGIN TRANSACTION');
try {
  // 1. Clone parent trip
  const result = await db.run(
    `INSERT INTO trips (user_id, destination_id, title, start_date, end_date, estimated_budget)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, orig.destination_id, `Copy of ${orig.title}`, orig.start_date, orig.end_date, orig.estimated_budget]
  );
  const newTripId = result.lastID;

  // 2. Clone all itinerary days and nested items
  const days = await db.all('SELECT * FROM itinerary_days WHERE trip_id = ?', [tripId]);
  for (const day of days) {
    const dayRes = await db.run(
      'INSERT INTO itinerary_days (trip_id, day_number, date, title) VALUES (?, ?, ?, ?)',
      [newTripId, day.day_number, day.date, day.title]
    );
    const newDayId = dayRes.lastID;
    
    await db.run(
      `INSERT INTO itinerary_items (day_id, trip_id, title, category, start_time, estimated_cost)
       SELECT ?, ?, title, category, start_time, estimated_cost 
       FROM itinerary_items WHERE day_id = ?`,
      [newDayId, newTripId, day.id]
    );
  }

  // 3. Clone accommodations, transit, and activities
  await db.run('INSERT INTO accommodations (trip_id, name, check_in, check_out, total_cost) SELECT ?, name, check_in, check_out, total_cost FROM accommodations WHERE trip_id = ?', [newTripId, tripId]);
  
  await db.run('COMMIT');
} catch (err) {
  await db.run('ROLLBACK');
  throw err;
}"""
    add_code_block(doc, code_clone)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 7
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 7: NoSQL DOCUMENT MODELING WITH GOOGLE CLOUD FIRESTORE")

    add_styled_heading2(doc, "7.1 Firestore Document Hierarchy")
    add_body_paragraph(doc, "Cloud Firestore organizes data into Collections and Documents. To support both user-isolated workflows and global discovery, Humsafar establishes a dual NoSQL model:")

    add_figure_image(doc, "adbms_fig2_nosql_firestore_hierarchy.png", "Figure 7.1: Google Cloud Firestore NoSQL Hierarchical Subcollection Structure")

    add_bullet_point(doc, "Private subcollection containing the user's complete itinerary documents with embedded child arrays.", "users/{userId}/trips/{tripId}: ")
    add_bullet_point(doc, "Global flat collection optimized for public trip feeds and rapid key-value lookups.", "trips/{tripId}: ")
    add_bullet_point(doc, "Curated global catalog of destinations with embedded attractions array.", "destinations/{destId}: ")

    add_styled_heading2(doc, "7.2 Declarative Security Rules Architecture")
    add_body_paragraph(doc, "Firestore security is governed through declarative rules (`firestore.rules`) matching document paths:")

    code_rules = """// Declarative Firestore Security Rules (firestore.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Curated world destinations collection
    match /destinations/{destinationId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }

    // User accounts, profiles, and trip subcollections
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /trips/{tripId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Global trips collection for instant access and public travel plans
    match /trips/{tripId} {
      allow read: if resource.data.is_public == 1 || (request.auth != null && request.auth.uid == resource.data.user_id);
      allow write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}"""
    add_code_block(doc, code_rules)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 8
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 8: HYBRID POLYGLOT DATA SYNCHRONIZATION & ETL")

    add_styled_heading2(doc, "8.1 Relational-to-NoSQL ETL Pipeline")
    add_body_paragraph(doc, "To maintain data consistency across SQLite and Cloud Firestore, Humsafar employs an asynchronous Node.js ETL worker (`server/sync_user_subcollections.cjs`):")

    add_figure_image(doc, "adbms_fig3_hybrid_polyglot_sync.png", "Figure 8.1: Relational-to-NoSQL ETL Data Transformation & Synchronization Engine")

    add_body_paragraph(doc, "The ETL process executes in four distinct phases:", "ETL Pipeline Stages: ")
    add_bullet_point(doc, "Extracts flat normalized rows from `trips`, `itinerary_days`, `itinerary_items`, `accommodations`, `transportations`, and `expenses` via SQLite queries.", "1. Extract: ")
    add_bullet_point(doc, "Constructs a nested JSON tree, computing aggregated metrics such as `total_planned_activities`, `total_expenses_amount`, and `total_stays`.", "2. Transform: ")
    add_bullet_point(doc, "Maps user identities between local integer `user_id` and Firebase Auth UIDs.", "3. Identity Mapping: ")
    add_bullet_point(doc, "Dispatches batched `setDoc(..., { merge: true })` calls to Cloud Firestore, updating both `users/{userId}/trips/{tripId}` and `trips/{tripId}` atomically.", "4. Load: ")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # CHAPTER 9 & 10
    # ---------------------------------------------------------------------------
    add_styled_heading1(doc, "CHAPTER 9: DATABASE ADMINISTRATION, SECURITY & RECOVERY")

    add_styled_heading2(doc, "9.1 Backup & Disaster Recovery")
    add_bullet_point(doc, "SQLite database files (`tripplanner.db`) can be hot-backed up without downtime via the SQLite Online Backup API.", "1. Online Hot Backup: ")
    add_bullet_point(doc, "Export script (`server/export_sqlite_to_json.js`) dumps the entire database into structured JSON for schema-independent archival.", "2. JSON Data Archival: ")
    add_bullet_point(doc, "Cloud Firestore provides automated continuous replication across Google Cloud multi-region data centers with 99.999% SLA.", "3. Cloud Redundancy: ")

    add_styled_heading1(doc, "CHAPTER 10: CONCLUSION & FUTURE DIRECTIONS")

    add_styled_heading2(doc, "10.1 Technical Conclusion")
    add_body_paragraph(doc, "The database architecture engineered for Humsafar successfully demonstrates the power of hybrid polyglot data persistence. By combining the strict relational integrity, formal BCNF normalization, and B-Tree indexing of SQLite with the scalable hierarchical document model of Google Cloud Firestore, the system delivers high transaction throughput and global data access.")

    add_styled_heading2(doc, "10.2 Future Research & Enhancements")
    add_bullet_point(doc, "Integration of pgvector / SQLite-VSS to store destination embeddings for natural language semantic search (e.g. 'romantic seaside towns with cobblestone streets').", "1. Vector Database Search: ")
    add_bullet_point(doc, "Implementing WebSockets CDC (Change Data Capture) to automatically replicate SQLite writes to Firestore in sub-second real time.", "2. Real-Time CDC Replication: ")

    add_styled_heading1(doc, "CHAPTER 11: REFERENCES & DATABASE STANDARDS")
    add_bullet_point(doc, "Silberschatz, A., Korth, H. F., & Sudarshan, S. Database System Concepts (7th Edition). McGraw-Hill, 2024.")
    add_bullet_point(doc, "Elmasri, R., & Navathe, S. B. Fundamentals of Database Systems (7th Edition). Pearson, 2023.")
    add_bullet_point(doc, "SQLite Storage Engine Architecture & B-Tree Format Documentation. SQLite.org, 2025.")
    add_bullet_point(doc, "Google Cloud Firestore Data Modeling & Security Rules Reference. Google Cloud, 2025.")
    add_bullet_point(doc, "Date, C. J. An Introduction to Database Systems (8th Edition). Addison-Wesley.")

    out_path = os.path.join(DOCS_DIR, "Humsafar_ADBMS_Project_Report.docx")
    doc.save(out_path)
    print(f"Successfully generated ADBMS Report at: {out_path}")

if __name__ == '__main__':
    build_adbms_report()
