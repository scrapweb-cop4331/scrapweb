import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'win95_style.dart';
import 'entry.dart';

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
    "text": "Test 1."
  },
  {
    "id": "_6d",
    "date": "2023-10-05",
    "imageURL": null,
    "audioURL": null,
    "text": "test 2"
  },
  {
    "id": "_5d",
    "date": "2023-11-01",
    "imageURL": "https://picsum.photos/202",
    "audioURL": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "text": "Hello, World!"
  },
  {
    "id": "_4d",
    "date": "2023-09-28",
    "imageURL": null,
    "audioURL": null,
    "text": "idk"
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
    "imageURL": "https://picsum.photos/201",
    "audioURL": null,
    "text": "really long string to show off the previous thing gone :( so here lorem again: Lorem ipsum dolor sit amet consectetur adipiscing elit. Pretium tellus duis convallis tempus leo eu aenean. Iaculis massa nisl malesuada lacinia integer nunc posuere. Conubia nostra inceptos himenaeos orci varius natoque penatibus. Nulla molestie mattis scelerisque maximus eget fermentum odio. Blandit quis suspendisse aliquet nisi sodales consequat magna. Ligula congue sollicitudin erat viverra ac tincidunt nam. Velit aliquam imperdiet mollis nullam volutpat porttitor ullamcorper. Dui felis venenatis ultrices proin libero feugiat tristique. Cubilia curae hac habitasse platea dictumst lorem ipsum. Sem placerat in id cursus mi pretium tellus. Fringilla lacus nec metus bibendum egestas iaculis massa. Taciti sociosqu ad litora torquent per conubia nostra. Ridiculus mus donec rhoncus eros lobortis nulla molestie. Mauris pharetra vestibulum fusce dictum risus blandit quis. Finibus facilisis dapibus etiam interdum tortor ligula congue. Justo lectus commodo augue arcu dignissim velit aliquam. Primis vulputate ornare sagittis vehicula praesent dui felis. Senectus netus suscipit auctor curabitur facilisi cubilia curae. Quisque faucibus ex sapien vitae pellentesque sem placerat."
  },
  {
    "id": "_1c",
    "date": "2023-09-25",
    "imageURL": null,
    "audioURL": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "text": "test 23."
  }
];



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

  /*Future<void> fetchEntries() async {
    final Object? args = ModalRoute.of(context)?.settings.arguments;

    if(args is List<dynamic>) {
      setState(() {
        groupedData = MonthGroup.convertAPIList(args);
      });
    } else {
      setState(() => groupedData = []);
    }
  }*/

  Future<void> fetchEntries() async {
    final prefs = await SharedPreferences.getInstance();
    final String? loggedInUser = prefs.getString('username');

    final Object? args = ModalRoute.of(context)?.settings.arguments;
    List<dynamic> apiEntries = (args is List<dynamic>) ? args : [];

    if (apiEntries.isEmpty && loggedInUser == 'juli4nne') {
      setState(() {
        groupedData = MonthGroup.convertAPIList(sampleAPIResponse);
      });
    } else {
      setState(() {
        groupedData = MonthGroup.convertAPIList(apiEntries);
      });
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
                                child: groupedData.isEmpty
                                ? Center(child: RichText(text: TextSpan(text: "No entries yet", style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 21.sp, height: 1.4.h))))
                                : ListView.builder(
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
                          onTap: () async {
                            final prefs = await SharedPreferences.getInstance();
                            await prefs.clear();
                            if (!context.mounted) return;
                            Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
                            return;
                          } 
                        )
                      ),
                      SizedBox(width: 2.0.w),
                      Expanded(
                        child: Win95Button(
                          height: 60.h,
                          text: "+ New", 
                          onTap: () {
                            // create new entry, take entry information, open songpage with entry data
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
                            Navigator.pushNamed(context, '/AccountPage');
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