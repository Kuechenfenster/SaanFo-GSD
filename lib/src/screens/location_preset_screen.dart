import 'package:flutter/material.dart';
import '../services/location_service.dart';

class LocationPresetScreen extends StatefulWidget {
  const LocationPresetScreen({super.key});
  @override State<LocationPresetScreen> createState() => _LocationPresetScreenState();
}

class _LocationPresetScreenState extends State<LocationPresetScreen> {
  final _locationService = LocationService();
  LocationPreset? _home, _work;
  bool _isLoading = false;

  @override void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final home = await _locationService.getHomeLocation();
    final work = await _locationService.getWorkLocation();
    setState(() { _home = home; _work = work; });
  }

  Future<void> _save(String type) async {
    setState(() => _isLoading = true);
    final pos = await _locationService.getCurrentPosition();
    setState(() => _isLoading = false);
    if (pos == null) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not get location')));
      return;
    }
    if (type == 'home') {
      await _locationService.saveHomeLocation(pos.latitude, pos.longitude);
      setState(() => _home = LocationPreset(name: 'Home', latitude: pos.latitude, longitude: pos.longitude));
    } else {
      await _locationService.saveWorkLocation(pos.latitude, pos.longitude);
      setState(() => _work = LocationPreset(name: 'Work', latitude: pos.latitude, longitude: pos.longitude));
    }
  }

  Future<void> _clear(String type) async {
    if (type == 'home') { await _locationService.clearHomeLocation(); setState(() => _home = null); }
    else { await _locationService.clearWorkLocation(); setState(() => _work = null); }
  }

  void _finish() {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Welcome! Map screen coming in Phase 5.')));
  }

  @override Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(child: Padding(padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const SizedBox(height: 40),
        Text('Save your locations', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Text('Set Home and Work for quick access (optional).', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey[600])),
        const SizedBox(height: 40),
        _buildCard(Icons.home, 'Home', _home != null ? 'Saved' : 'Tap to set', _home != null, () => _save('home'), () => _clear('home')),
        const SizedBox(height: 16),
        _buildCard(Icons.work, 'Work', _work != null ? 'Saved' : 'Tap to set', _work != null, () => _save('work'), () => _clear('work')),
        const Spacer(),
        Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: const Color(0xFF4CAF50).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Row(children: [Icon(Icons.info_outline, color: const Color(0xFF4CAF50)), const SizedBox(width: 12),
            Expanded(child: Text('You can update these later in settings.', style: TextStyle(color: const Color(0xFF4CAF50), fontSize: 14)))]),
        ),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, height: 56, child: ElevatedButton(onPressed: _finish,
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CAF50), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
          child: const Text('Get Started', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)))),
        const SizedBox(height: 24),
      ]))));
  }

  Widget _buildCard(IconData icon, String title, String subtitle, bool isSet, VoidCallback onSet, VoidCallback onClear) {
    return Card(elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: isSet ? const Color(0xFF4CAF50) : Colors.grey[300]!)),
      child: InkWell(onTap: isSet ? null : onSet, borderRadius: BorderRadius.circular(12),
        child: Padding(padding: const EdgeInsets.all(16), child: Row(children: [
          Container(width: 48, height: 48, decoration: BoxDecoration(color: isSet ? const Color(0xFF4CAF50).withOpacity(0.1) : Colors.grey[100], borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: isSet ? const Color(0xFF4CAF50) : Colors.grey[600])),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: isSet ? const Color(0xFF4CAF50) : Colors.black)),
            Text(subtitle, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
          ])),
          if (isSet) ...[const Icon(Icons.check_circle, color: Color(0xFF4CAF50)), IconButton(onPressed: onClear, icon: const Icon(Icons.close, size: 20), color: Colors.grey[400])]
          else if (_isLoading) const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
          else Icon(Icons.add_circle_outline, color: Colors.grey[400]),
        ]))));
  }
}
