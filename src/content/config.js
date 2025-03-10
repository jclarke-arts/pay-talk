import { defineCollection } from 'astro:content';

const locations = defineCollection({
  type: 'content'
});

export const collections = {
  locations: locations,
};