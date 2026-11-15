# LUMIA: Libreta Única de Mascotas, Informes y Adopciones
## Full-System Architectural Specification & Brainstorming Brief (From Scratch)

* **Author:** martinchiacchioseg-stack
* **Date:** 2026-11-14

---

## 1. Executive Overview & Problem Definition

LUMIA is a mission-critical management platform built for animal rescue networks, independent rescuers, and municipal/NGO transit shelters in Argentina. Rescuers operate in unpredictable environments: responding to emergency street reports, conducting medical rounds at veterinary clinics, vetting potential adopters, and monitoring post-adoption animal welfare over months or years.

### Real-World Pain Points & Core Contradictions:
1. **Disconnected Field vs. Desktop Operations:** Rescuers work primarily from mobile phones in the street, while coordinators manage legal documents and public relations from desktop computers. Without dependable bidirectional sync, updates are trapped on individual devices.
2. **Manual Data Entry Overhead:** Intake forms, veterinary treatment labels, vaccine vials, and identity documents require intense manual typing, leading to incomplete records and administrative burnout.
3. **Legal & Sensitive Data Liability (Ley 25.326):** Adopter vetting requires collecting National Identity Numbers (DNI), residential proofs, and signed adoption agreements. Exposing this information to all volunteers creates severe legal vulnerabilities.
4. **Post-Adoption Vetting Void:** Rescues often fail after the adoption handshake. Without an automated, staged follow-up system (48-72h, 15d, 1m, 3m, 6m, 1y) with early-warning alerts, cases of neglect or animal return go undetected until crisis point.

---

## 2. Full-System Architecture & Component Breakdown

If building LUMIA completely from scratch today, the system partitions into five core pillars:

```
+---------------------------------------------------------------------------------------+
|                                    LUMIA PLATFORM                                     |
+---------------------------------------------------------------------------------------+
|  1. OFFLINE-CAPABLE PWA CLIENT (React 19 + Tailwind + Vite)                           |
|     - Local optimistic UI state & IndexedDB (Dexie/idb) store (replacing localStorage)|
|     - Web Worker OffscreenCanvas image compression (max 1200px, WebP, zero UI jank)   |
|     - WebAuthn / Passkeys biometric auth with CSPRNG fallback PIN/magic link          |
|     - Outdoor-contrast UI with bottom-sheet touch targets (48px+)                     |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|  2. EDGE & SERVERLESS API LAYER (Node.js / Vercel Serverless Functions)               |
|     - Delta Sync Engine: Server-assigned monotonic sequences (sync_revision)          |
|     - AI OCR Visual Extraction Service: Gemini Flash vision with strict JSON schema   |
|     - Session Gateway: HttpOnly cookies, CSPRNG tokens, IP brute-force rate limiting  |
|     - Cryptographic Passkey Handshake (SimpleWebAuthn FIDO2)                          |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|  3. PERSISTENCE & DATA INTEGRITY (Neon PostgreSQL Pooled - AWS São Paulo)             |
|     - Primary Keys: Collision-free UUIDv7 timestamp-ordered                           |
|     - Canonical Human Codes: Assigned atomically upon server sync (LUM-2026-DOG-001)  |
|     - Data Protection (Ley 25.326): Column masking / FLE for adopter DNI & address    |
|     - Automatic Post-Adoption Follow-up Generator (PostgreSQL trigger on adopciones)  |
|     - Dynamic Welfare Semaphore View: vista_semaforo_adopciones                       |
+---------------------------------------------------------------------------------------+
```

---

## 3. Core Functional Modules & State Lifecycles

### A. Intake & Animal Profile Management
* **Dual-Key Strategy:** Collision-free `UUIDv7` primary keys minted client-side for offline independence, coupled with server-assigned canonical tags (`DOG-001`, `CAT-001`, `OTH-001`).
* **Expanded Realistic Lifecycle State Machine:**
  * `rescatado` -> `cuarentena / atención médica` -> `en tránsito` -> `en adopción` -> `adoptado`
  * Specialized transition branches: `foster_fail` (adopción por tránsito), `escapado / perdido`, `devuelto` (rescate recuperado post-adopción), `fallecido`.
* **Multimedia Timeline:** Categorized gallery streams (`rescate`, `evolucion`, `familia_adoptiva`).

### B. Intelligent OCR & Computer Vision (`SmartCameraInput`)
* Universal scanner trigger mounted across all data-entry forms.
* Native mobile camera launch (`accept="image/*" capture="environment"`).
* OffscreenCanvas Web Worker compression preventing main-thread lag or low-RAM crashes.
* Client-side blur/exposure pre-filter to prevent wasted API calls on unreadable photos.
* Serverless visual extraction powered by Gemini Flash returning strict JSON matching active form schemas.
* Non-destructive UI injection with soft visual badge indicators (`AIFieldBadge`) and per-field accept/reject diffs.

### C. Adopter Management & Legal Compliance (Ley 25.326)
* Ingestion of sensitive identity data (DNI/CUIT, physical address, DNI photographs).
* Role-based column masking: unverified volunteers view masked tokens (`DNI: ***4521`), while coordinators unlock verified identity cards via authenticated, audit-logged requests.
* Context-aware UI: In adopted animal dossiers, foster home information is dynamically replaced by the verified adopter's profile and follow-up timeline.

### D. Automated Post-Adoption Welfare Semaphore & Community Inversion
* Trigger-based creation of a six-stage follow-up schedule upon adoption finalization:
  1. 48–72 Hours: Acute home transition, appetite, and stress check.
  2. 15 Days: End of critical adaptation window and leash handling.
  3. 1 Month: Routine consolidation and spay/neuter verification.
  4. 3 Months: General veterinary booster check.
  5. 6 Months: Semiannual photo and environment audit.
  6. 1 Year: Total bond consolidation.
* **Community Milestone Portal:** Instead of intrusive inspections, adopters receive a simple digital milestone link (`wa.me` deep link) where uploading a picture and confirming wellness generates a "Digital Pet Wellness Certificate", automatically advancing the semaphore to 🟢 Green.

### E. Enterprise-Grade Security & Session Resilience
* Passwordless biometric authentication (Passkeys / WebAuthn FIDO2).
* Fail-safe cryptographic fallback (CSPRNG 48-hour single-use temporary passwords) for volunteers without biometric secure enclaves.
* Tamper-evident server-side security audit log tracking user sessions and state changes.

---

## 4. Current State vs. Zero-Base Target Architecture

| Dimension | Current Implementation | Zero-Base Target Architecture |
| :--- | :--- | :--- |
| **Primary Keys** | Client timestamp IDs (`anim-17298...`) | Collision-free `UUIDv7` with server-assigned human tags |
| **Storage Architecture** | Generic JSONB document table (`patita_records`) | Normalized relational PostgreSQL schema with referential foreign keys |
| **Client Synchronization** | 20s periodic full-table download | Monotonic sequence incremental delta sync (`sync_revision`) |
| **Client Storage** | LocalStorage (5MB synchronous blocking quota) | IndexedDB (Dexie/idb asynchronous document cache) |
| **Concurrent Conflicts** | Last-Write-Wins (silent object replacement) | Property-level deterministic merge based on field timestamps |
| **Data Protection (Ley 25.326)**| Application-level filtering | Column-level masking and auditable coordinator decryption |
| **OCR Image Pipeline** | Main-thread canvas resize | Web Worker OffscreenCanvas with blur pre-validation |

---

## 5. Swarm Reviewer Consensus & Directives

The Goldfish review swarm across all 7 specialized lenses highlighted the following priorities:
1. **Eliminate Client Clock Dependencies:** Delta sync queries must rely exclusively on server-generated monotonic revision counters (`sync_revision`), not device system clocks.
2. **Prevent Offline ID Collisions:** Adopt UUIDv7 as the universal primary key to allow infinite offline record creation without distributed lock bottlenecks.
3. **Protect High-Risk Data:** Enforce field masking for adopter personal identity numbers to ensure complete compliance with Argentine data protection statutes.
4. **Resilient Authentication:** Ensure WebAuthn is backed by verified time-limited recovery links so volunteers sharing devices or lacking biometric hardware are never locked out of the field.
