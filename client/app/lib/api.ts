import placeholder from "~/assets/logo-icon.png";
import { auth } from "./auth";
import type { User } from "~/routes/login/utils/data";

type MediaDTO = {
  _id: string;
  audio: string | null;
  photo: string | null;
  notes: string;
  date: string;
};

export type EntryItem = {
  id: string;
  imageURL: string;
  audioURL: string;
  timestamp: number;
  date: string;
  note: string;
  isInvalid: boolean; // Errors should be hidden, so if this is true then remove this entry from the list before rendering
};

export async function getEntries() {
  const user = auth.loadUser();
  const token = user?.token;

  try {
    const response = await fetch("https://scrapweb.kite-keeper.com/api/media", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch media data");
      return [];
    }

    const data = await response.json();
    const results: MediaDTO[] = data.media || [];
    return results.map((e) => {
      const res = mapMediaToEntry(e);
      return res;
    });
  } catch (error) {
    console.error("Error loading media:", error);
    return [];
  }
}
export async function forgotPassword(email: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://scrapweb.kite-keeper.com/api/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    if (!response.ok) {
      console.error("Failed to send password reset email");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
export function mapMediaToEntry(dto: MediaDTO): EntryItem {
  const base = "https://scrapweb.kite-keeper.com";

  let imgURL = placeholder;

  if (dto.photo) {
    if (URL.parse(base + dto.photo)) {
      imgURL = base + dto.photo;
    }
  }

  let audioURL = "/app/assets/500-milliseconds-of-silence.mp3";

  if (dto.audio) {
    if (URL.parse(base + dto.audio)) {
      audioURL = base + dto.audio;
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
      console.error(
        `Date ${dto.date} is not a valid date for entry ${dto._id}`,
      );
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
    note: dto.notes ? dto.notes : "",
  };
}

export async function newEntry() {
  const user = auth.loadUser();
  const token = user?.token;

  const req = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await fetch(
      "https://scrapweb.kite-keeper.com/api/media",
      req,
    );
    if (!response.ok) {
      console.error("Failed to add empty entry");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error adding empty entry:", error);
    return false;
  }
}

export async function updateUser(
  id: string,
  firstname: string | null = null,
  lastname: string | null = null,
  username: string | null = null,
  email: string | null = null,
) {
  const user = auth.loadUser();
  const token = user?.token;

  const body: Record<string, string> = {};
  if (firstname) body.first_name = firstname;
  if (lastname) body.last_name = lastname;
  if (username) body.username = username;
  if (email) body.email = email;

  try {
    const response = await fetch(
      `https://scrapweb.kite-keeper.com/api/users/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      console.error("Failed to update user");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
}