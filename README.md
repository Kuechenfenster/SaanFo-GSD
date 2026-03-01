# SaanFo Map 🛒🗺️

[![Flutter Version](https://img.shields.io/badge/Flutter-3.41+-blue.svg)](https://flutter.dev)
[![Dart Version](https://img.shields.io/badge/Dart-3.11+-blue.svg)](https://dart.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Community-driven grocery deal finder app for Hong Kong**

SaanFo Map helps users discover grocery deals in their local area. Snap photos of deals you find, AI extracts product details, and view them on an interactive map with price history.

## 🌟 Core Features

- 📱 **Phone Authentication** - Quick registration with phone number
- 🗺️ **Interactive Map** - Discover deals within selected radius (500m - 10km)
- 📷 **Photo Upload** - Capture products, barcodes, and price tags
- 🤖 **AI Extraction** - Automatic product details extraction
- 🏪 **Store Registry** - Crowd-sourced store verification
- 🎯 **Personalized Discovery** - Deals matching your interests highlighted

## 🛣️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Authentication (Phone + GPS) | 🔲 Pending |
| 2 | Store Registration | 🔲 Pending |
| 3 | Deal Upload Backend | 🔲 Pending |
| 4 | Deal Upload Frontend | 🔲 Pending |
| 5 | Deal Discovery (Map) | 🔲 Pending |
| 6 | User Interests | 🔲 Pending |

## 🚀 Getting Started

### Prerequisites
- Flutter SDK 3.0+
- Dart SDK 3.0+
- Android Studio / Xcode (for emulators)
- Firebase project (for auth and database)

### Installation

```bash
# Clone the repository
git clone https://github.com/Kuechenfenster/SaanFo-GSD.git
cd SaanFo-GSD

# Install dependencies
flutter pub get

# Run the app
flutter run
```

## 📁 Project Structure

```
lib/
├── main.dart              # App entry point
├── src/
│   ├── models/           # Data models
│   ├── services/         # API, Auth, Location services
│   ├── screens/          # UI screens
│   └── widgets/          # Reusable components
├── assets/
│   ├── images/           # App images
│   └── fonts/            # Custom fonts
└── test/                 # Unit & widget tests
```

## 🎯 Target Users

- 👨‍👩‍👧 **Families** - Especially with helpers managing groceries
- 🛒 **Bargain Hunters** - Looking for the best deals
- 🌏 **International Food Enthusiasts** - Finding specific ingredients at good prices

## 📋 Requirements (v1)

See [REQUIREMENTS.md](.a0proj/instructions/REQUIREMENTS.md) for detailed specification.

## 🤝 Contributing

This is a community-driven project. Contributions are welcome!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Made with ❤️ for Hong Kong shoppers*
