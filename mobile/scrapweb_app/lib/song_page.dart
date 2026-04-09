import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:audio_video_progress_bar/audio_video_progress_bar.dart';
import 'package:just_audio/just_audio.dart';
import 'package:rxdart/rxdart.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'win95_style.dart';
import 'entry.dart';
import 'dart:convert';
import 'dart:io';

// Duration information for song playing
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

class SongPage extends StatefulWidget {
  final Entry entry;
  const SongPage({super.key, required this.entry});

  @override
  State<SongPage> createState() => _SongPageState();
}
class _SongPageState extends State<SongPage> {
  bool editing = false;
  bool playing = false;
  bool currentlyTyping = false;
  String? songText = "";
  String? songImage;
  String? audio;
  DateTime dateData = DateTime.now();
  late String date = "$dateData";
  late TextEditingController textController;
  final FocusNode focusNode = FocusNode();
  XFile? pickedImageFile;
  XFile? pickedAudioFile;

  bool makingAPICall = false;
  bool showSongPageError = false;
  String songPageErrorMessage = "";
  
  final AudioPlayer player = AudioPlayer();
  Stream<DurationState>? durationState;

  final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
  final String port = dotenv.env['SERVER_PORT'] ?? '80';

  Future<void> openImagePicker() async {
    setState(() {
      makingAPICall = false;
      showSongPageError = false;
    });
    ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null){
      int fileSize = await image.length();
      if(fileSize > 26214400) {
        songPageErrorMessage = "Max file size is 25MB";
        setState(() {
          makingAPICall = false;
          showSongPageError = true;
        });
      } else {
        setState(() {
          pickedImageFile = image;
          songImage = image.path;
        });
      }
    }
  }

  Future<void> openAudioPicker() async {
    setState(() {
      makingAPICall = false;
      showSongPageError = false;
    });
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowMultiple: false,
      allowedExtensions: ['mp3','wav']
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        pickedAudioFile = XFile(result.files.single.path!);
      });
      int fileSize = await pickedAudioFile!.length();
      if(fileSize > 26214400) {
        songPageErrorMessage = "Max file size is 25MB";
        setState(() {
          makingAPICall = false;
          showSongPageError = true;
        });
      } else {
        audio = result.files.single.path!; 
      }
    }
  }

  void initDurationStream() {
    durationState = Rx.combineLatest3<Duration, Duration, Duration?, DurationState>(
      player.positionStream,
      player.bufferedPositionStream,
      player.durationStream,
      (progress, buffered, total) => DurationState(
        progress: progress,
        buffered: buffered,
        total: total ?? Duration.zero,
      ),
    ).asBroadcastStream();
  }

  String formatPath(String? path) {
    if (path == null || path.isEmpty) return "";
    if (path.startsWith('http') || path.startsWith('/data/user') || path.startsWith('/Users/')) {
      return path;
    }
    return "http://$host:$port$path";
  }

  @override
  void initState() {
    super.initState();
    songText = widget.entry.text;
    date = widget.entry.dateString;

    songImage = formatPath(widget.entry.imageURL);
    print(songImage);
    audio = formatPath(widget.entry.audioURL);
    print(audio);
    
    initDurationStream();
    setupAudio();
  }

  Future<void> handleEditAPI() async {
    songPageErrorMessage = "Saving... Do not exit!";
    setState(() {
      makingAPICall = true;
      showSongPageError = true;
    });

    final prefs = await SharedPreferences.getInstance();
    final String? userToken = prefs.getString('jwt_token');

    final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
    final String port = dotenv.env['SERVER_PORT'] ?? '80';
    final url = Uri.http('$host:$port', '/api/media/${widget.entry.id}');

    try {
      final request = http.MultipartRequest('PATCH', url);
      request.headers['Authorization'] = 'Bearer $userToken';

      request.fields['notes'] = songText ?? "";
      request.fields['date'] = date;

      if (pickedImageFile != null) {
        request.files.add(
          await http.MultipartFile.fromPath('photo', pickedImageFile!.path)
        );
      }

      if (pickedAudioFile != null) {
        request.files.add(
          await http.MultipartFile.fromPath('audio', pickedAudioFile!.path)
        );
      }
      final streamedResponse = await request.send();
      if (!mounted) return;
      final response = await http.Response.fromStream(streamedResponse);
      print(response.toString());

      if (response.statusCode == 200) {
        setState(() {
          songPageErrorMessage = "Saved!";
        });
        await Future.delayed(const Duration(seconds: 3), (){});
        setState(() {
          makingAPICall = false;
          showSongPageError = false;
        });
      } else {
        final Map<String, dynamic> errorData = jsonDecode(utf8.decode(response.bodyBytes));
        setState(() {
          makingAPICall = false;
          showSongPageError = true;
          songPageErrorMessage = errorData['error'] ?? 'Could not save changes.';
        });
      }
    } catch (e) {
      if (!mounted) return;
      print(e);
      setState(() {
        makingAPICall = false;
        showSongPageError = true;
        songPageErrorMessage = "Could not connect to server. Try again.";
      });
    }
  }

  void handleTextToggle() async {
    if(editing) {
      setState(() {
        durationState = null;
        songText = textController.text;
        textController.dispose();
        editing = false;
      });
      await handleEditAPI();
      await setupAudio();

      setState((){
        initDurationStream();
      });
    } else {
      textController = TextEditingController(text: songText);
      setState(() => editing = true);
    }
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

  Future<void> handleDelete() async {
    final bool? confirmed = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          backgroundColor: Color.fromARGB(255, 195, 199, 203),
          shape: Border(
            top:    BorderSide(color: Colors.white, width: 2),
            left:   BorderSide(color: Colors.white, width: 2),
            bottom: BorderSide(color: Colors.black, width: 2),
            right:  BorderSide(color: Colors.black, width: 2),
          ),
          titlePadding: EdgeInsets.zero,
          title: Container(
            color: Color.fromARGB(255, 2, 21, 119),
            width: double.infinity,
            height: 35.h,
            padding: EdgeInsets.only(left: 8.w),
            child: RichText(text: TextSpan(text: "Confirm Delete", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 18.sp, height: 1.6.h))),
          ),
          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
          content: RichText(text: TextSpan(text: "Are you sure you want to delete this entry?\nThis action cannot be undone.", style: TextStyle(fontFamily: 'W95', color: Colors.black, fontSize: 15.sp, height: 1.5.h))),
          actionsPadding: EdgeInsets.fromLTRB(8.w, 0, 8.w, 10.h),
          actions: [
            Row(
              children: [
                Expanded(
                  child: Win95Button(
                    height: 45.h,
                    text: "Cancel",
                    onTap: () => Navigator.of(dialogContext).pop(false),
                  ),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: Win95Button(
                    height: 45.h,
                    text: "Delete",
                    onTap: () => Navigator.of(dialogContext).pop(true),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      final prefs = await SharedPreferences.getInstance();
      final String? userToken = prefs.getString('jwt_token');

      final String host = dotenv.env['SERVER_HOST'] ?? '127.0.0.1';
      final String port = dotenv.env['SERVER_PORT'] ?? '80';
      final url = Uri.http('$host:$port', '/api/media/${widget.entry.id}');

      try {
        final response = await http.delete(
          url,
          headers: {
            'Authorization' : 'Bearer $userToken'
          }
        );
        if (!mounted) return;

        if (response.statusCode == 200) {
          Navigator.of(context).pushNamedAndRemoveUntil('/HomePage', (route) => false);
        } else {
          final Map<String, dynamic> errorData = jsonDecode(utf8.decode(response.bodyBytes));
          setState(() {
            makingAPICall = false;
            showSongPageError = true;
            songPageErrorMessage = errorData['error'] ?? 'Could not delete entry.';
          });
        }
      } catch (e) {
        if (!mounted) return;
        setState(() {
          makingAPICall = false;
          showSongPageError = true;
          songPageErrorMessage = "Could not connect to server. Try again.";
        });
      }
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
                      GestureDetector(
                        onTap:() async {
                          if(editing) {
                            DateTime? pickedDate = await showDatePicker(
                              context: context,
                              initialDate: dateData, 
                              firstDate: DateTime(1970, 1, 1), 
                              lastDate: DateTime.now(),  
                            );
                            if (pickedDate != null) {
                              setState(() {
                                dateData = pickedDate;
                                date = "${pickedDate.year}-${pickedDate.month.toString().padLeft(2, '0')}-${pickedDate.day.toString().padLeft(2, '0')}";
                              });
                            }
                          }
                        },
                        child: Container(
                          color: Color.fromARGB(255, 2, 21, 119),
                          width: double.infinity,
                          height: 38.h,
                          child: Row(
                            children: [
                              RichText(text: TextSpan(text: "  $date", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 23.sp, height: 1.6.h))),
                              SizedBox(width: 5.w,),
                              Visibility(
                                visible: editing,
                                child: Image(image: AssetImage("./images/dateEdit.png"), height: 14.h)
                              )
                            ]
                          )
                        )
                      ),
                      Visibility(visible: currentlyTyping, child: SizedBox(height: 10.h)),
                      Visibility(
                        visible: currentlyTyping,
                        child: Row(
                          children: [
                            SizedBox(width: 10.w),
                            Win95Button(
                              text: "< Back to Edit Page", 
                              height: 50.h,
                              width: 150.w,
                              onTap: () {}
                            )
                          ]
                        )
                      ),
                      Visibility(
                        visible: !currentlyTyping,
                        maintainState: true,
                        child: Center(
                          child: GestureDetector( 
                            onTap: () {
                              if(editing) {
                                openImagePicker();
                              }
                            },
                            child: Container(
                              padding: EdgeInsets.symmetric(horizontal: 30.h, vertical: 10.w),
                              height: 300.h,
                              width: 350.w,
                              child: editing
                              ? Image(image: AssetImage("./images/uploadImage.png"),)
                              : FadeInImage(
                                placeholder: AssetImage("./images/loading.png"),
                                fit: BoxFit.contain,
                                image: (songImage != null && songImage!.isNotEmpty)
                                  ? (songImage!.startsWith('http') 
                                      ? NetworkImage(songImage!)
                                      : FileImage(File(songImage!)) as ImageProvider)
                                  : const AssetImage('images/placeholderSquare.png'),
                              )

                            ),
                          )
                        )
                      ),
                      Visibility(
                        visible: !editing,
                        maintainState: true,
                        child: Center(
                          child: Container(
                            margin: EdgeInsets.symmetric(horizontal: 40.w),
                            child: StreamBuilder<DurationState>(
                              stream: durationState,
                              builder: (context, snapshot) {
                                if (durationState == null || !snapshot.hasData) {
                                  return ProgressBar(progress: Duration.zero, total: Duration.zero,);
                                }
                                final stateData = snapshot.data;
                                final progress = stateData!.progress;
                                //final buffered = stateData?.buffered ?? Duration.zero;
                                final total = stateData.total;

                                return ProgressBar(
                                  progress: progress,
                                  total: total,
                                  thumbGlowColor: Colors.transparent,
                                  thumbGlowRadius: 0.0,
                                  timeLabelLocation: TimeLabelLocation.sides,
                                  onSeek: (duration) {
                                    player.seek(duration);
                                    print("User seek to $duration");
                                  }
                                );
                              }
                            )
                          )
                        )
                      ),
                      Visibility(
                        visible: !currentlyTyping,
                        maintainState: true,
                        child: SizedBox(
                          height: editing ? 50.h : 55.h, 
                          child: Stack(
                            clipBehavior: Clip.none, 
                            children: [
                              Positioned(
                                top: editing ? 0 : 7.h, 
                                left: 0,
                                right: 0,
                                child: Center(
                                  child: Win95Button(
                                    height: 50.h,
                                    width: 50.w,
                                    iconSize: editing ? 25.h : 17.h,
                                    icon: editing ? 'images/uploadMusic.png' : (playing ? 'images/pause.png' : 'images/play.png'),
                                    text: "",
                                    onTap: () {
                                      if(!editing){
                                        if(audio == null || audio!.isEmpty) return;
                                        if(playing) {
                                          player.pause();
                                        } else {
                                          player.play();
                                        }
                                        setState(() {
                                          playing = !playing;
                                        });
                                      } else {
                                        openAudioPicker();
                                      }
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      ),
                      SizedBox(height: 10.h),
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
                              color: editing ? Colors.white : Color.fromARGB(255, 195, 199, 203),
                              child: RawScrollbar(
                                thumbVisibility: true,
                                trackVisibility: true,
                                thickness: 16.w,
                                thumbColor: Color.fromARGB(255, 195, 199, 203),
                                trackColor: Color.fromARGB(255, 224, 224, 224),
                                trackBorderColor: const Color.fromARGB(255, 0, 0, 0),
                                mainAxisMargin: 0,
                                padding: EdgeInsets.zero,
                                shape: Win95BackupOutline(),
                                child: ScrollConfiguration(
                                  behavior: ScrollConfiguration.of(context).copyWith(overscroll: false), 
                                  child: GestureDetector(
                                    behavior: HitTestBehavior.opaque,
                                    onTap: () {
                                      if(editing) {
                                        focusNode.requestFocus();
                                        textController.selection = TextSelection.fromPosition(
                                          TextPosition(offset: textController.text.length),
                                        );
                                        setState(() => currentlyTyping = true);
                                      }
                                    },
                                    child: SingleChildScrollView(
                                      physics: const ClampingScrollPhysics(),
                                      child: Container(
                                        width: double.infinity,
                                        child: Padding(
                                          padding: EdgeInsets.only(right: 20), 
                                          child: editing
                                            ? TextField(
                                              focusNode: focusNode,
                                              controller: textController,
                                              maxLines: null,
                                              style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 0, 0, 0), fontSize: 18.sp, height: 1.0.h),
                                              decoration: InputDecoration(
                                                border: InputBorder.none,
                                                isDense: true,
                                                contentPadding: EdgeInsets.zero
                                              ),
                                              onTap: () {
                                                setState(() {
                                                  currentlyTyping = true;
                                                });
                                              },
                                              onTapOutside: (_) {
                                                setState(() {
                                                  currentlyTyping = false;
                                                });
                                                FocusScope.of(context).unfocus();
                                              }
                                            )
                                            : RichText(text: TextSpan(text: (songText == null) ? "" : "$songText", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 0, 0, 0), fontSize: 18.sp, height: 1.0.h)))
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      ),
                      Visibility(
                        visible: showSongPageError,
                        child: Padding(
                          padding: EdgeInsetsGeometry.symmetric(horizontal: 8.w),
                          child: Center(child: RichText(text: TextSpan(text: songPageErrorMessage, style: TextStyle(fontFamily: 'W95', fontSize: 22.sp, color: makingAPICall ? Colors.black : Colors.red))))
                        ),
                      )
                    ],
                  )
                )
              )
            ),
            Visibility(
              visible: !currentlyTyping,
              maintainState: true,
              child:SizedBox(
                height: 70.h,
                child: Win95Window(
                  child: Row(
                    children: [
                      Expanded(
                        child: Win95Button(
                          height: 60.h,
                          text: editing ? "< Discard" : "< Back", 
                          onTap: () {
                            if(editing) {
                              setState((){
                                editing = false;
                                showSongPageError = false;
                                pickedImageFile = null;
                                pickedAudioFile = null;
                                songText = widget.entry.text;
                                songImage = formatPath(widget.entry.imageURL);
                                audio = formatPath(widget.entry.audioURL);
                                dateData = DateTime.parse(widget.entry.dateString);
                                date = widget.entry.dateString;
                              });
                              setupAudio();
                            } else {
                              Navigator.pushNamedAndRemoveUntil(context, '/HomePage', (route) => false);
                            }
                            print("Back button pressed. editing: $editing");
                            return;
                          } 
                        )
                      ),
                      SizedBox(width: 2.0.w),
                      Expanded(
                        child: Win95Button(
                          height: 60.h,
                          icon: editing ? 'images/save.png' : 'images/edit.png',
                          text: editing ? " Save" : "Edit", 
                          onTap: () {
                            setState(() => showSongPageError = false);
                            handleTextToggle();
                            print("Edit button pressed. editing: $editing");
                            return;
                          } 
                        )
                      ),
                      SizedBox(width: 2.0.w),
                      Expanded(
                        child: Win95Button(
                          height: 60.h,
                          text: "Delete",
                          icon: 'images/x.png',
                          onTap: () {
                            setState(() => showSongPageError = false);
                            handleDelete();
                            return;
                          }
                        )
                      ),
                    ],
                  )      
                )
              )
            )
          ]
        )
      )
    );
  }
}