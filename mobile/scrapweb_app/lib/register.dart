import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'win95_style.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});
  
  @override
  State<RegisterPage> createState() => _RegisterPageState();
}
class _RegisterPageState extends State<RegisterPage> {
  String username = '';
  String password = '';
  String email = '';
  String firstName = '';
  String lastName = '';
  bool registerError = false;
  String registerErrorMessage = "Incorrect Username or Password.";
  bool success = false;

  bool validateEmail() {
    final bool emailRegex = RegExp(r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+").hasMatch(email);
    return emailRegex;
  }

  bool validateFields(){
    return (username.trim().isNotEmpty && password.trim().isNotEmpty && email.trim().isNotEmpty && firstName.trim().isNotEmpty && lastName.trim().isNotEmpty);
  }

  Future<void> handleRegister() async {
    final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
    final String port = dotenv.env['SERVER_PORT'] ?? '80';
    final url = Uri.http('$host:$port', '/api/register');
 
    setState(() => registerError = false);
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: utf8.encode(jsonEncode({
          'username': username,
          'password': password,
          'email': email,
          'first_name': firstName,
          'last_name': lastName,
        })),
      );
 
      if (!mounted) return;
      print("$response");
      if (response.statusCode == 201) {
        Navigator.pushReplacementNamed(context, '/HomePage');
      } else {
        try {
          final Map<String, dynamic> errorData = jsonDecode(utf8.decode(response.bodyBytes));
          if (errorData['error'] != null) {
            registerErrorMessage = "${errorData['error']}";
          }
        } catch (e) {
          print("Error parsing error response: $e");
        }
 
        setState(() {
          if(registerErrorMessage == "Registration successful! Please check your email to verify your account."){
            success = true;
          } else {
            success = false;
          }
          registerError = true;
        });
      }
    } catch (e) {
      print(e);
      setState(() {
        registerError = true;
        success = false;
        registerErrorMessage = "Could not connect to server. Try again.";
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
        bottom: (MediaQuery.of(context).viewInsets.bottom > 0) ? 225.h : 135.h, 
        top: (MediaQuery.of(context).viewInsets.bottom > 0) ? 45.h : 135.h
      ),
      child: Win95Window(        
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Container(
              color: Color.fromARGB(255, 2, 21, 119),
              width: double.infinity,
              height: 35.h,
              child: RichText(text: TextSpan(text: '  ScrapWeb - Register', style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 20.sp, height: 1.6.h)))
            ),
            Center(
              child: Container(
                padding: EdgeInsets.all(10.0),
                child: Image(image: AssetImage('images/placeholderSquare.png'), width: 100.w)
              )
            ),
            RichText(text: TextSpan(text: '   First Name:', style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
            Win95Entry(
              paddingHorizontal: 10.w, 
              paddingVertical: 0,
              marginHorizontal: 5,
              child: Win95InputBox(
                text: 'First Name',
                onChanged: (value) => setState(() => firstName = value),
              )
            ),
            SizedBox(
              height: 20.h, 
            ),
            RichText(text: TextSpan(text: '   Last Name:', style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
            Win95Entry(
              paddingHorizontal: 10.w, 
              paddingVertical: 0,
              marginHorizontal: 5,
              child: Win95InputBox(
                text: 'Last Name',
                onChanged: (value) => setState(() => lastName = value),
              )
            ),
            SizedBox(
              height: 20.h, 
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
                isPassword: true,
                onChanged: (value) => setState(() => password = value),
              )
            ),
            SizedBox(
              height: 20.h, 
            ),
            RichText(text: TextSpan(text: '   Email:', style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black))),
            Win95Entry(
              paddingHorizontal: 10.w, 
              paddingVertical: 0,
              marginHorizontal: 5,
              child: Win95InputBox(
                text: 'Email',
                onChanged: (value) => setState(() => email = value),
              )
            ),
            SizedBox(height: 5.h),
            Visibility(
              visible: registerError,
              maintainSize: true,
              maintainAnimation: true,
              maintainState: true,
              child: Padding(
                padding: EdgeInsetsGeometry.symmetric(horizontal: 13.w),
                child:RichText(text: TextSpan(text: registerErrorMessage, style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: success ? Colors.black : Colors.red)))
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
                          Navigator.pushReplacementNamed(context, '/');
                        },
                        child: Padding(
                          padding: EdgeInsets.only(left: 7.w),
                          child: RichText(text: TextSpan(text: 'Log In', style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, decoration: TextDecoration.underline, decorationThickness: 1.5, color: const Color.fromARGB(255, 0, 0, 255))))
                        )
                      )
                    ),
                    Win95Button(
                      text: 'Register', 
                      onTap: () {
                        if(validateFields()){
                          if(validateEmail()){
                            handleRegister();
                          } else {
                            setState(() {
                              registerErrorMessage = "Please enter a valid email.";
                              success = false;
                              registerError = true;
                            });
                          }
                        } else {
                          setState(() {
                            registerErrorMessage = "Please fill all fields.";
                            success = false;
                            registerError = true;
                          });
                        }
                        print("Register button pressed. $username, $password, $email, $firstName, $lastName. $registerError");
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