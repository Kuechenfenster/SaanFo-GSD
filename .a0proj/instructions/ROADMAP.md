# Roadmap: SaanFo Map

**Project:** SaanFo Map - Community-driven grocery deal finder
**Created:** 2025-02-28
**Depth:** Standard
**Total Phases:** 6
**Total v1 Requirements:** 21

---

## Overview

This roadmap delivers a mobile deal-finder app where users can discover grocery deals near them on a map, upload deals they find, and get personalized highlights based on their interests.

**Delivery Strategy:** Foundation → Data Infrastructure → Core Features → Personalization

---

## Phases

- [ ] **Phase 1: Authentication** - Users can register, log in, and set location preferences
- [ ] **Phase 2: Store Registration** - Stores exist in the database with verification system
- [ ] **Phase 3: Deal Upload Backend** - API and AI pipeline for processing deal submissions
- [ ] **Phase 4: Deal Upload Frontend** - Camera-based deal capture interface
- [ ] **Phase 5: Deal Discovery** - Map displays deals with price history and filtering
- [ ] **Phase 6: User Interests** - Personalized deal highlighting based on preferences

---

## Progress Tracker

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication | 0/2 | Not started | - |
| 2. Store Registration | 0/2 | Not started | - |
| 3. Deal Upload Backend | 0/2 | Not started | - |
| 4. Deal Upload Frontend | 0/2 | Not started | - |
| 5. Deal Discovery | 0/2 | Not started | - |
| 6. User Interests | 0/1 | Not started | - |

---

## Phase Details

### Phase 1: Authentication

**Goal:** Users can securely access the app and configure location preferences

**Depends on:** Nothing (foundation phase)

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05

**Success Criteria** (what must be TRUE when phase completes):
1. User can register with phone number and receive verification code
2. User can optionally add email address to their profile
3. User grants GPS permission and app captures location
4. User can save Home location preset (optional)
5. User can save Work location preset (optional)

**Plans:** TBD

---

### Phase 2: Store Registration

**Goal:** Stores exist in the system with crowd-sourced verification

**Depends on:** Phase 1 (requires authenticated users and GPS)

**Requirements:** STORE-01, STORE-02, STORE-03, STORE-04

**Success Criteria** (what must be TRUE when phase completes):
1. App suggests nearby store names based on GPS coordinates
2. User can register a new store if it doesn't exist in database
3. Newly registered stores require verification by other users
4. Users who verify stores receive reward points

**Plans:** TBD

---

### Phase 3: Deal Upload Backend

**Goal:** Backend can receive, process, and store deal submissions

**Depends on:** Phase 1 (authentication), Phase 2 (stores must exist)

**Requirements:** UPLOAD-06, UPLOAD-07, UPLOAD-08

**Success Criteria** (what must be TRUE when phase completes):
1. API accepts deal submission with multiple photos
2. AI extracts brand name, pack size, barcode, artwork text language, and product category
3. User can select product category from predefined list (Veggies, Fruits, Meat, Seafood, Dairy, Grains & Oil, Beverage, Snacks, Spicy Sauce, Spices)
4. User can manually correct any AI-extracted details before final submission

**Plans:** TBD

---

### Phase 4: Deal Upload Frontend

**Goal:** Users can capture and submit deals using camera interface

**Depends on:** Phase 3 (backend API must exist)

**Requirements:** UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05

**Success Criteria** (what must be TRUE when phase completes):
1. User can tap "Add Item" button to initiate new deal upload
2. Camera captures product packaging front photo
3. Camera captures barcode photo
4. Camera captures price tag photo
5. User can optionally capture weight indication photo

**Plans:** TBD

---

### Phase 5: Deal Discovery

**Goal:** Users can discover and browse deals on an interactive map

**Depends on:** Phase 4 (deals must exist to display)

**Requirements:** MAP-01, MAP-02, MAP-03, MAP-04

**Success Criteria** (what must be TRUE when phase completes):
1. Map displays deals within user-selected distance radius (500m, 1km, 2km, 5km, 10km)
2. User's current GPS location centers the map view
3. Deals appear as markers on the map
4. User can tap any deal marker to view price history diagram

**Plans:** TBD

---

### Phase 6: User Interests

**Goal:** App personalizes deal discovery based on user preferences

**Depends on:** Phase 1 (user profile), Phase 5 (deals to highlight)

**Requirements:** INTEREST-01, INTEREST-02

**Success Criteria** (what must be TRUE when phase completes):
1. User can select multiple product categories of interest from predefined list
2. App highlights deals matching user interests on the map

**Plans:** TBD

---

## Requirement Coverage

| Category | Requirements | Phase | Status |
|----------|--------------|-------|--------|
| **Authentication** | AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05 | 1 | Pending |
| **Store Registration** | STORE-01, STORE-02, STORE-03, STORE-04 | 2 | Pending |
| **Deal Upload Backend** | UPLOAD-06, UPLOAD-07, UPLOAD-08 | 3 | Pending |
| **Deal Upload Frontend** | UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05 | 4 | Pending |
| **Deal Discovery** | MAP-01, MAP-02, MAP-03, MAP-04 | 5 | Pending |
| **User Interests** | INTEREST-01, INTEREST-02 | 6 | Pending |

**Coverage Summary:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0
- Duplicate assignments: 0

---

## Dependencies Graph

```
Phase 1: Authentication
    |
    +--> Phase 2: Store Registration
    |        |
    |        +--> Phase 3: Deal Upload Backend
    |                 |
    |                 +--> Phase 4: Deal Upload Frontend
    |                          |
    |                          +--> Phase 5: Deal Discovery
    |                                   |
    +-----------------------------------+--> Phase 6: User Interests
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-02-28 | Split Upload into Backend/Frontend phases | Upload feature is complex (8 requirements). Separating API/AI pipeline from camera UI allows clearer testing boundaries. |
| 2025-02-28 | Store Registration before Upload | Deals must be associated with verified stores. Unverified stores need confirmation system in place first. |
| 2025-02-28 | User Interests last | Personalization requires user profiles exist and deals exist to highlight. Natural fit as final phase. |

---

## Notes

- **Phase 3 + 4** split allows backend/frontend specialists to work with clear boundaries
- **Store verification** (Phase 2) is critical for data quality - prevents fake/spam stores
- **AI extraction accuracy** in Phase 3 may need iteration - consider early validation testing
- **v2 features** deferred: Shopping lists, Notifications, Friend network, Full rewards system

---

*Last updated: 2025-02-28*
