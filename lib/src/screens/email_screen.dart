import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'location_permission_screen.dart';

class EmailScreen extends StatefulWidget {
  const EmailScreen({super.key});
  @override State<EmailScreen> createState() => _EmailScreenState();
}

class _EmailScreenState extends State<EmailScreen> {
  final _authService = AuthService();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override void dispose() { _emailController.dispose(); super.dispose(); }

  String? _validateEmail(String email) {
    if (email.isEmpty) return null;
    final pattern = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return pattern.hasMatch(email) ? null : 'Invalid email';
  }

  Future<void> _saveAndContinue() async {
    final email = _emailController.text.trim();
    final err = _validateEmail(email);
    if (err != null) { setState(() => _errorMessage = err); return; }
    if (email.isNotEmpty) {
      setState(() => _isLoading = true);
      try { await _authService.updateEmail(email); } catch (_) {}
      setState(() => _isLoading = false);
    }
    if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LocationPermissionScreen()));
  }

  void _skip() => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LocationPermissionScreen()));

  @override Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(
      child: Padding(padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const SizedBox(height: 40),
          Text('Stay in the loop', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Text('Add your email for newsletters (optional).', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey[600])),
          const SizedBox(height: 48),
          TextField(controller: _emailController, keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(labelText: 'Email (Optional)', hintText: 'you@example.com',
              prefixIcon: const Icon(Icons.email_outlined), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              errorText: _errorMessage),
            onChanged: (_) => setState(() => _errorMessage = null)),
          const Spacer(),
          SizedBox(width: double.infinity, height: 56,
            child: ElevatedButton(onPressed: _isLoading ? null : _saveAndContinue,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CAF50), foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: _isLoading ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Continue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)))),
          const SizedBox(height: 12),
          SizedBox(width: double.infinity, height: 48, child: TextButton(onPressed: _skip, child: const Text('Skip'))),
          const SizedBox(height: 24),
        ]))));
  }
}
