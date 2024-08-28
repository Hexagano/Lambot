import { z } from "zod";

const envSchema = z.object({
  BOT_TOKEN: z.string({ description: "Discord Bot Token is required" }).min(1),
  WEBHOOK_LOGS_URL: z.string().url().optional(),
  EMBED_COLOR: z.string({ description: "Embed Color is required" }).min(1),
  MONGO_URI: z.string({ description: "MongoDb URI is required" }).min(1),
  MAIN_GUILD_ID: z.string({ description: "ID do servidor principal" }).min(1),

  SUB_REDDIT: z.string({ description: "Meme Subreddit is required" }).min(1),
  MEME_API_URI: z.string({ description: "Meme API URI is required" }).min(1),
  SPOTIFY_CLIENT: z.string({ description: "Spotify Client ID is required" }).min(1),
  SPOTIFY_SECRET: z.string({ description: "Spotify Secret ID is required" }).min(1),

  WEATHER_API: z.string({ description: "API do clima é requirida" }).min(1),
  WEATHER_KEY: z.string({ description: "Chave do clima é requirido" }).min(1),
  // Env vars...
});

type EnvSchema = z.infer<typeof envSchema>;

export { envSchema, type EnvSchema };
