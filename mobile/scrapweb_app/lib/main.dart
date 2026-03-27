import 'package:flutter/material.dart';
import 'package:audio_video_progress_bar/audio_video_progress_bar.dart';
import 'package:just_audio/just_audio.dart';
import 'package:rxdart/rxdart.dart';

// TODO: reminder to make API calls with UTF-8 formatting

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      initialRoute: '/SongPage',
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
}

/* 
  Button Widget 
  Creates Win95-esque button
  Required parameters:
    - text: 'String'
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
  final double? width;
  final double? height;
  final String? icon;

  const Win95Button({
    super.key,
    required this.text,
    required this.onTap,
    this.width,
    this.height,
    this.icon
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
        width: widget.width ?? double.infinity,
        height: widget.height ?? double.infinity,
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
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if(widget.icon != null) ... [
                Image(image: AssetImage(widget.icon!), height:17),
                SizedBox(width: 3)
              ],
              RichText(text: TextSpan(text: widget.text, style: TextStyle(fontFamily: 'W95', fontSize: 16, color: Colors.black)))
            ]
          )
        ),
      )
    );
  }
}

/*
  Window Widget
  Create a Windows 95 style box ("window")

  Required parameters:
  - child: Widget (whatever goes into the window)
*/
class Win95Window extends StatefulWidget {
  final Widget child;
  
  const Win95Window({
    super.key,
    required this.child
  });

  @override
  State<Win95Window> createState() => _Win95WindowState();
}
class _Win95WindowState extends State<Win95Window> {
  @override
  Widget build(BuildContext context) {
    return Material(
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
              child: widget.child
            )
          )
        )
      );
  }
}

/*
  Entry Border Widget
  Creates the Windows 95 borders and internals for an entry (which is swappable)

  Required parameters:
  - child: Widget (whatever goes inside the border)
  - paddingHorizontal: float
  - paddingVertical: float
*/
class Win95Entry extends StatefulWidget {
  final Widget child;
  final double paddingHorizontal;
  final double paddingVertical;
  
  const Win95Entry({
    super.key,
    required this.child,
    required this.paddingHorizontal,
    required this.paddingVertical
  });

  @override
  State<Win95Entry> createState() => _Win95EntryState();
}
class _Win95EntryState extends State<Win95Entry> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: widget.paddingHorizontal, vertical: widget.paddingVertical),
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
        child: widget.child
      )
    );
  }
}

/*
  Input Box Widget
  Creates a stylized input text box

  Required paramters:
  - text: 'String'
*/
class Win95InputBox extends StatefulWidget {
  final String text;
  final ValueChanged<String> onChanged;
  
  const Win95InputBox({
    super.key,
    required this.text,
    required this.onChanged
  });

  @override
  State<Win95InputBox> createState() => _Win95InputBoxState();
}
class _Win95InputBoxState extends State<Win95InputBox> {
  String inputText ='';

  @override
  Widget build(BuildContext context) {
    return TextField(
        decoration: InputDecoration(
          hintText: widget.text,
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 0, vertical: 5),
          filled: true,
          fillColor: Color.fromARGB(255, 255, 255, 255),
          isDense: true,
          hintStyle: TextStyle(fontFamily: 'W95')
        ),
        onChanged: widget.onChanged
      );
  }
}

/*
  Divider Widget
  Creates a stylized divider

  No Parameters
*/
class Win95Divider extends StatefulWidget { 
  const Win95Divider({
    super.key,
  });

  @override
  State<Win95Divider> createState() => _Win95DividerState();
}
class _Win95DividerState extends State<Win95Divider> {
  @override
  Widget build(BuildContext context) {
    return 
      Container(
        margin: EdgeInsets.symmetric(horizontal: 3),
        height: 2,
        color: const Color.fromARGB(255, 230, 230, 230),
        alignment: Alignment.topLeft,
        child: Container(
          height: 1,
          color: const Color.fromARGB(255, 134, 138, 142)
        )
      )
    ;
  }
}

/*
  Border Color
  Used to create Win95 borders on objects that dont support individual borders on each side

  No parameters
*/
class Win95BackupOutline extends OutlinedBorder{
  const Win95BackupOutline();
  
  @override
  OutlinedBorder copyWith({BorderSide? side}) => const Win95BackupOutline();
  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => Path()..addRect(rect);
  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) => Path()..addRect(rect);

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final Paint paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 2.0;

    canvas.drawLine(rect.topLeft, rect.topRight, paint..color = Colors.white);
    canvas.drawLine(rect.topLeft, rect.bottomLeft, paint..color = Colors.white);
    canvas.drawLine(rect.bottomLeft, rect.bottomRight, paint..color = Colors.black);
    canvas.drawLine(rect.topRight, rect.bottomRight, paint..color = Colors.black);
  }

  @override
  ShapeBorder scale(double t) => const Win95BackupOutline();
}

/*
  Duration information for song playing
*/
class DurationState {
  const DurationState({
    this.progress = Duration.zero, 
    this.buffered = Duration.zero, 
    this.total = Duration.zero
  });
  final Duration progress;
  final Duration buffered;
  final Duration total;
}

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
      padding: EdgeInsets.symmetric(horizontal: 70.0, vertical: 240.0),
        child: Win95Window(        
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
              Win95Entry(
                paddingHorizontal: 10, 
                paddingVertical: 0,
                child: Win95InputBox(
                  text: ' Username',
                  onChanged: (value) => setState(() => username = value),
                )
              ),
              SizedBox(
                height: 20, 
              ),
              RichText(text: TextSpan(text: '   Password:', style: TextStyle(fontFamily: 'W95', fontSize: 16, color: Colors.black))),
              Win95Entry(
                paddingHorizontal: 10, 
                paddingVertical: 0,
                child: Win95InputBox(
                  text: ' Password',
                  onChanged: (value) => setState(() => password = value),
                )
              ),
              SizedBox(height: 5),
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
                      fontSize: 16, 
                      color: Colors.red
                    )
                  )
                )
              ),
              SizedBox(height: 18),
              Padding(
                padding: EdgeInsetsGeometry.symmetric(vertical: 3.0, horizontal: 10.0),
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
                      width: 150,
                      height: 50
                    )
                )
              )
            ]
          )
      ),
    );
  }
}

class SongPage extends StatefulWidget {
  const SongPage({super.key});

  @override
  State<SongPage> createState() => _SongPageState();
}
class _SongPageState extends State<SongPage> {
  bool editing = false;
  bool playing = false;
  String? songText = "This is a test! If you can see this, you are testing! This time its REAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALY LONG. LIKE I NEED IT TO REACH THE BOTTOM OF THE PAGE SO HERES LOREM IPSUM ! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce justo arcu, sollicitudin vehicula lectus eu, ultricies ullamcorper nibh. Mauris facilisis sapien eget turpis laoreet rutrum. Donec pharetra varius fermentum. Fusce nec suscipit ipsum. Etiam condimentum ullamcorper quam vestibulum tincidunt. Phasellus pretium leo ut massa finibus accumsan. Morbi nec bibendum diam. Proin ultricies sodales feugiat. Morbi semper eu odio ultricies blandit. Donec nec sem et ipsum tristique eleifend non non orci. Donec sodales quam eget felis tristique, nec porta metus fringilla. In finibus maximus vulputate. Nam blandit cursus dignissim. Duis rutrum at nisi eu aliquam. Proin nisl turpis, rhoncus luctus eros aliquet, efficitur congue dolor. Donec rutrum, ipsum iaculis commodo dapibus, augue elit porttitor elit, vitae eleifend diam est vel quam. Nam fringilla sed sem non efficitur. Proin sed mi aliquet, semper metus a, accumsan diam.";
  String? songImage;
  String? audio;
  String date = "00/00/0000";
  
  final AudioPlayer player = AudioPlayer();
  late Stream<DurationState>? durationState;

  @override
  void initState() {
    super.initState();
    //fetchData();

    durationState = Rx.combineLatest3<Duration, Duration, Duration?, DurationState>(
      player.positionStream,
      player.bufferedPositionStream,
      player.durationStream,
      (progress, buffered, total) => DurationState(
        progress: progress,
        buffered: buffered,
        total: total ?? Duration.zero
      )
    );

    setupAudio();
  }

  Future<void> setupAudio() async {
    if (audio != null && audio!.isNotEmpty) {
      try {
        await player.setUrl(audio!);
      } catch (e) {
        print("Error loading audio URL: $e");
      }
    } else {
      print("Audio URL is null or empty.");
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
                padding: EdgeInsetsGeometry.directional(start: 10.0, end: 10.0, top: 60.0, bottom: 15.0),
                child: Win95Window(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        color: Color.fromARGB(255, 2, 21, 119),
                        width: double.infinity,
                        height: 35,
                        child: RichText(text: TextSpan(text: "  $date", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 20, height: 1.6)))
                      ),
                      Center(
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 30, vertical: 10),
                          child: Image(
                            image: songImage != null ? NetworkImage(songImage!) as ImageProvider : const AssetImage('images/placeholderSquare.png'),
                            errorBuilder: (context, error, stackTract) => Image.asset('images/placeholderSquare.png'),
                          )
                        ),
                      ),
                      Center(
                        child: Container(
                          margin: EdgeInsets.symmetric(horizontal: 40),
                          child: StreamBuilder<DurationState>(
                            stream: durationState,
                            builder: (context, snapshot) {
                              final durationState = snapshot.data;
                              final progress = durationState?.progress ?? Duration.zero;
                              //final buffered = durationState?.buffered ?? Duration.zero;
                              final total = durationState?.total ?? Duration.zero;

                              return ProgressBar(
                                progress: progress,
                                total: total,
                                thumbGlowColor: Colors.transparent,
                                thumbGlowRadius: 0.0,
                                onSeek: (duration) {
                                  player.seek(duration);
                                  print("User seek to $duration");
                                }
                              );
                            }
                          )
                        )
                      ),
                      SizedBox(
                        height: 30, // 50px (button height) - 20px (desired overlap)
                        child: Stack(
                          clipBehavior: Clip.none, // Allows the button to "leak" outside the 30px box
                          children: [
                            Positioned(
                              top: -20, // Pulls the button UP by 20px to intersect the item above
                              left: 0,
                              right: 0,
                              child: Center(
                                child: Win95Button(
                                  height: 50,
                                  width: 50,
                                  icon: playing ? 'images/pause.png' : 'images/play.png',
                                  text: "",
                                  onTap: () {
                                    if(audio == null || audio!.isEmpty) return;
                                    if(playing) {
                                      player.pause();
                                    } else {
                                      player.play();
                                    }
                                    setState(() {
                                      playing = !playing;
                                    });
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 10),
                      Win95Divider(),
                      Expanded(
                        child: Container(
                          padding: EdgeInsets.all(5),
                          child: Material(
                            shape: Border.all(
                              color: const Color.fromARGB(255, 134, 138, 142)
                            ),
                            child: Container(
                              padding: EdgeInsets.all(5),
                              color: Color.fromARGB(255, 195, 199, 203),
                              child: RawScrollbar(
                                thumbVisibility: true,
                                trackVisibility: true,
                                thickness: 16,
                                thumbColor: Color.fromARGB(255, 195, 199, 203),
                                trackColor: Color.fromARGB(255, 224, 224, 224),
                                trackBorderColor: const Color.fromARGB(255, 0, 0, 0),
                                mainAxisMargin: 0,
                                padding: EdgeInsets.zero,
                                shape: Win95BackupOutline(),
                                child: ScrollConfiguration(
                                  behavior: ScrollConfiguration.of(context).copyWith(overscroll: false), 
                                  child: SingleChildScrollView(
                                    physics: const ClampingScrollPhysics(),
                                    child: Padding(
                                      padding: EdgeInsets.only(right: 20), 
                                      child: RichText(text: TextSpan(text: "$songText", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 0, 0, 0), fontSize: 15, height: 1.0)))
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    ],
                  )
                )
              )
            ),
            SizedBox(
              height: 70,
              child: Win95Window(
                child: Row(
                  children: [
                    Expanded(
                      child: Win95Button(
                        height: 60,
                        text: "< Back", 
                        onTap: () {
                          print("Back button pressed.");
                          return;
                        } 
                      )
                    ),
                    SizedBox(width: 2.0),
                    Expanded(
                      child: Win95Button(
                        height: 60,
                        icon: 'images/edit.png',
                        text: "Edit", 
                        onTap: () {
                          print("Edit button pressed.");
                          return;
                        } 
                      )
                    )
                  ],
                )      
              )
            )
          ]
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

