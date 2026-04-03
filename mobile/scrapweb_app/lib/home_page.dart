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
      id: json['id'],
      dateString: json['date'],
      imageURL: json['imageURL'],
      audioURL: json['audioURL'],
      text: json['text']
    );
  }

  String get displayImage => imageURL ?? "../images/placeholderSquare.png";
}

class MonthGroup {
  final String title;
  final List<Entry> entries;

  MonthGroup._internal({
    required this.title, 
    required this.entries
  });

  static List<MonthGroup> convertAPIList(List<dynamic> APIArray) {
    final List<Entry> allEntries = APIArray.map((json) => Entry.fromJson(json)).toList();
    allEntries.sort((a, b) => b.dateString.compareTo(a.dateString));
    final Map<String, List<Entry>> groupedMap = {};

    for(var entry in allEntries) {
      final date = DateTime.parse(entry.dateString);
      final String monthYear = "${getMonthName(date.month)} ${date.year}";
      groupedMap.putIfAbsent(monthYear, () => []).add(entry);
    }

    return groupedMap.entries.map((entry) => MonthGroup._internal(title: entry.key, entries: entry.value)).toList();
  }

  static String getMonthName(int month) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month - 1];
}

final List<Map<String, dynamic>> sampleAPIResponse = [
  {
    "id": "_1d",
    "date": "2023-10-12",
    "imageURL": "https://picsum.photos/200",
    "audioURL": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "text": "A beautiful autumn day."
  },
  {
    "id": "_6d",
    "date": "2023-10-05",
    "imageURL": null,
    "audioURL": null,
    "text": "Just a quick note for today."
  },
  {
    "id": "_5d",
    "date": "2023-11-01",
    "imageURL": "https://picsum.photos/201",
    "audioURL": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "text": "First day of November!"
  },
  {
    "id": "_4d",
    "date": "2023-09-28",
    "imageURL": null,
    "audioURL": null,
    "text": "End of September reflections."
  },
  {
    "id": "_3d",
    "date": "2023-09-27",
    "imageURL": null,
    "audioURL": null,
    "text": null
  },
  {
    "id": "_2d",
    "date": "2023-09-26",
    "imageURL": null,
    "audioURL": null,
    "text": "End of September reflections."
  },
  {
    "id": "_1c",
    "date": "2023-09-25",
    "imageURL": null,
    "audioURL": null,
    "text": "End of September reflections."
  }
];

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
                  child: widget.entry.imageURL != null ? Image.network(widget.entry.imageURL!, fit: BoxFit.cover) : Image.asset("images/placeholderSquare.png")
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


class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}
class _HomePageState extends State<HomePage> {
  final ScrollController scrollController = ScrollController();

  List<MonthGroup> groupedData = [];
  
  
  @override initState() {
    super.initState();
    fetchEntries();
  }

  Future<void> fetchEntries() async {
    //Call API
    final List<MonthGroup> data = MonthGroup.convertAPIList(sampleAPIResponse);
    setState(() => groupedData = data);
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
                  padding: EdgeInsetsGeometry.directional(start: 10, end: 10, top: 60, bottom: 60),
                  child: Win95Window(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          color: Color.fromARGB(255, 2, 21, 119),
                          width: double.infinity,
                          height: 38.h,
                          child: RichText(text: TextSpan(text: " ScrapWeb", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 23.sp, height: 1.6.h)))
                        ),
                        Expanded(
                          child: RawScrollbar(
                            controller: scrollController,
                            thumbVisibility: true,
                            trackVisibility: true,
                            thickness: 16.w,
                            thumbColor: Color.fromARGB(255, 195, 199, 203),
                            trackColor: Color.fromARGB(255, 224, 224, 224),
                            trackBorderColor: Colors.black,
                            mainAxisMargin: 0,
                            padding: EdgeInsets.only(top: 10, right: 10, bottom: 0),
                            shape: Win95BackupOutline(),
                            child: Win95Entry(
                              paddingHorizontal: 5,
                              paddingVertical: 5,
                              child: MediaQuery.removePadding(
                                context: context,
                                removeTop: true,
                                child: ListView.builder(
                                  physics: ClampingScrollPhysics(),
                                  controller: scrollController,
                                  itemCount: groupedData.length,
                                  itemBuilder: (context, index) {
                                    final group = groupedData[index];

                                    return Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Padding(
                                          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                          child: RichText(text: TextSpan(text: group.title, style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 0, 0, 0), fontSize: 21.sp, height: 1.4.h)))
                                        ),
                                        Padding(
                                          padding: EdgeInsets.symmetric(horizontal: 8),
                                          child: Wrap(
                                            spacing: 4,
                                            runSpacing: 4,
                                            children: group.entries.map((entry) {
                                              return EntryClickable(entry: entry, onRefresh: fetchEntries);
                                            }).toList()
                                          )
                                        ),
                                        SizedBox(height: 10.h)
                                      ],
                                    );
                                  },
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
                height: 70.h,
                child: Win95Window(
                  child: Row(
                    children: [
                      Expanded(
                        child: Win95Button(
                          height: 60.h,
                          text: "< Log Out", 
                          onTap: () {
                            return;
                          } 
                        )
                      ),
                      SizedBox(width: 2.0.w),
                      Expanded(
                        child: Win95Button(
                          height: 60.h,
                          text: "Account", 
                          onTap: () {
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