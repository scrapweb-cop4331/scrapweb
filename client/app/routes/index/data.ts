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

  const dateRE = /^\d{4}-\d{2}-\d{2}$/; //yyyy-mm-dd
  const hasValidFormat = dateRE.test(dto.date);
  
  let dateString = "";
  let timestamp = 0;
  let isInvalid = !hasValidFormat;

  if (hasValidFormat) {
    // Validate if it's a real date using Date object
    const parsedDate = Date.parse(dto.date);
    if (isNaN(parsedDate)) {
      isInvalid = true;
      console.error(`Date ${dto.date} is not a valid date for entry ${dto._id}`);
    } else {
      const [year, month, day] = dto.date.split("-");
      dateString = `${month}-${day}-${year}`;
      timestamp = Number(year + month + day);
    }
  } else {
    console.error(`Date ${dto.date} wasn't in iso 8061 for entry ${dto._id}`);
  }

  return {
    id: dto._id,
    imageURL: imgURL,
    audioURL: audioURL,
    timestamp: timestamp,
    date: dateString,
    isInvalid: isInvalid,
  };
}
