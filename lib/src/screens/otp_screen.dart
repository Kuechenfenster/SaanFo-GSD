import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/auth_service.dart';
import 'email_screen.dart';

class OTPScreen extends StatefulWidget {
  final String phoneNumber, verificationId;
  const OTPScreen({super.key, required this.phoneNumber, required this.verificationId});
  @override State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final _authService = AuthService();
  final _otpControllers = List.generate(6, (_) => TextEditingController());
  final _otpFocusNodes = List.generate(6, (_) => FocusNode());
  bool _isLoading = false;
  String? _errorMessage;

  @override void dispose() {
    for (var c in _otpControllers) c.dispose();
    for (var n in _otpFocusNodes) n.dispose();
    super.dispose();
  }

  String get _otpCode => _otpControllers.map((c) => c.text).join();

  Future<void> _verifyOTP() async {
    if (_otpCode.length != 6) { setState(() => _errorMessage = 'Enter all 6 digits'); return; }
    setState(() { _isLoading = true; _errorMessage = null; });
    try {
      await _authService.verifyOTP(verificationId: widget.verificationId, smsCode: _otpCode);
      if (mounted) Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const EmailScreen()), (_) => false);
    } catch (e) {
      setState(() { _isLoading = false; _errorMessage = 'Invalid code'; });
      for (var c in _otpControllers) c.clear();
      _otpFocusNodes[0].requestFocus();
    }
  }

  void _onChanged(int index, String value) {
    setState(() => _errorMessage = null);
    if (value.length == 1 && index < 5) _otpFocusNodes[index + 1].requestFocus();
    else if (value.isEmpty && index > 0) _otpFocusNodes[index - 1].requestFocus();
    if (index == 5 && value.isNotEmpty && _otpCode.length == 6) _verifyOTP();
  }

  String get _maskedPhone { final p = widget.phoneNumber; return p.length < 4 ? p : '${p.substring(0, p.length - 4)}****'; }

  @override Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(
      child: Padding(padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const SizedBox(height: 40),
          IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back)),
          const SizedBox(height: 32),
          Text('Enter verification code', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Text('Code sent to $_maskedPhone', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey[600])),
          const SizedBox(height: 48),
          Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(6, (i) => SizedBox(width: 48,
              child: TextField(controller: _otpControllers[i], focusNode: _otpFocusNodes[i], keyboardType: TextInputType.number,
                textAlign: TextAlign.center, maxLength: 1, inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: InputDecoration(counterText: '', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                onChanged: (v) => _onChanged(i, v))))),
          if (_errorMessage != null) ...[const SizedBox(height: 16), Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)))],
          const SizedBox(height: 32),
          Center(child: TextButton(onPressed: () {}, child: const Text('Didn\'t receive code? Resend'))),
          const Spacer(),
          SizedBox(width: double.infinity, height: 56,
            child: ElevatedButton(onPressed: _isLoading ? null : _verifyOTP,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CAF50), foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: _isLoading ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Verify', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)))),
          const SizedBox(height: 24),
        ]))));
  }
}
