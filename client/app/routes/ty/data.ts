import { dateData } from "@react95/icons";

// import "/app/assets/logo_worded.png";
export type MediaDTO ={
  _id: string;
  audio: string | null;
  photo: string | null;
  notes: string;
  date: string;
}

export type EntryItem = {
  id: string;
  imageURL: string;
  audioURL: string;
  timestamp: number;
  date: string;
  isInvalid: boolean; // Errors should be hidden, so if this is true then remove this entry from the list before rendering
}


export function mapMediaToEntry(dto: MediaDTO): EntryItem {

  const base = "http://137.184.93.240";

  let imgURL = "/app/assets/logo_worded.jpg";

  if (dto.photo) {
    if (URL.parse(base + dto.photo)) {
      imgURL = base + dto.photo;
    }
  }

  let audioURL = "/app/assets/500-milliseconds-of-silence.mp3";

  if (dto.audio) {
    if (URL.parse(base + dto.audio)) {
      audioURL = base+  dto.audio;
    }
  }

  let isValidDate = 0;
  const dateRE = /^\d{4}-\d{2}-\d{2}$/; //yyyy-mm-dd
  if (!dateRE.test(dto.date)) {
    console.log(dateRE.test(dto.date));
    isValidDate = 0;
  } else {
    // Now we validate that it is a plausible date
    isValidDate = Date.parse(dto.date); // todo this will break if they have an entry for 1970-1-1
  }

  let dateString = "";
  let msSince1970 = 0;
  if (!isValidDate) {
    console.error(`Date ${dto.date} wasn't in iso 8061 for entry ${dto._id}`);
  } else {
    const date = new Date(dto.date);
    dateString = date
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    msSince1970 = isValidDate;
  }



  return {
    id: dto._id,
    imageURL: imgURL,
    audioURL: audioURL,
    timestamp: msSince1970,
    date: dateString,
    isInvalid: !isValidDate,
  };
}
