import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'win95_style.dart';

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

  Color buttonTopLeftColor = Colors.white;
  Color buttonBottomRightColor = Colors.black;

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
                child: Image(image: AssetImage('images/placeholderSquare.png'), width: 100.w)
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
              child: RichText(
                text: TextSpan(
                  text: "   Incorrect Username or Password.", 
                  style: TextStyle(
                    fontFamily: 'W95', 
                    fontSize: 16.sp, 
                    color: Colors.red
                  )
                )
              )
            ),
            SizedBox(height: 18.h),
            Padding(
              padding: EdgeInsetsGeometry.symmetric(vertical: 3.0.h, horizontal: 10.0.w),
                child: Align(
                  alignment: Alignment.bottomRight,
                  child: Win95Button(
                    text: 'Log In', 
                    onTap: () {
                      setState(() {
                        loginError = !loginError;
                      });
                      print("Login button pressed. $username, $password. $loginError");
                      return;
                    },
                    width: 150.w,
                    height: 50.h
                  )
                )
              )
            ]
          )
        ),
      );
  }
}