import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'win95_style.dart';
import 'entry.dart';
import 'dart:convert';

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


class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}
class _HomePageState extends State<HomePage> {
  final ScrollController scrollController = ScrollController();
  bool loading = false;
  String mainPageErrorMessage = "";
  bool showMainPageError = false;
  bool makingAPICall = false;

  List<MonthGroup> groupedData = [];
  
  
  @override initState() {
    super.initState();
    fetchEntries();
  }

  Future<void> fetchEntries() async {
    loading = true;
    final prefs = await SharedPreferences.getInstance();
    final String? userToken = prefs.getString('jwt_token');

    final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
    final String port = dotenv.env['SERVER_PORT'] ?? '80';
    final url = Uri.http('$host:$port', '/api/media');

    try {
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $userToken'
        },
      );
      
      if(!mounted) return;
      final Map<String, dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
      if(response.statusCode == 200) {
        final apiEntries = data['media'];
        setState(() {
          groupedData = MonthGroup.convertAPIList(apiEntries);
        });
      }
    } catch (e) {
      print("Error: $e");
    }
    loading = false;
  }

  Future<void> createEntry() async {
    mainPageErrorMessage = "Loading...";
    setState(() {
      makingAPICall = true;
      showMainPageError = true;
    });
    final prefs = await SharedPreferences.getInstance();
    final String? userToken = prefs.getString('jwt_token');
    
    final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
    final String port = dotenv.env['SERVER_PORT'] ?? '80';
    final url = Uri.http('$host:$port', '/api/media');

    DateTime now = DateTime.now();
    DateTime date = DateTime(now.year, now.month, now.day);
    String dateString = "$date";
    print("$dateString");

    final map = <String, String>{};
    map['date'] = dateString;

    try {
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $userToken'
        },
        body: map
      );
      
      if(!mounted) return;

      if(response.statusCode == 201) {
        final Map<String, dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
        print("$data");
        Entry newEntry = Entry(id: data['mediaItem']['_id'], imageURL: "", audioURL: "", text: "", dateString: data['mediaItem']['date']);
        fetchEntries();
        Navigator.pushNamedAndRemoveUntil(
          context,
          '/SongPage',
          (route) => false,
          arguments: newEntry
        );
      } else {
        final Map<String, dynamic> errorData = jsonDecode(utf8.decode(response.bodyBytes));
        if (errorData['error'] != null) {
          print("${errorData['error']}");
          mainPageErrorMessage = "${errorData['error']}";
          setState(() => showMainPageError = true);
        }
      }
    } catch (e) {
      print("Error: $e");
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
                                ? Center(child: RichText(text: TextSpan(text: loading ? "Loading..." : "No entries yet", style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 21.sp, height: 1.4.h))))
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
                        ),
                        Visibility(
                          visible: showMainPageError,
                          child: Padding(
                            padding: EdgeInsetsGeometry.symmetric(horizontal: 8.w),
                            child: RichText(text: TextSpan(text: mainPageErrorMessage, style: TextStyle(fontFamily: 'W95', fontSize: 16.sp, color: makingAPICall? Colors.black : Colors.red)))
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
                            setState(() {
                              createEntry();
                              fetchEntries();
                            });
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
                            Navigator.pushNamedAndRemoveUntil(context, '/AccountPage', (route) => false,);
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