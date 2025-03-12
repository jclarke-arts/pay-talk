import { defineCollection, z } from "astro:content";

const locations = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    coordinates: z.array(z.number()).length(2),
    image: z.string().optional(),
    caption: z.string().optional(),
    audioFile: z.string().optional(),
    audioTitle: z.string().optional(),
    filters: z.array(z.string()).optional(),
  }),
});

export const collections = {
  locations: locations,
};
