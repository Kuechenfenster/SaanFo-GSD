import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/auth_service.dart';
import 'otp_screen.dart';

class PhoneAuthScreen extends StatefulWidget {
  const PhoneAuthScreen({super.key});
  @override State<PhoneAuthScreen> createState() => _PhoneAuthScreenState();
}

class _PhoneAuthScreenState extends State<PhoneAuthScreen> {
  final _authService = AuthService();
  final _phoneController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override void dispose() { _phoneController.dispose(); super.dispose(); }

  String? _validatePhone(String phone) {
    final cleanPhone = phone.replaceAll(RegExp(r'\s'), '');
    if (cleanPhone.isEmpty) return 'Phone number is required';
    final hkPattern = RegExp(r'^(\+852)?[569]\d{7}$');
    if (!hkPattern.hasMatch(cleanPhone)) return 'Enter a valid HK phone number';
    return null;
  }

  String _formatPhone(String phone) {
    final clean = phone.replaceAll(RegExp(r'\s'), '');
    return clean.startsWith('+') ? clean : '+852$clean';
  }

  Future<void> _sendOTP() async {
    final phone = _phoneController.text.trim();
    final error = _validatePhone(phone);
    if (error != null) { setState(() => _errorMessage = error); return; }
    setState(() { _isLoading = true; _errorMessage = null; });
    try {
      await _authService.verifyPhoneNumber(
        phoneNumber: _formatPhone(phone),
        onCodeSent: (vid, token) {
          setState(() => _isLoading = false);
          Navigator.push(context, MaterialPageRoute(
            builder: (_) => OTPScreen(phoneNumber: _formatPhone(phone), verificationId: vid),
          ));
        },
        onError: (e) => setState(() { _isLoading = false; _errorMessage = e.message ?? 'Failed'; }),
        onVerified: (_) => setState(() => _isLoading = false),
      );
    } catch (e) {
      setState(() { _isLoading = false; _errorMessage = 'Error occurred'; });
    }
  }

  @override Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(
      child: Padding(padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const SizedBox(height: 40),
          IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back)),
          const SizedBox(height: 32),
          Text('Enter your phone number', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Text('We\'ll send you a verification code.', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey[600])),
          const SizedBox(height: 48),
          TextField(controller: _phoneController, keyboardType: TextInputType.phone,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(12)],
            decoration: InputDecoration(labelText: 'Phone Number', hintText: '5XXX XXXX', prefixIcon: const Icon(Icons.phone_android),
              prefixText: '+852 ', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)), errorText: _errorMessage),
            onChanged: (_) => setState(() => _errorMessage = null)),
          const SizedBox(height: 8),
          Text('Hong Kong phone numbers only', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey[500])),
          const Spacer(),
          SizedBox(width: double.infinity, height: 56,
            child: ElevatedButton(onPressed: _isLoading ? null : _sendOTP,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CAF50), foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: _isLoading ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Send Code', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)))),
          const SizedBox(height: 24),
        ]))));
  }
}
