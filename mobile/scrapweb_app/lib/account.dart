import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'win95_style.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  State<AccountPage> createState() => _AccountPageState();
}
class _AccountPageState extends State<AccountPage> {
  bool editing = false;

  String userId = '';
  String firstName = '';
  String lastName = '';
  String username = '';
  String email = '';

  String accountErrorMessage = '';
  bool accountMessageVisible = false;
  bool accountMessageIsError = true;

  late TextEditingController firstNameController;
  late TextEditingController lastNameController;
  late TextEditingController usernameController;
  late TextEditingController emailController;

  @override
  void initState() {
    super.initState();
    loadUserInfo();
  }

  Future<void> loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      userId    = prefs.getString('user_id')    ?? '';
      firstName = prefs.getString('first_name') ?? '';
      lastName  = prefs.getString('last_name')  ?? '';
      username  = prefs.getString('username')   ?? '';
      email     = prefs.getString('email')      ?? '';
    });
  }

  Future<void> handleEditToggle() async {
    if (editing) {
      final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
      final String port = dotenv.env['SERVER_PORT'] ?? '80';
      final url = Uri.http('$host:$port', '/api/users/$userId');

      try {
        final response = await http.patch(
          url,
          headers: {'Content-Type': 'application/json; charset=UTF-8'},
          body: utf8.encode(jsonEncode({
            'first_name': firstNameController.text,
            'last_name':  lastNameController.text,
            'username':   usernameController.text,
            'email':      emailController.text,
          })),
        );

        if (!mounted) return;

        if (response.statusCode == 200) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('first_name', firstNameController.text);
          await prefs.setString('last_name',  lastNameController.text);
          await prefs.setString('username',   usernameController.text);
          await prefs.setString('email',      emailController.text);

          if (!mounted) return;
          setState(() {
            firstName = firstNameController.text;
            lastName  = lastNameController.text;
            username  = usernameController.text;
            email     = emailController.text;
            editing   = false;
            accountMessageVisible = false;
          });
          firstNameController.dispose();
          lastNameController.dispose();
          usernameController.dispose();
          emailController.dispose();
        } else {
          final Map<String, dynamic> errorData = jsonDecode(utf8.decode(response.bodyBytes));
          setState(() {
            accountErrorMessage = errorData['error'] ?? 'Could not update account.';
            accountMessageIsError = true;
            accountMessageVisible = true;
          });
        }
      } catch (e) {
        print('Connection Error: $e');
        if (!mounted) return;
        setState(() {
          accountErrorMessage = 'Could not connect to server. Try again.';
          accountMessageIsError = true;
          accountMessageVisible = true;
        });
      }
    } else {
      firstNameController = TextEditingController(text: firstName);
      lastNameController  = TextEditingController(text: lastName);
      usernameController  = TextEditingController(text: username);
      emailController     = TextEditingController(text: email);
      setState(() {
        editing = true;
        accountMessageVisible = false;
      });
    }
  }

  void handleDiscard() {
    if (editing) {
      firstNameController.dispose();
      lastNameController.dispose();
      usernameController.dispose();
      emailController.dispose();
      setState(() {
        editing = false;
        accountMessageVisible = false;
      });
    } else {
      Navigator.pushNamedAndRemoveUntil(context, '/HomePage', (route) => false);
    }
  }

  Future<void> handleDelete() async {
    final bool? confirmed = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          backgroundColor: Color.fromARGB(255, 195, 199, 203),
          shape: Border(
            top:    BorderSide(color: Colors.white, width: 2),
            left:   BorderSide(color: Colors.white, width: 2),
            bottom: BorderSide(color: Colors.black, width: 2),
            right:  BorderSide(color: Colors.black, width: 2),
          ),
          titlePadding: EdgeInsets.zero,
          title: Container(
            color: Color.fromARGB(255, 2, 21, 119),
            width: double.infinity,
            height: 35.h,
            padding: EdgeInsets.only(left: 8.w),
            child: RichText(text: TextSpan(text: "Confirm Delete", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 18.sp, height: 1.6.h))),
          ),
          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
          content: RichText(text: TextSpan(text: "Are you sure you want to delete your account?\nThis action cannot be undone.", style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 15.sp, height: 1.5.h))),
          actionsPadding: EdgeInsets.fromLTRB(8.w, 0, 8.w, 10.h),
          actions: [
            Row(
              children: [
                Expanded(
                  child: Win95Button(
                    height: 45.h,
                    text: "Cancel",
                    onTap: () => Navigator.of(dialogContext).pop(false),
                  ),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: Win95Button(
                    height: 45.h,
                    text: "Delete",
                    onTap: () => Navigator.of(dialogContext).pop(true),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
      final String port = dotenv.env['SERVER_PORT'] ?? '80';
      final url = Uri.http('$host:$port', '/api/users/$userId');

      try {
        final response = await http.delete(url);
        if (!mounted) return;

        if (response.statusCode == 200) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.clear();
          if (!mounted) return;
          Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
        } else {
          final Map<String, dynamic> errorData = jsonDecode(utf8.decode(response.bodyBytes));
          setState(() {
            accountErrorMessage = errorData['error'] ?? 'Could not delete account.';
            accountMessageIsError = true;
            accountMessageVisible = true;
          });
        }
      } catch (e) {
        if (!mounted) return;
        setState(() {
          accountErrorMessage = 'Could not connect to server. Try again.';
          accountMessageIsError = true;
          accountMessageVisible = true;
        });
      }
    }
  }

  Future<void> handleResetPassword() async {
    final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
    final String port = dotenv.env['SERVER_PORT'] ?? '80';
    final url = Uri.http('$host:$port', '/api/forgot-password');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: utf8.encode(jsonEncode({'email': email})),
      );

      if (!mounted) return;

      final Map<String, dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
      final bool isError = data.containsKey('error');
      setState(() {
        accountErrorMessage = data['message'] ?? data['error'] ?? 'Something went wrong.';
        accountMessageIsError = isError;
        accountMessageVisible = true;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        accountErrorMessage = 'Could not connect to server. Try again.';
        accountMessageIsError = true;
        accountMessageVisible = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: Color.fromARGB(255, 0, 128, 128),
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: EdgeInsetsGeometry.directional(start: 10.0.w, end: 10.0.w, top: 60.0.h, bottom: 15.0.h),
                child: Win95Window(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        color: Color.fromARGB(255, 2, 21, 119),
                        width: double.infinity,
                        height: 38.h,
                        child: RichText(text: TextSpan(text: "  ScrapWeb - Account", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 23.sp, height: 1.6.h)))
                      ),
                      SizedBox(height: 12.h),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            RichText(text: TextSpan(text: "  First Name:", style: TextStyle(fontFamily: 'W95', fontWeight: FontWeight.w700, fontSize: 16.sp, color: Colors.black))),
                            SizedBox(height: 2.h),
                            editing
                              ? Win95Entry(
                                  paddingHorizontal: 8.w,
                                  paddingVertical: 2.h,
                                  child: TextField(
                                    controller: firstNameController,
                                    style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 16.sp),
                                    decoration: InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 5.h), filled: true, fillColor: Colors.white, isDense: true),
                                    onTapOutside: (_) => FocusScope.of(context).unfocus(),
                                  ),
                                )
                              : Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 10.w),
                                  child: RichText(text: TextSpan(text: firstName.isNotEmpty ? firstName : " ", style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
                                ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            RichText(text: TextSpan(text: "  Last Name:", style: TextStyle(fontFamily: 'W95', fontWeight: FontWeight.w700, fontSize: 16.sp, color: Colors.black))),
                            SizedBox(height: 2.h),
                            editing
                              ? Win95Entry(
                                  paddingHorizontal: 8.w,
                                  paddingVertical: 2.h,
                                  child: TextField(
                                    controller: lastNameController,
                                    style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 16.sp),
                                    decoration: InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 5.h), filled: true, fillColor: Colors.white, isDense: true),
                                    onTapOutside: (_) => FocusScope.of(context).unfocus(),
                                  ),
                                )
                              : Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 10.w),
                                  child: RichText(text: TextSpan(text: lastName.isNotEmpty ? lastName : " ", style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
                                ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            RichText(text: TextSpan(text: "  Username:", style: TextStyle(fontFamily: 'W95', fontWeight: FontWeight.w700, fontSize: 16.sp, color: Colors.black))),
                            SizedBox(height: 2.h),
                            editing
                              ? Win95Entry(
                                  paddingHorizontal: 8.w,
                                  paddingVertical: 2.h,
                                  child: TextField(
                                    controller: usernameController,
                                    style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 16.sp),
                                    decoration: InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 5.h), filled: true, fillColor: Colors.white, isDense: true),
                                    onTapOutside: (_) => FocusScope.of(context).unfocus(),
                                  ),
                                )
                              : Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 10.w),
                                  child: RichText(text: TextSpan(text: username.isNotEmpty ? username : " ", style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
                                ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            RichText(text: TextSpan(text: "  Email:", style: TextStyle(fontFamily: 'W95', fontWeight: FontWeight.w700, fontSize: 16.sp, color: Colors.black))),
                            SizedBox(height: 2.h),
                            editing
                              ? Win95Entry(
                                  paddingHorizontal: 8.w,
                                  paddingVertical: 2.h,
                                  child: TextField(
                                    controller: emailController,
                                    style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 16.sp),
                                    decoration: InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 5.h), filled: true, fillColor: Colors.white, isDense: true),
                                    onTapOutside: (_) => FocusScope.of(context).unfocus(),
                                  ),
                                )
                              : Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 10.w),
                                  child: RichText(text: TextSpan(text: email.isNotEmpty ? email : " ", style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
                                ),
                          ],
                        ),
                      ),
                      SizedBox(height: 40.h),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 8.h),
                        child: Win95Button(
                          height: 48.h,
                          text: "Reset Password",
                          onTap: () {
                            setState(() => accountMessageVisible = false);
                            handleResetPassword();
                            return;
                          }
                        )
                      ),
                      SizedBox(height: 6.h),
                      Visibility(
                        visible: accountMessageVisible,
                        child: Padding( 
                          padding: EdgeInsetsGeometry.symmetric(horizontal: 13.w),
                          child: RichText(text: TextSpan(text: accountErrorMessage, style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: accountMessageIsError ? Colors.red : Colors.black)))
                        )
                      )
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(
              height: 70.h,
              child: Win95Window(
                child: Row(
                  children: [
                    Expanded(
                      child: Win95Button(
                        height: 60.h,
                        text: editing ? "< Discard" : "< Back",
                        onTap: () {
                          setState(() => accountMessageVisible = false);
                          handleDiscard();
                          return;
                        }
                      )
                    ),
                    SizedBox(width: 2.0.w),
                    Expanded(
                      child: Win95Button(
                        height: 60.h,
                        text: editing ? " Save" : "Edit",
                        icon: editing ? 'images/save.png' : 'images/edit.png',
                        onTap: () {
                          setState(() => accountMessageVisible = false);
                          handleEditToggle();
                          return;
                        }
                      )
                    ),
                    SizedBox(width: 2.0.w),
                    Expanded(
                      child: Win95Button(
                        height: 60.h,
                        text: "Delete",
                        icon: 'images/x.png',
                        onTap: () {
                          setState(() => accountMessageVisible = false);
                          handleDelete();
                          return;
                        }
                      )
                    ),
                  ],
                ),
              )
            )
          ]
        )
      )
    );
  }
}