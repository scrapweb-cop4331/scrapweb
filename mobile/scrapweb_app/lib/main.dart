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
      }
      
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  
  @override
  State<LoginPage> createState() => _LoginPageState();
} 

class _LoginPageState extends State<LoginPage> {
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
          body: Center(
            child: Container(
              padding: EdgeInsets.all(4.0),
              child: Column(
                children: <Widget>[
                  Container(
                    color: Color.fromARGB(255, 2, 21, 119),
                    width: 270,
                    child: Text(' ScrapWeb - Login', style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 20, height: 1.6))
                  ),
                  Container(
                    padding: EdgeInsets.all(10.0),
                    child: Image(image: AssetImage('images/placeholderSquare.png'), width: 100)
                  ),
                  Text('Username:', style: TextStyle(fontFamily: 'W95', fontSize: 20)),
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 30),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Username'
                      ),
                    )
                  )
                ]
              )
            )
          ),
        backgroundColor: const Color.fromARGB(255, 195, 199, 203)
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