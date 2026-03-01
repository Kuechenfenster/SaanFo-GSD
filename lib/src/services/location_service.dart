import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocationService {
  static const String _homeLatKey = 'home_latitude';
  static const String _homeLngKey = 'home_longitude';
  static const String _workLatKey = 'work_latitude';
  static const String _workLngKey = 'work_longitude';

  Future<Position?> getCurrentPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return null;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return null;
    }
    if (permission == LocationPermission.deniedForever) return null;

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  Future<bool> hasPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    return permission == LocationPermission.always ||
           permission == LocationPermission.whileInUse;
  }

  Future<LocationPermission> requestPermission() async {
    return await Geolocator.requestPermission();
  }

  Future<bool> openAppSettings() async {
    return await Geolocator.openAppSettings();
  }

  Future<void> saveHomeLocation(double latitude, double longitude) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_homeLatKey, latitude);
    await prefs.setDouble(_homeLngKey, longitude);
  }

  Future<void> saveWorkLocation(double latitude, double longitude) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_workLatKey, latitude);
    await prefs.setDouble(_workLngKey, longitude);
  }

  Future<LocationPreset?> getHomeLocation() async {
    final prefs = await SharedPreferences.getInstance();
    final lat = prefs.getDouble(_homeLatKey);
    final lng = prefs.getDouble(_homeLngKey);
    if (lat != null && lng != null) {
      return LocationPreset(name: 'Home', latitude: lat, longitude: lng);
    }
    return null;
  }

  Future<LocationPreset?> getWorkLocation() async {
    final prefs = await SharedPreferences.getInstance();
    final lat = prefs.getDouble(_workLatKey);
    final lng = prefs.getDouble(_workLngKey);
    if (lat != null && lng != null) {
      return LocationPreset(name: 'Work', latitude: lat, longitude: lng);
    }
    return null;
  }

  Future<void> clearHomeLocation() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_homeLatKey);
    await prefs.remove(_homeLngKey);
  }

  Future<void> clearWorkLocation() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_workLatKey);
    await prefs.remove(_workLngKey);
  }
}

class LocationPreset {
  final String name;
  final double latitude;
  final double longitude;

  const LocationPreset({
    required this.name,
    required this.latitude,
    required this.longitude,
  });
}
