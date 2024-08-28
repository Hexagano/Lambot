import { bootstrapApp } from "#base";
import { db } from "#database";
import { env } from "process";
import { settings } from "#settings";
import { Logger } from "utils/coolutils.js";

import { SpotifyPlugin } from "rainlink-spotify";
import { DeezerPlugin } from "rainlink-deezer";

import { Rainlink, Library } from "rainlink";

import { ActivityType, TextBasedChannel, VoiceBasedChannel } from "discord.js";
import { modifyActivity } from "utils/activityModifier.js";

const {
  MAIN_GUILD_ID,
} = process.env || env;

await bootstrapApp({
  workdir: import.meta.dirname,
  commands: {
    guilds: [MAIN_GUILD_ID as string],
  },
  async beforeLoad(client) {
    // Player Nodes
    const RainNodes = [
      {
        name: settings.LAVA_NAME || "Main",
        host: settings.LAVA_HOST || "localhost",
        port: settings.LAVA_PORT || 2333,
        auth: settings.LAVA_PASS || "335serin__35gos9o3ç)",
        secure: settings.LAVA_SECURE || false,
      },
    ];
    ///////////////////////////////////////////////////////////

    const rainlink = new Rainlink({
      library: new Library.DiscordJS(client),
      nodes: RainNodes,
      plugins: [
        new SpotifyPlugin({
          clientId: env.SPOTIFY_CLIENT,
          clientSecret: env.SPOTIFY_SECRET,
          playlistPageLimit: 1,
          albumPageLimit: 1,
          searchLimit: 20,
          searchMarket: "PT",
        }),
        new DeezerPlugin(),
      ],
    });

    // Rainlink Player
    client.rainlink = rainlink;
    client.rainlink.on("trackEnd", (plr) => {
      const textId = plr?.textId;
      const voiceId = plr?.voiceId;
      if (textId || voiceId) return;

      const textChannel = client.channels.cache.get(textId) as TextBasedChannel;
      const voiceChannel = client.channels.cache.get(
        voiceId as string
      ) as VoiceBasedChannel;
      if (!textChannel) return;
      if (!voiceChannel) return;

      modifyActivity(
        client,
        ActivityType.Watching,
        null,
        `${settings?.defaultActivity || ""}`
      );
    });
    client.rainlink.on("nodeConnect", (node) => {
      Logger.info!(
        "R A I N | L I N K { Node connected } => " + node.options.host
      );
    });
    client.rainlink.on("nodeDisconnect", (node, reason) => {
      Logger.info!(
        "R A I N | L I N K { Node disconnected } => " +
          node.options.host +
          " | because: " +
          reason
      );
    });

    const mainGuildData = await db.guilds.get(MAIN_GUILD_ID);
    Object.assign(client, { mainGuildData, rainlink });
  },
  async whenReady(client) {
    Logger.info!(
      client.user?.username ?? "Annoymous bot" + " has been loaded!"
    );
  },
});
