import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

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
  final double iconSize;

  const Win95Button({
    super.key,
    required this.text,
    required this.onTap,
    this.width,
    this.height,
    this.icon,
    this.iconSize = 17
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
                Image(image: AssetImage(widget.icon!), height:widget.iconSize),
                SizedBox(width: 3)
              ],
              RichText(text: TextSpan(text: widget.text, style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: Colors.black)))
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
  final double marginHorizontal;
  final double marginVertical;
  
  const Win95Entry({
    super.key,
    required this.child,
    required this.paddingHorizontal,
    required this.paddingVertical,
    this.marginHorizontal = 0,
    this.marginVertical = 0
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
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: widget.marginHorizontal, vertical: widget.marginVertical),
          child: widget.child
        )
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
  final bool isPassword;
  
  const Win95InputBox({
    super.key,
    required this.text,
    required this.onChanged,
    this.isPassword = false
  });

  @override
  State<Win95InputBox> createState() => _Win95InputBoxState();
}
class _Win95InputBoxState extends State<Win95InputBox> {
  String inputText ='';

  @override
  Widget build(BuildContext context) {
    return TextField(
      obscureText: widget.isPassword,
      keyboardType: widget.isPassword ? TextInputType.visiblePassword : TextInputType.text,
      style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 0, 0, 0)),
      decoration: InputDecoration(
        hintText: widget.text,
        border: InputBorder.none,
        contentPadding: EdgeInsets.symmetric(horizontal: 0, vertical: 5),
        filled: true,
        fillColor: Color.fromARGB(255, 255, 255, 255),
        isDense: true,
        hintStyle: TextStyle(fontFamily: 'W95')
      ),
      onChanged: widget.onChanged,
      onTapOutside: (_) {FocusScope.of(context).unfocus();}
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