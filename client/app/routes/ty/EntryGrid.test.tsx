import { test, expect, vi } from "vitest";
import { EntryGrid } from "./EntryGrid";
import { useLoaderData } from "react-router";
import { mapMediaToEntry, type MediaDTO } from "./data";
import response from "./response.json";
import EntryButton from "./EntryButton";
import { renderToString } from "react-dom/server";



const responseWithData = {
  media: [
    {
      _id: "69d98d38b8a590eed30b2ba6",
      photo: "/api/media/file/69d98d38b8a590eed30b2ba3",
      audio: "",
      notes: "",
      date: "2026-04-10",
    },
    {
      _id: "69da6d15b8a590eed30b2bbc",
      photo: "",
      audio: "/api/media/file/69da6d15b8a590eed30b2bba",
      notes: "",
      date: "2025-12-25",
    },
    {
      _id: "69da6fbeb8a590eed30b2bbd",
      photo: "",
      audio: "",
      notes: "",
      date: "2025-12-25",
    },
    {
      _id: "69da6ff2b8a590eed30b2bbe",
      photo: "",
      audio: "",
      notes: "This is a very special song that i want to remember forever.",
      date: "2025-12-25",
    },
  ],
};

const responseWithNoEntries = {
  media: []
}

vi.mock("react-router", () => ({
  useLoaderData: vi.fn(),
}));

vi.mock("./EntryButton", () => ({
  default: ({ date, imageURL }: any) => (
    <div>
      <img src={imageURL}/>
      <span>{date}</span>
    </div>
  ),
}));

test("matches a snapshot", () => {
});



test("Integration: api returns values", async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
  });
  global.fetch = mockFetch;

  const mappedData = response.media.map(mapMediaToEntry);
  vi.mocked(useLoaderData).mockReturnValue(mappedData);

  expect(EntryGrid({ selectedId: null, onSelect: () => {} })).toMatchSnapshot();
});
