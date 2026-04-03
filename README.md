# Fin Book – Finance Dashboard Backend

Fin Book is a high-performance, production-grade backend focused on financial data management, security, and advanced analytics. Built with a focus on role-based access control (RBAC), it provides a secure and scalable environment for handling multi-user financial records with precision.

---

## 1. Project Overview

The Fin Book backend serves as the secure engine for a professional finance dashboard. It is engineered to support multiple users with distinct roles — Admin, Analyst, and Viewer — ensuring that financial data is isolated, protected, and accessible only to authorized personnel. The backend handles complex aggregations, identity verification, and record management through a clean REST API.

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | Modern, high-performance Python web framework |
| **PostgreSQL (Supabase)** | Relational database for persistent financial data |
| **SQLAlchemy ORM** | Object-relational mapping for clean database interactions |
| **Pydantic** | Data validation and serialization for all requests/responses |
| **Supabase JWT Auth** | Secure, industry-standard authentication and token management |

---

## 3. Architecture Overview

The system follows a clean, modular request-response flow:

```
Frontend (React/Vite)
        ↓
FastAPI Layer  ←  JWT Verification + Role Enforcement
        ↓
PostgreSQL Database (Supabase)
```

The FastAPI layer acts as the primary orchestrator — it verifies the Supabase JWT on every incoming request, resolves the user's role, enforces access rules, and then interacts with the PostgreSQL database through SQLAlchemy.

---

## 4. Folder Structure

```text
backend/
├── main.py              # Application entry point, CORS, and router registration
├── core/
│   ├── config.py        # Environment variable and settings management
│   ├── database.py      # SQLAlchemy engine, sessions, and Supabase client
│   └── security.py      # JWT verification and role-based dependency logic
├── models/
│   ├── user.py          # User ORM model with role ENUM
│   └── record.py        # Financial record ORM model with relationships
├── schemas/
│   ├── user.py          # Pydantic schemas for user validation
│   └── record.py        # Pydantic schemas for record validation
└── routes/
    ├── auth.py          # Authentication and profile management endpoints
    ├── records.py       # Financial record CRUD endpoints
    ├── analytics.py     # Analytics and aggregation endpoints
    └── users.py         # Admin user management endpoints
```

---

## 5. Authentication & Authorization

Fin Book uses **JWT-based authentication** provided by Supabase.

**Flow:**
1. The client sends a `Bearer` token in the `Authorization` header.
2. The `get_current_user` dependency verifies the token against Supabase Auth.
3. The backend fetches the corresponding user from the internal `users` table to retrieve their `role` and `is_active` status.
4. The `require_role` dependency factory then enforces access based on the allowed roles for that endpoint.

### Role Hierarchy

| Role | Access Level | Description |
|---|---|---|
| **Viewer** | Read-Only | Can view records and dashboard stats only |
| **Analyst** | Read + Analytics | Can view records and access all analytical endpoints |
| **Admin** | Full Access | Full CRUD on all data, plus user management |

---

## 6. User & Role Management

- **Storage**: User profiles are stored in the local `users` table, synchronized with Supabase Auth identities at signup.
- **Roles**: Stored as a PostgreSQL `ENUM` type (`viewer`, `analyst`, `admin`) to prevent invalid values at the database level.
- **Administration**: Admin users can promote roles, activate/deactivate accounts, and list all users through restricted endpoints.

---

## 7. Financial Records Management

Each financial record stores the following fields:

| Field | Type | Description |
|---|---|---|
| `amount` | Float | Monetary value of the transaction |
| `type` | ENUM | `income` or `expense` |
| `category` | String | Tag for the transaction (e.g., Salary, Rent) |
| `date` | Date | When the transaction occurred |
| `notes` | Text | Optional description |
| `user_id` | UUID (FK) | Owner of the record |

### CRUD Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/records/` | Create a new record | Admin, Analyst |
| `GET` | `/api/v1/records/` | List and filter records | All roles |
| `PUT` | `/api/v1/records/{id}` | Update an existing record | Admin, Analyst (own) |
| `DELETE` | `/api/v1/records/{id}` | Delete a record | Admin only |

**Filtering & Pagination**: The `GET` endpoint supports `type`, `category`, `start_date`, `end_date`, `skip`, and `limit` as query parameters.

---

## 8. Analytics APIs

The analytics engine performs all heavy computation on the server side using SQLAlchemy aggregate functions, keeping the frontend lightweight and consistent.

| Endpoint | Description |
|---|---|
| `GET /api/v1/analytics/summary` | Total income, expenses, net balance, and transaction count |
| `GET /api/v1/analytics/trends` | Month-by-month income vs expense aggregation |
| `GET /api/v1/analytics/distribution` | Category-wise spending breakdown (percentages) |
| `GET /api/v1/analytics/health-score` | Algorithmic financial health score (0–100) |
| `GET /api/v1/analytics/pro-insights` | Actionable text insights generated from spending patterns |

All aggregations use SQLAlchemy's `func.sum()` and `func.count()` to push computation to the database engine for maximum efficiency.

---

## 9. Access Control Logic

Access is enforced at both the **route level** (via `Depends()`) and the **row level** (via ownership checks within route handlers).

### Permissions Matrix

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| View Records | Allowed | Allowed | Allowed |
| View Analytics | Allowed | Allowed | Allowed |
| Create Records | **Denied** | Allowed | Allowed |
| Edit Own Records | **Denied** | Allowed | Allowed |
| Edit Any Record | **Denied** | **Denied** | Allowed |
| Delete Records | **Denied** | **Denied** | Allowed |
| Manage Users | **Denied** | **Denied** | Allowed |

**Ownership Rule**: When an Analyst attempts to update a record, the backend verifies that `record.user_id == current_user.id`. If not, a `403 Forbidden` is returned immediately.

```python
if current_user.role != UserRole.admin and record.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Cannot edit others' records")
```

---

## 10. Database Design

### Tables

**`users`**
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | String | Indexed |
| `email` | String | Unique, Indexed |
| `role` | ENUM | `viewer` / `analyst` / `admin` |
| `is_active` | Boolean | Default `true` |

**`records`**
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary Key |
| `amount` | Float | Not Null |
| `type` | ENUM | `income` / `expense`, Not Null |
| `category` | String | Indexed |
| `date` | Date | Not Null |
| `notes` | Text | Nullable |
| `user_id` | UUID | Foreign Key → `users.id` |

**Relationship**: One `User` → Many `Records` (enforced via Foreign Key constraint).

**Indexing**: `category` and `date` columns are indexed to ensure performant filtering and analytics queries across large datasets.

---

## 11. Validation & Error Handling

All request bodies are validated by **Pydantic** before reaching route handlers. Invalid data is rejected before it touches the database.

| HTTP Code | Meaning | When Raised |
|---|---|---|
| `400` | Bad Request | Input validation failure |
| `401` | Unauthorized | Missing or expired JWT token |
| `403` | Forbidden | Insufficient role permissions |
| `404` | Not Found | Requested resource does not exist |

---

## 12. Running Locally

**Step 1**: Install dependencies
```bash
pip install -r requirements.txt
```

**Step 2**: Configure environment variables by copying `.env.example` to `.env` and filling in:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (Supabase direct connection string)

**Step 3**: Start the server
```bash
uvicorn main:app --reload
```

API will be available at `http://localhost:8000`.
Interactive docs available at `http://localhost:8000/docs`.

---

## 13. Key Highlights

- **Clean Architecture**: Fully modular structure separating models, schemas, routes, and core logic.
- **Role-Based Security**: Granular access control enforced at both route and row levels.
- **Analytics Engine**: Server-side aggregation keeps the frontend fast and the data consistent.
- **Scalable Design**: Built to handle large datasets and concurrent multi-user environments.

---

## 14. Conclusion

The Fin Book backend delivers a production-ready financial data management API. Its combination of strict role enforcement, server-side analytics, and clean modular architecture makes it a robust and secure foundation for any professional finance dashboard application.
