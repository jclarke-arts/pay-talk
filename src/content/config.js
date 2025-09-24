import { defineCollection, z } from "astro:content";

const locations = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    coordinates: z.array(z.number()).length(2).optional(),
    number: z.string(),
    address: z.string().optional(),
    filters: z.array(z.string()).optional(),
  }),
});

export const collections = {
  locations: locations,
};
