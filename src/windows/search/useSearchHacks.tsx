import { ResponseType, getClient } from "@tauri-apps/api/http";
import { useCallback, useState } from "react";
import { z } from "zod";

export const difficulties = [
  { label: "Standard: Easy", code: 104, short: "easy", gameType: "smw" },
  { label: "Standard: Normal", code: 105, short: "normal", gameType: "smw" },
  { label: "Standard: Hard", code: 106, short: "hard", gameType: "smw" },
  {
    label: "Standard: Very Hard",
    code: 141,
    short: "very_hard",
    gameType: "smw",
  },
  {
    label: "Kaizo: Beginner",
    code: 196,
    short: "kaizo_beginner",
    gameType: "smw",
  },
  {
    label: "Kaizo: Intermediate",
    code: 107,
    short: "kaizo_light",
    gameType: "smw",
  },
  {
    label: "Kaizo: Expert",
    code: 197,
    short: "kaizo_expoert",
    gameType: "smw",
  },
  {
    label: "Tool Assisted: Kaizo",
    code: 124,
    short: "kaizo_hard",
    gameType: "smw",
  },
  { label: "Tool Assisted: Pit", code: 125, short: "pit", gameType: "smw" },
  { label: "Misc.: Troll", code: 161, short: "troll", gameType: "smw" },
  {
    label: "Easy",
    code: 204,
    short: "easy",
    gameType: "sm64",
  },
  {
    label: "Intermediate",
    code: 205,
    short: "intermediate",
    gameType: "sm64",
  },
  {
    label: "Hard",
    code: 206,
    short: "easy",
    gameType: "sm64",
  },
  {
    label: "Kaizo",
    code: 207,
    short: "kaizo",
    gameType: "sm64",
  },
] as const;

export type Difficulty = (typeof difficulties)[number]["label"];

export type DifficultyMap = { [D in Difficulty]?: boolean | undefined };

export const HackSchema = z.object({
  authors: z.array(z.string()),
  date: z.union([z.date(), z.undefined()]),
  downloadUrl: z.string().transform((value) => `https:${value}`),
  downloads: z.union([z.number(), z.undefined()]),
  length: z.union([z.string(), z.undefined()]),
  name: z.string().transform((value) => value.replace(/&amp;/g, "&")),
  rating: z.union([z.number(), z.undefined()]),
  type: z.union([z.string(), z.undefined()]),
});

export type Hack = z.infer<typeof HackSchema>;

export type SearchArgs = {
  author: string;
  description: string;
  game: "smwhacks" | "yihacks" | "sm64hacks";
  isDifficultySelected: DifficultyMap;
  name: string;
  cookie?: string;
};

export type SearchResults =
  | { hacks: Hack[]; hasMore: boolean; showType: boolean }
  | string
  | undefined;

const SuperMarioWorldResponseSchema = z
  .object({
    current_page: z.number(),
    last_page: z.number(),
    data: z.array(
      z
        .object({
          authors: z.array(
            z.object({ name: z.string() }).transform((value) => value.name)
          ),
          download_url: z.string(),
          downloads: z.number(),
          name: z.string(),
          rating: z.number(),
          fields: z.object({
            difficulty: z.string(),
            length: z.string(),
          }),
        })
        .transform((value) => ({
          authors: value.authors,
          date: undefined,
          downloadUrl: value.download_url,
          downloads: value.downloads,
          length: value.fields.length,
          name: value.name,
          rating: value.rating,
          type: value.fields.difficulty,
        }))
    ),
  })
  .transform((value) => ({
    hacks: value.data,
    hasMore: value.current_page < value.last_page,
    showType: true,
  }));

const YoshiIslandResponseSchema = z
  .object({
    current_page: z.number(),
    last_page: z.number(),
    data: z.array(
      z
        .object({
          authors: z.array(
            z.object({ name: z.string() }).transform((value) => value.name)
          ),
          download_url: z.string(),
          downloads: z.number(),
          name: z.string(),
          rating: z.number(),
          fields: z.object({
            length: z.string(),
          }),
        })
        .transform((value) => ({
          authors: value.authors,
          date: undefined,
          downloadUrl: value.download_url,
          downloads: value.downloads,
          length: value.fields.length,
          name: value.name,
          rating: value.rating,
          type: "",
        }))
    ),
  })
  .transform((value) => ({
    hacks: value.data,
    hasMore: value.current_page < value.last_page,
    showType: false,
  }));

const SuperMario64ResponseSchema = z
  .object({
    current_page: z.number(),
    last_page: z.number(),
    data: z.array(
      z
        .object({
          authors: z.array(
            z.object({ name: z.string() }).transform((value) => value.name)
          ),
          download_url: z.string(),
          downloads: z.number(),
          name: z.string(),
          fields: z.object({
            difficulty: z.string(),
            length: z.string(),
          }),
        })
        .transform((value) => ({
          authors: value.authors,
          date: undefined,
          downloadUrl: value.download_url,
          downloads: value.downloads,
          name: value.name,
          type: value.fields.difficulty,
          length: value.fields.length,
        }))
    ),
  })
  .transform((value) => ({
    hacks: value.data,
    hasMore: value.current_page < value.last_page,
    showType: true,
  }));

const useSearchHacks = (): [
  (args: SearchArgs) => void,
  boolean,
  SearchResults
] => {
  const [results, setResults] = useState<SearchResults>();
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(
    async ({
      author,
      description,
      game,
      isDifficultySelected,
      name,
      cookie,
    }: SearchArgs) => {
      if (isSearching) return;

      setIsSearching(true);

      const url = new URL("https://www.smwcentral.net/ajax.php");

      url.searchParams.set("a", "getsectionlist");
      url.searchParams.set("p", "section");
      url.searchParams.set("s", game); // Game (smwhacks, yihacks)
      url.searchParams.set("u", "0"); // Unknown
      url.searchParams.set("g", "0"); // Gallery (0 = no, 1 = yes)
      url.searchParams.set("n", "1"); // Page (starts from 1)
      url.searchParams.set("o", "date"); // Order field (date, name, featured, length, rating, filesize, downloads)
      url.searchParams.set("d", "desc"); // Order type (asc, desc)

      if (name) url.searchParams.set("f[name]", name); // Name
      if (author) url.searchParams.set("f[author]", author); // Author
      if (description) url.searchParams.set("f[description]", description); // Description

      if (game === "smwhacks" || game === "sm64hacks")
        for (const difficulty of difficulties)
          if (isDifficultySelected[difficulty.label])
            url.searchParams.append("f[difficulty][]", difficulty.short);

      try {
        // Send request.
        const client = await getClient();
        const responseType = ResponseType.Text;
        console.log(url.toString());
        const { data } = await client.get(url.toString(), {
          responseType,
          ...(cookie && { headers: { Cookie: cookie } }),
        });

        // Parse response to find the hacks table.
        if (typeof data !== "string") throw new Error("Data is not a string");
        switch (game) {
          case "smwhacks":
            setResults(SuperMarioWorldResponseSchema.parse(JSON.parse(data)));
            break;
          case "yihacks":
            setResults(YoshiIslandResponseSchema.parse(JSON.parse(data)));
            break;
          case "sm64hacks":
            setResults(SuperMario64ResponseSchema.parse(JSON.parse(data)));
            break;
          default:
            console.error("Invalid game type");
            break;
        }
      } catch (e) {
        setResults("An error occurred");
        console.log(e);
      } finally {
        setIsSearching(false);
      }
    },
    [isSearching]
  );

  return [search, isSearching, results];
};

export default useSearchHacks;
