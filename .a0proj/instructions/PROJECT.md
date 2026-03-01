# SaanFo Map

## What This Is

SaanFo Map is a community-driven grocery deal finder app that helps users discover deals on products they care about in their local area. Users snap photos of deals they find in stores, and AI extracts product details. The app maps deals nearby and highlights those matching user interests, with price history visualization.

Target users include families (especially those with helpers managing groceries), bargain hunters, and international food enthusiasts hunting specific ingredients at good prices.

## Core Value

Users can see products of interest near them on a map, tap to view price history, and never miss a good deal on items they regularly buy.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Authentication:**
- [ ] User can register with phone number (required)
- [ ] User can optionally add email for newsletters
- [ ] User grants GPS permission when app is open
- [ ] User can set optional Home and Work location presets

**Deal Discovery (Map):**
- [ ] Map displays deals within selected distance radius (500m, 1km, 2km, 5km, 10km)
- [ ] Deals matching user interests are highlighted
- [ ] User can tap deal to see price history diagram
- [ ] GPS location centers the map view

**Deal Upload:**
- [ ] User can initiate new deal upload with "Add Item" button
- [ ] Photo capture: product packaging front
- [ ] Photo capture: barcode
- [ ] Photo capture: price tag
- [ ] Optional photo: weight indication
- [ ] AI extracts: brand name, pack size, barcode, artwork text language, categorizes product
- [ ] User selects product category (Veggies, Fruits, Meat, Seafood, Dairy, Grains & Oil, Beverage, Snacks, Spicy Sauce, Spices)
- [ ] User can manually correct/edit AI-extracted details

**Store Registration:**
- [ ] App suggests store names based on GPS location
- [ ] User can register new store name if not in database
- [ ] New stores require verification by other users
- [ ] Verification system assigns reward points to verifiers

**User Interests:**
- [ ] User can select product categories of interest
- [ ] App highlights matching deals in proximity

### Out of Scope

- Shopping list — deferred to v2 (complex feature requiring meal planning integration)
- Meal planner / smart meal creator — deferred to v3
- Friend network / social features — deferred to v2 (see what friends are interested in, buy for friends)
- Full reward system (badges, leaderboard, feature unlocks) — v2 scope
- Email newsletter system — basic infrastructure only in v1, full system later
- Real-time notifications — basic in v1, smart notifications later
- Multi-language support beyond initial region — future consideration

## Context

**User Environment:**
- Target market: Hong Kong initially (high cost of living, many families have helpers who do shopping)
- Price variation is extreme within cities — users need to compare
- International ingredients can be hard to find at good prices
- Families want cost control over weekly grocery spending

**Technical Considerations:**
- Heavy reliance on camera for deal upload (photo quality/lighting matters)
- GPS accuracy critical for store suggestion and deal proximity
- AI extraction needs to handle multiple languages (artwork text)
- Barcode scanning reliability varies by packaging condition
- Store verification system requires minimum user confirmations to prevent abuse

**Prior Art:**
- User has built map-based web apps before (saanfo-map reference project)

## Constraints

- **Platform**: Mobile-first (iOS/Android), likely React Native or Flutter for unified codebase
- **Location**: GPS required for core functionality — no offline mode in v1
- **AI**: Relies on computer vision/OCR for extraction — accuracy may vary
- **Community**: Deal quality depends on user participation — cold start problem
- **Verification**: New stores need multi-user confirmation to prevent fake entries

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phone-only registration (email optional) | Faster onboarding, phone = unique ID, HK market preference | — Pending |
| Photo-based upload (3-4 shots) | Captures all needed data in one flow, enables AI extraction | — Pending |
| Distance slider (500m-10km) | Users have different mobility (walk vs drive), flexible discovery | — Pending |
| Category-based interests (not specific products) | Simpler v1, broader matching, easier to maintain | — Pending |
| User verification for new stores | Crowdsource data quality, gamification foundation | — Pending |

---
*Last updated: 2025-02-28 after initialization*
