import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'win95_style.dart';
import 'dart:convert';

// Login Page
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  
  @override
  State<LoginPage> createState() => _LoginPageState();
} 
class _LoginPageState extends State<LoginPage> {
  String username = '';
  String password = '';
  bool loginError = false;
  String loginErrorMessage = "Incorrect Username or Password.";

  Future<void> handleLogin() async {
    final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
    final String port = dotenv.env['SERVER_PORT'] ?? '80';
    final url = Uri.http('$host:$port', '/api/login');

    if (username.isEmpty || password.isEmpty) {
      setState(() {
        loginError = true;
        loginErrorMessage = "Please enter a username and password.";
      });
      return;
    }
 
    setState(() => loginError = false);
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: utf8.encode(jsonEncode({
          'username': username,
          'password': password,
        })),
      );
 
      if (!mounted) return;
 
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));

        final String token = data['token'];
        final Map<String, dynamic> user = data['user'];
 
        // Store token and user info for use elsewhere in the app
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', token);
        await prefs.setString('user_id', user['id']);
        await prefs.setString('username', user['username']);
        await prefs.setString('first_name', user['first_name']);
        await prefs.setString('last_name', user['last_name']);
        await prefs.setString('email', user['email']);
 
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/HomePage');
      } else {
        String errorMsg = "Incorrect Username or Password.";
        try {
          final Map<String, dynamic> errorData = jsonDecode(utf8.decode(response.bodyBytes));
          if (errorData['error'] != null) {
            errorMsg = "${errorData['error']}";
          }
        } catch (e) {
          print("Error parsing error response: $e");
        }
 
        setState(() {
          loginError = true;
          loginErrorMessage = errorMsg;
        });
      }
    } catch (e) {
      print(e);
      setState(() {
        loginError = true;
        loginErrorMessage = "Could not connect to server. Try again.";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Color.fromARGB(255, 0, 128, 128),
      padding: EdgeInsets.only(
        left: 70.w, 
        right: 70.w, 
        bottom: (MediaQuery.of(context).viewInsets.bottom > 0) ? 400.h : 240.h, 
        top: (MediaQuery.of(context).viewInsets.bottom > 0) ? 70.h : 240.h
      ),
      child: Win95Window(        
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Container(
              color: Color.fromARGB(255, 2, 21, 119),
              width: double.infinity,
              height: 35.h,
              child: RichText(text: TextSpan(text: '  ScrapWeb - Login', style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 20.sp, height: 1.6.h)))
            ),
            Center(
              child: Container(
                padding: EdgeInsets.all(10.0),
                child: Image(image: AssetImage('images/logo_worded.png'), width: 200.w)
              )
            ),
            RichText(text: TextSpan(text: '   Username:', style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
            Win95Entry(
              paddingHorizontal: 10.w, 
              paddingVertical: 0,
              marginHorizontal: 5,
              child: Win95InputBox(
                text: 'Username',
                onChanged: (value) => setState(() => username = value),
              )
            ),
            SizedBox(
              height: 20.h, 
            ),
            RichText(text: TextSpan(text: '   Password:', style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
            Win95Entry(
              paddingHorizontal: 10.w, 
              paddingVertical: 0,
              marginHorizontal: 5,
              child: Win95InputBox(
                text: 'Password',
                onChanged: (value) => setState(() => password = value),
                isPassword: true,
              )
            ),
            SizedBox(height: 5.h),
            Visibility(
              visible: loginError,
              maintainSize: true,
              maintainAnimation: true,
              maintainState: true,
              child: Padding(
                padding: EdgeInsetsGeometry.symmetric(horizontal: 13.w),
                child:RichText(text: TextSpan(text: loginErrorMessage, style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.red)))
              )
            ),
            SizedBox(height: 18.h),
            Padding(
              padding: EdgeInsetsGeometry.symmetric(vertical: 3.0.h, horizontal: 10.0.w),
                child: Row( 
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap:() {
                          Navigator.pushReplacementNamed(context, '/Register');
                        },
                        child: Padding(
                          padding: EdgeInsets.only(left: 7.w),
                          child: RichText(text: TextSpan(text: 'Register', style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, decoration: TextDecoration.underline, decorationThickness: 1.5, color: const Color.fromARGB(255, 0, 0, 255))))
                        )
                      )
                    ),
                    Win95Button(
                      text: 'Log In', 
                      onTap: () {
                        handleLogin();
                        print("Login button pressed. $username, $password. $loginError");
                        return;
                      },
                      width: 150.w,
                      height: 50.h
                    )
                  ]
                )
              )
            ]
          )
        ),
      );
  }
}