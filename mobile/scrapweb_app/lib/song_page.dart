import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:audio_video_progress_bar/audio_video_progress_bar.dart';
import 'package:just_audio/just_audio.dart';
import 'package:rxdart/rxdart.dart';
import 'package:image_picker_plus/image_picker_plus.dart';
import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'win95_style.dart';
import 'home_page.dart';

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
  String? songText = "This is a test! If you can see this, you are testing! This time its REAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALY LONG. LIKE I NEED IT TO REACH THE BOTTOM OF THE PAGE SO HERES LOREM IPSUM ! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce justo arcu, sollicitudin vehicula lectus eu, ultricies ullamcorper nibh. Mauris facilisis sapien eget turpis laoreet rutrum. Donec pharetra varius fermentum. Fusce nec suscipit ipsum. Etiam condimentum ullamcorper quam vestibulum tincidunt. Phasellus pretium leo ut massa finibus accumsan. Morbi nec bibendum diam. Proin ultricies sodales feugiat. Morbi semper eu odio ultricies blandit. Donec nec sem et ipsum tristique eleifend non non orci. Donec sodales quam eget felis tristique, nec porta metus fringilla. In finibus maximus vulputate. Nam blandit cursus dignissim. Duis rutrum at nisi eu aliquam. Proin nisl turpis, rhoncus luctus eros aliquet, efficitur congue dolor. Donec rutrum, ipsum iaculis commodo dapibus, augue elit porttitor elit, vitae eleifend diam est vel quam. Nam fringilla sed sem non efficitur. Proin sed mi aliquet, semper metus a, accumsan diam.";
  String? songImage;
  String? audio;
  String date = "00/00/0000";
  late TextEditingController textController;
  final FocusNode focusNode = FocusNode();
  File? pickedImageFile;
  File? pickedAudioFile;
  
  final AudioPlayer player = AudioPlayer();
  Stream<DurationState>? durationState;

  Future<void> openImagePicker() async {
    ImagePickerPlus picker = ImagePickerPlus(context);

    SelectedImagesDetails? details = await picker.pickImage(
      source: ImageSource.both,
      galleryDisplaySettings: GalleryDisplaySettings(
        appTheme: AppTheme(
          focusColor: Color.fromARGB(255, 0, 128, 128),
          primaryColor: Color.fromARGB(255, 0, 128, 128),
        )
      )
    );

    if (details != null && details.selectedFiles.isNotEmpty) {
      setState(() {
        final selectedFile = details.selectedFiles.first;

        pickedImageFile = selectedFile.selectedFile;
        songImage = null;
      });
    }
  }

  Future<void> saveChanges() async {
    var request = http.MultipartRequest(
      'POST', 
      Uri.parse('https://your-api.com{widget.entry.id}')
    );

    request.fields['id'] = widget.entry.id;
    request.fields['date'] = widget.entry.dateString;
    request.fields['text'] = songText ?? "";

    if(pickedImageFile != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'imageURL',
        pickedImageFile!.path
      ));
    }

    if (pickedAudioFile != null) {
      request.files.add(await http.MultipartFile.fromPath('audio', pickedAudioFile!.path));
    } else {
      request.fields['audioURL'] = audio ?? "";
    }

    request.send();
  }

  Future<void> openAudioPicker() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.audio,
      allowMultiple: false,
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        pickedAudioFile = File(result.files.single.path!);
        audio = null; 
      });
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

  @override
  void initState() {
    super.initState();
    songText = widget.entry.text;
    songImage = widget.entry.imageURL;
    audio = widget.entry.audioURL;
    date = widget.entry.dateString;

    initDurationStream();
    setupAudio();
  }

  void handleTextToggle() async {
    if(editing) {
      setState(() {
        durationState = null;
        songText = textController.text;
        textController.dispose();
        editing = false;
      });

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
                        height: 38.h,
                        child: RichText(text: TextSpan(text: "  $date", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 255, 248, 249), fontWeight: FontWeight.w700, fontSize: 23.sp, height: 1.6.h)))
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
                                // TODO: Image Upload Prompt
                                print("Image upload prompt");
                                openImagePicker();
                              }
                            },
                            child: Container(
                              padding: EdgeInsets.symmetric(horizontal: 30.h, vertical: 10.w),
                              height: 300.h,
                              width: 350.w,
                              child: Image(
                                fit: BoxFit.contain,
                                image: songImage != null ? NetworkImage(songImage!) as ImageProvider : const AssetImage('images/placeholderSquare.png'),
                                errorBuilder: (context, error, stackTract) => Image.asset('images/placeholderSquare.png'),
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
                          height: editing ? 50.h : 30.h, 
                          child: Stack(
                            clipBehavior: Clip.none, 
                            children: [
                              Positioned(
                                top: editing ? 0 : -20.h, 
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
                                        //TODO: media upload prompt
                                        print("Media Upload Prompt.");
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
                                            : RichText(text: TextSpan(text: "$songText", style: TextStyle(fontFamily: 'W95', color: Color.fromARGB(255, 0, 0, 0), fontSize: 18.sp, height: 1.0.h)))
                                        )
                                      )
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
                              setState(() => editing = false);
                            } else {
                              Navigator.pop(context);
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
                            handleTextToggle();
                            print("Edit button pressed. editing: $editing");
                            return;
                          } 
                        )
                      )
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