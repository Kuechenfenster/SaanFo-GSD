# Requirements: SaanFo Map

**Defined:** 2025-02-28
**Core Value:** Users can see products of interest near them on a map, tap to view price history, and never miss a good deal on items they regularly buy

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can register with phone number (required)
- [ ] **AUTH-02**: User can optionally add email for newsletters
- [ ] **AUTH-03**: User grants GPS permission when app is open
- [ ] **AUTH-04**: User can set optional Home location preset
- [ ] **AUTH-05**: User can set optional Work location preset

### Deal Discovery (Map)

- [ ] **MAP-01**: Map displays deals within selected distance radius (500m, 1km, 2km, 5km, 10km)
- [ ] **MAP-02**: Deals matching user interests are highlighted on map
- [ ] **MAP-03**: User can tap deal to see price history diagram
- [ ] **MAP-04**: GPS location centers the map view

### Deal Upload

- [ ] **UPLOAD-01**: User can initiate new deal upload with "Add Item" button
- [ ] **UPLOAD-02**: Photo capture: product packaging front
- [ ] **UPLOAD-03**: Photo capture: barcode
- [ ] **UPLOAD-04**: Photo capture: price tag
- [ ] **UPLOAD-05**: Optional photo: weight indication
- [ ] **UPLOAD-06**: AI extracts brand name, pack size, barcode, artwork text language, and product category
- [ ] **UPLOAD-07**: User can select product category from list (Veggies, Fruits, Meat, Seafood, Dairy, Grains & Oil, Beverage, Snacks, Spicy Sauce, Spices)
- [ ] **UPLOAD-08**: User can manually correct/edit AI-extracted details

### Store Registration

- [ ] **STORE-01**: App suggests store names based on GPS location
- [ ] **STORE-02**: User can register new store name if not in database
- [ ] **STORE-03**: New stores require verification by other users
- [ ] **STORE-04**: Verification system assigns reward points to verifiers

### User Interests

- [ ] **INTEREST-01**: User can select product categories of interest
- [ ] **INTEREST-02**: App highlights matching deals in user proximity

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Shopping List

- **SHOP-01**: User can create shopping list
- **SHOP-02**: Shopping list items are highlighted when nearby

### Notifications

- **NOTF-01**: User receives notifications for new deals matching interests
- **NOTF-02**: User receives email newsletters with top deals (if email provided)

### Friend Network

- **FRIEND-01**: User can connect with friends
- **FRIEND-02**: User can see friends' interests
- **FRIEND-03**: User can buy items for friends

### Rewards System (Full)

- **REWARD-01**: User earns badges for activities
- **REWARD-02**: User appears on leaderboards
- **REWARD-03**: Points unlock app features

## v3 Requirements

Deferred to future release.

### Meal Planning

- **MEAL-01**: User can create meal plans
- **MEAL-02**: Smart meal creator suggests recipes based on deals
- **MEAL-03**: Automatic shopping list from meal plan

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-language support (beyond initial region) | Focus on Hong Kong market first, i18n is v2+ |
| Web app (desktop browser) | Mobile-first strategy, PWA considered for later |
| Real-time chat between users | Complex, social features prioritized differently |
| Payment integration | Not needed for deal discovery, may revisit |
| Delivery/service booking | Out of scope — pure discovery app |
| Offline mode | GPS requires connection, offline caching is v2+ |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| STORE-01 | Phase 2 | Pending |
| STORE-02 | Phase 2 | Pending |
| STORE-03 | Phase 2 | Pending |
| STORE-04 | Phase 2 | Pending |
| UPLOAD-06 | Phase 3 | Pending |
| UPLOAD-07 | Phase 3 | Pending |
| UPLOAD-08 | Phase 3 | Pending |
| UPLOAD-01 | Phase 4 | Pending |
| UPLOAD-02 | Phase 4 | Pending |
| UPLOAD-03 | Phase 4 | Pending |
| UPLOAD-04 | Phase 4 | Pending |
| UPLOAD-05 | Phase 4 | Pending |
| MAP-01 | Phase 5 | Pending |
| MAP-02 | Phase 5 | Pending |
| MAP-03 | Phase 5 | Pending |
| MAP-04 | Phase 5 | Pending |
| INTEREST-01 | Phase 6 | Pending |
| INTEREST-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2025-02-28*
*Last updated: 2025-02-28 after roadmap creation*
