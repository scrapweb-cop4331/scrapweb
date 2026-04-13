import { test, expect } from "vitest";
import { mapMediaToEntry } from "./data";
import type { EntryItem, MediaDTO } from "./data";
export type TestSchema = {
  description: string;
  input: MediaDTO;
  output: EntryItem;
};
const testCases: Array<TestSchema> = [
  {
    description: "api only had a date",
    input: {
      _id: "69d96c20b8a590eed30b2b94",
      photo: "",
      audio: "",
      notes: "",
      date: "2026-04-10",
    },
    output: {
      id: "69d96c20b8a590eed30b2b94",
      imageURL: "/app/assets/logo-icon.png",
      audioURL: "/app/assets/500-milliseconds-of-silence.mp3",
      timestamp: 20260410,
      date: "04-10-2026",
      isInvalid: false,
    },
  },

  {
    description: "api had image",
    input: {
      _id: "69d98d38b8a590eed30b2ba6",
      photo: "/api/media/file/69d98d38b8a590eed30b2ba3",
      audio: "",
      notes: "",
      date: "2026-04-10",
    },
    output: {
      id: "69d98d38b8a590eed30b2ba6",
      imageURL: "http://137.184.93.240/api/media/file/69d98d38b8a590eed30b2ba3",
      audioURL: "/app/assets/500-milliseconds-of-silence.mp3",
      timestamp: 20260410,
      date: "04-10-2026",
      isInvalid: false,
    },
  },

  {
    description: "api had audio",
    input: {
      _id: "69da6d15b8a590eed30b2bbc",
      photo: "",
      audio: "/api/media/file/69da6d15b8a590eed30b2bba",
      notes: "",
      date: "2025-12-25",
    },
    output: {
      id: "69da6d15b8a590eed30b2bbc",
      imageURL: "/app/assets/logo-icon.png",
      audioURL: "http://137.184.93.240/api/media/file/69da6d15b8a590eed30b2bba",
      timestamp: 20251225,
      date: "12-25-2025",
      isInvalid: false,
    },
  },

  {
    description: "api had notes",
    input: {
      _id: "69da6ff2b8a590eed30b2bbe",
      photo: "",
      audio: "",
      notes: "This is a very special song that i want to remember forever.",
      date: "2025-12-25",
    },
    output: {
      id: "69da6ff2b8a590eed30b2bbe",
      imageURL: "/app/assets/logo-icon.png",
      audioURL: "/app/assets/500-milliseconds-of-silence.mp3",
      timestamp: 20251225,
      date: "12-25-2025",
      isInvalid: false,
    },
  },
  {
    description: "should invalidate if api returned malformed date",
    input: {
      _id: "69da6ff2b8a590eed30b2bbe",
      photo: "",
      audio: "",
      notes: "",
      date: "2025-12",
    },
    output: {
      id: "69da6ff2b8a590eed30b2bbe",
      imageURL: "/app/assets/logo-icon.png",
      audioURL: "/app/assets/500-milliseconds-of-silence.mp3",
      timestamp: 0,
      date: "",
      isInvalid: true,
    },
  },
];

for (const dummy of testCases) {
  test(dummy.description, () => {
    expect(mapMediaToEntry(dummy.input)).toEqual(dummy.output);
  });
}
