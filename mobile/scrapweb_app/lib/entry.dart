import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'win95_style.dart';

class Entry {
  final String id;
  final String dateString;
  final String? imageURL;
  final String? audioURL;
  final String? text;

  Entry({
    required this.id,
    required this.dateString,
    this.imageURL,
    this.audioURL,
    this.text
  });
  factory Entry.fromJson(Map<String, dynamic> json){
    return Entry(
      id: json['_id'],
      dateString: json['date'],
      imageURL: json['photo'],
      audioURL: json['audio'],
      text: json['notes']
    );
  }

  String get displayImage => imageURL ?? "../images/placeholderSquare.png";
}

class EntryClickable extends StatefulWidget {
  final Entry entry;
  final VoidCallback onRefresh;

  const EntryClickable({super.key, required this.entry, required this.onRefresh});

  @override
  State<EntryClickable> createState() => _EntryClickableState();
}
class _EntryClickableState extends State<EntryClickable> {

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        print("Intentional tap on: ${widget.entry.dateString}");
        await Navigator.pushNamed(
          context, 
          '/SongPage',
          arguments: widget.entry
        );
        
        widget.onRefresh();
      },
      child: SizedBox(
        height: 160.h,
        width: 160.w,
        child: Win95Window(
          child: Column(
            children: [
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(top: 5),
                  child: widget.entry.imageURL != "" ? Image.network(widget.entry.imageURL!, fit: BoxFit.cover) : Image.asset("images/placeholderSquare.png")
                )
              ),
              Padding(
                padding: EdgeInsets.all(4),
                child: RichText(text: TextSpan(text: widget.entry.dateString, style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 12.sp, height: 1.1.h)))
              )
            ],
          ),
        )
      )
    );
  }
}