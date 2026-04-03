import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'login.dart';
import 'song_page.dart';
import 'home_page.dart';

// TODO: reminder to make API calls with UTF-8 formatting

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  Future<void> requestAllPermissions() async {
    Map<Permission, PermissionStatus> statuses = await [
      Permission.camera,
      Permission.photos,
      Permission.audio,
    ].request();

    if (statuses[Permission.camera]!.isGranted && 
        statuses[Permission.photos]!.isGranted) {
      print("Camera and Photos ready!");
    }
}
  
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    requestAllPermissions();
    return ScreenUtilInit(
      designSize: const Size(411, 891),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp(
          scrollBehavior: const ScrollBehavior().copyWith(overscroll: false),
          initialRoute: '/HomePage',
          onGenerateRoute: (RouteSettings settings) {
            switch (settings.name) {
              case '/':
                return MaterialPageRoute(builder: (context) => LoginPage());
               case '/HomePage':
                return MaterialPageRoute(builder: (context) => HomePage()); 
              case '/SongPage':
              final entry = settings.arguments as Entry;
                return MaterialPageRoute(builder: (context) => SongPage(entry: entry)); 
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
