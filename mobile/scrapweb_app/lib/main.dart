import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'login.dart';
import 'song_page.dart';

// TODO: reminder to make API calls with UTF-8 formatting

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(411, 891),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp(
          initialRoute: '/',
          onGenerateRoute: (RouteSettings settings) {
            switch (settings.name) {
              case '/':
                return MaterialPageRoute(builder: (context) => LoginPage());
              /* case '/HomePage':
                return MaterialPageRoute(builder: (context) => HomePage()); */
              case '/SongPage':
                return MaterialPageRoute(builder: (context) => SongPage()); 
              default:
                return null;
            }
          },
          theme: ThemeData(
            splashFactory: NoSplash.splashFactory,
            splashColor: Colors.transparent,
            highlightColor: Colors.transparent,
            hoverColor: Colors.transparent,
            focusColor: Colors.transparent,

            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap
          )
        );
      }
    );
  }
}
