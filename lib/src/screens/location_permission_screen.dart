import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';
import 'location_preset_screen.dart';

class LocationPermissionScreen extends StatefulWidget {
  const LocationPermissionScreen({super.key});
  @override State<LocationPermissionScreen> createState() => _LocationPermissionScreenState();
}

class _LocationPermissionScreenState extends State<LocationPermissionScreen> {
  final _locationService = LocationService();
  bool _isLoading = false;

  Future<void> _requestPermission() async {
    setState(() => _isLoading = true);
    final permission = await _locationService.requestPermission();
    setState(() => _isLoading = false);
    if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
      await _locationService.getCurrentPosition();
      _navigate();
    } else if (permission == LocationPermission.deniedForever) {
      _showSettingsDialog();
    } else {
      _navigate();
    }
  }

  void _navigate() {
    if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LocationPresetScreen()));
  }

  void _showSettingsDialog() {
    showDialog(context: context, builder: (_) => AlertDialog(
      title: const Text('Location Required'),
      content: const Text('Location permission is required to show deals near you.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        TextButton(onPressed: () { Navigator.pop(context); _locationService.openAppSettings(); }, child: const Text('Settings')),
      ],
    ));
  }

  @override Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(child: Padding(padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
        const SizedBox(height: 60),
        Container(width: 120, height: 120, decoration: BoxDecoration(color: const Color(0xFF4CAF50).withOpacity(0.1), shape: BoxShape.circle),
          child: const Icon(Icons.location_on, size: 60, color: Color(0xFF4CAF50))),
        const SizedBox(height: 40),
        Text('Enable Location', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
        const SizedBox(height: 16),
        Text('SaanFo Map needs your location to show grocery deals near you.', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey[600]), textAlign: TextAlign.center),
        const SizedBox(height: 32),
        Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
          child: Column(children: [
            _buildFeature(Icons.map_outlined, 'Discover nearby deals', 'See deals within your radius'),
            const Divider(height: 24),
            _buildFeature(Icons.store_outlined, 'Find stores', 'Get store suggestions'),
            const Divider(height: 24),
            _buildFeature(Icons.navigation_outlined, 'Distance filtering', 'Filter deals 500m to 10km'),
          ])),
        const Spacer(),
        SizedBox(width: double.infinity, height: 56, child: ElevatedButton.icon(
          onPressed: _isLoading ? null : _requestPermission,
          icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.location_on),
          label: Text(_isLoading ? 'Requesting...' : 'Enable Location', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CAF50), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
        const SizedBox(height: 12),
        SizedBox(width: double.infinity, height: 48, child: TextButton(onPressed: _navigate, child: const Text('Not now'))),
        const SizedBox(height: 24),
      ]))));
  }

  Widget _buildFeature(IconData icon, String title, String subtitle) {
    return Row(children: [
      Container(width: 48, height: 48, decoration: BoxDecoration(color: const Color(0xFF4CAF50).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, color: const Color(0xFF4CAF50))),
      const SizedBox(width: 16),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
        Text(subtitle, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
      ])),
    ]);
  }
}
