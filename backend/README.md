# Fin Book – Finance Dashboard Backend

Fin Book is a high-performance, production-grade backend designed to manage complex financial data with a focus on security, role-based access control, and advanced data analytics. It provides a secure API for tracking transactions, analyzing spending patterns, and managing user permissions in a multi-user environment.

## 1. Project Overview
The Fin Book backend is built to serve as the secure engine for a modern finance dashboard. It facilitates data isolation and specialized access levels, enabling multiple users—ranging from basic viewers to administrative overseers—to interact with a shared pool of financial records while strictly enforcing modification rights.

## 2. Tech Stack
The system leverages a modern, scalable stack for maximum reliability:
- **FastAPI**: A high-performance web framework for building APIs with Python 3.10+.
- **PostgreSQL (Supabase)**: A robust relational database for persistent storage.
- **SQLAlchemy ORM**: For clean, object-relational mapping and database abstraction.
- **Pydantic**: For rigorous data validation and settings management.
- **Supabase JWT Authentication**: Industry-standard secure authentication.

## 3. Architecture Overview
The architecture follows a standard Request-Response flow optimized for speed:
1. **Frontend**: Sends authenticated HTTP requests (Vite/React).
2. **FastAPI**: Receives the request, validates the JWT, and enforces role-based logic.
3. **Database**: Executes efficient SQL queries via SQLAlchemy to retrieve or modify data in the PostgreSQL instance (Supabase).

## 4. Folder Structure
The backend is organized into modular directories to ensure maintainability:
```text
backend/
├── main.py              # Application entry point & FastAPI initialization
├── core/                # Configuration, Database engine, and Security logic
├── models/              # SQLAlchemy ORM database models
├── schemas/             # Pydantic validation models (Input/Output)
├── routes/              # Domain-specific API routers (Auth, Records, Analytics)
└── requirements.txt     # Backend dependency list
```

## 5. Authentication & Authorization
Security is handled through a JWT-based authentication system integrated with **Supabase**.
- **Token Verification**: Every request requires a valid Bearer token in the Authorization header.
- **User Retrieval**: The backend verifies the token with Supabase and then fetches the corresponding user profile and role from the local database.
- **Role-Based Access Control (RBAC)**: We use a custom FastAPI `Depends()` factory called `require_role` to protect endpoints based on the following hierarchy:
    - **Viewer**: Read-only access to records and analytics.
    - **Analyst**: Read access + access to advanced analytics modules.
    - **Admin**: Full administrative control over all records and users.

## 6. User & Role Management
User identities are synchronized between Supabase and the local `users` table. 
- **Roles**: Stored as a database-level `ENUM` to prevent invalid entries.
- **Management**: Administrators have dedicated endpoints to promote users or modify account statuses (`is_active`).

## 7. Financial Records Management
The core of the system is the management of financial transactions with fields including `amount`, `type` (income/expense), `category`, `date`, `notes`, and `user_id`.

**Standard CRUD Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/v1/records/` | Create a new financial record |
| GET    | `/api/v1/records/` | Fetch records with filtering & pagination |
| PUT    | `/api/v1/records/{id}` | Update an existing record |
| DELETE | `/api/v1/records/{id}` | Permanently remove a record |

**Key Features:**
- **Filtering**: Supports advanced query parameters for `date_range`, `category`, and `type`.
- **Pagination**: Optimized for performance with `skip` and `limit` parameters.

## 8. Analytics APIs
Our analytics engine performs heavy computational tasks on the server side to minimize frontend overhead.
- **`/analytics/summary`**: High-level KPIs (Totals, Balance, Trends).
- **`/analytics/trends`**: Monthly aggregation of income vs expenses.
- **`/analytics/distribution`**: Category-wise spending breakdown for visualization.
- **`/analytics/health-score`**: Automated financial health assessment logic.
- **`/analytics/pro-insights`**: Actionable insights generated from spending behavior.
- **Aggregations**: Accomplished using optimized SQL functions like `SUM()` and `COUNT()` via SQLAlchemy.

## 9. Access Control Logic
Access is strictly enforced at the API route level to prevent unauthorized data exposure or modification.

| Role | Records (View) | Records (Write/Edit) | Analytics | User Mgmt |
|------|----------------|----------------------|-----------|-----------|
| **Viewer** | Yes | No | Yes | No |
| **Analyst**| Yes | Only Own | Yes | No |
| **Admin**  | Yes | All | Yes | Yes |

**Logic Rules:**
- **Ownership Rule**: Non-admin users can only modify records they personally created (verified via `user_id`).
- **Forbidden Actions**: Any unauthorized attempt returns a `403 Forbidden` status code.

## 10. Database Design
The schema is optimized for relational integrity and search performance.

**Tables:**
- **`users`**: `id` (UUID), `name`, `email`, `role` (Enum), `is_active` (Bool).
- **`records`**: `amount` (Float), `type` (Enum), `category` (String), `date` (Date), `notes` (Text), `user_id` (FK).

**Technical Highlights:**
- **Relationships**: One user to many records.
- **Indexing**: The `category` and `date` columns are indexed for rapid filtering.
- **Data Visibility**: Shared visibility for viewing data, but restricted modification based on ownership.

## 11. Validation & Error Handling
We use Pydantic for strict input/output validation, ensuring the database never receives corrupted data.
- **Status Codes**: 
    - `400 Bad Request`: Validation failure.
    - `401 Unauthorized`: Missing or invalid token.
    - `403 Forbidden`: Insufficient permissions.
    - `404 Not Found`: Resource does not exist.

## 12. Running Locally
1. Clone the repository and navigate to the `/backend` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables in a `.env` file (Database URL & Supabase Keys).
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

## 13. Key Highlights
- **Clean Architecture**: Decoupled modules for logic, models, and routes.
- **Role-Based Security**: Industry-standard RBAC implementation.
- **Analytics Engine**: Centralized aggregation for consistent data reporting.
- **Scalable Design**: Prepared for high-traffic and large datasets.

## 14. Conclusion
The Zorvyn Backend provides a secure, robust foundation for financial data management. By combining strict identity verification with a powerful analytics engine, it offers a professional solution for multi-tier financial oversight.
