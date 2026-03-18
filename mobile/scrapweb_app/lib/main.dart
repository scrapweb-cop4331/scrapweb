import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      initialRoute: '/',
      onGenerateRoute: (RouteSettings settings) {
        switch (settings.name) {
          case '/':
            return MaterialPageRoute(builder: (context) => LoginPage());
          /* case '/HomePage':
            return MaterialPageRoute(builder: (context) => HomePage());
          case '/SongPage':
            return MaterialPageRoute(builder: (context) => SongPage()); */
          default:
            return null;
        }
      },
      theme: ThemeData(
        splashFactory: NoSplash.splashFactory,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        hoverColor: Colors.transparent,
      )
    );
  }
}

/* 
  Button Widget 
  Creates Win95-esque button
  Required parameters:
    - text: 'string'
    - onTap: () {
      <function>
    }
  
  Optional parameters:
    - width: int (default 100)
    - height: int (default 35)
*/
class Win95Button extends StatefulWidget {
  final String text;
  final VoidCallback onTap;
  final double width;
  final double height;

  const Win95Button({
    super.key,
    required this.text,
    required this.onTap,
    this.width = 100,
    this.height = 35,
  });

  @override
  State<Win95Button> createState() => _Win95ButtonState();
}
class _Win95ButtonState extends State<Win95Button> {
  bool isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown: (_) => setState(() => isPressed = true),
      onTapUp: (_) => setState(() => isPressed = false),
      onTapCancel: () => setState(() => isPressed = false),

      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: Color.fromARGB(255, 195, 199, 203),
          border: Border(
            top: BorderSide(color: isPressed ? Colors.black : Colors.white, width: 2),
            left: BorderSide(color: isPressed ? Colors.black : Colors.white, width: 2),
            bottom: BorderSide(color: isPressed ? Colors.white : Colors.black, width: 2),
            right: BorderSide(color: isPressed ? Colors.white : Colors.black, width: 2),
          ),
        ),
        child: Center(
          child: Text(
            widget.text,
            style: const TextStyle(
              fontFamily: 'W95',
              color: Colors.black,
              fontSize: 14,
            ),
          ),
        ),
      )
    );
  }
}


class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  
  @override
  State<LoginPage> createState() => _LoginPageState();
} 

class _LoginPageState extends State<LoginPage> {
  Color buttonTopLeftColor = Colors.white;
  Color buttonBottomRightColor = Colors.black;
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Color.fromARGB(255, 0, 128, 128),
      padding: EdgeInsets.symmetric(horizontal: 70.0, vertical: 200.0),
      child: Material( 
        shape: Border(
          right: BorderSide(
            width: 2,
            color: Colors.black,
          ),
          left: BorderSide(
            width: 2,
            color: Colors.white,
          ),
          top: BorderSide(
            width: 2,
            color: Colors.white,
          ),
          bottom: BorderSide(
            width: 2,
            color: Colors.black,
          ),
        ),
        child: Scaffold(
          backgroundColor:  Color.fromARGB(255, 195, 199, 203),
          body: Center(
            child: Container(
              padding: EdgeInsets.all(4.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Container(
                    color: Color.fromARGB(255, 2, 21, 119),
                    width: double.infinity,
                    height: 35,
                    child: RichText(text: TextSpan(text: '  ScrapWeb - Login', style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 20, height: 1.6)))
                  ),
                  Center(
                    child: Container(
                      padding: EdgeInsets.all(10.0),
                      child: Image(image: AssetImage('images/placeholderSquare.png'), width: 100)
                    )
                  ),
                  RichText(text: TextSpan(text: '   Username:', style: TextStyle(fontFamily: 'W95', fontSize: 16, color: Colors.black))),
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 10),
                    child: Material(
                      shape: Border(
                        right: BorderSide(
                          width: 2,
                          color: Color.fromARGB(255, 221, 228, 234)
                        ),
                        left: BorderSide(
                          width: 2,
                          color: Color.fromARGB(255, 134, 138, 142)
                        ),
                        top: BorderSide(
                          width: 2,
                          color: Color.fromARGB(255, 134, 138, 142)
                        ),
                        bottom: BorderSide(
                          width: 2,
                          color: Color.fromARGB(255, 221, 228, 234)
                        )
                      ),
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: ' Username',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 0, vertical: 5),
                          filled: true,
                          isDense: true,
                          fillColor: Color.fromARGB(255, 255, 255, 255),
                          hintStyle: TextStyle(fontFamily: 'W95')
                        ),
                      )
                    )
                  ),
                  SizedBox(
                    height: 20, 
                  ),
                  RichText(text: TextSpan(text: '   Password:', style: TextStyle(fontFamily: 'W95', fontSize: 16, color: Colors.black))),
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 10),
                    child: Material(
                      shape: Border(
                        right: BorderSide(
                          width: 2,
                          color: Color.fromARGB(255, 221, 228, 234)
                        ),
                        left: BorderSide(
                          width: 2,
                          color: Color.fromARGB(255, 134, 138, 142)
                        ),
                        top: BorderSide(
                          width: 2,
                          color: Color.fromARGB(255, 134, 138, 142)
                        ),
                        bottom: BorderSide(
                          width: 2,
                          color: Color.fromARGB(255, 221, 228, 234)
                        )
                      ),
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: ' Password',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 0, vertical: 5),
                          filled: true,
                          isDense: true,
                          fillColor: Color.fromARGB(255, 255, 255, 255),
                          hintStyle: TextStyle(fontFamily: 'W95')
                        ),
                      )
                    )
                  ),
                  Spacer(),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Win95Button(
                      text: 'Log In', 
                      onTap: () {
                        print("Button pressed.");
                        return;
                      },
                      width: 150,
                      height: 50
                    )
                  )
                ]
              )
            )
          ),
        )
      )
    );
  }
}

/* class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
    length: 3,
    child: 
      Scaffold(
        appBar: TabBar(tabs: [
          Tab(text: 'Test1'),
          Tab(text: 'Test2'),
          Tab(text: 'Test3')
        ]),
      )
    );
  }
} */
/* class SongPage extends StatefulWidget {
  const SongPage({super.key});
} */