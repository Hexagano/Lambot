import { Command } from "#base";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

new Command({
  name: "ping",
  description: "Replies with pong 🏓",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp || 0;
    const Embed = createEmbed({
      title: "Pong 🏓",
      color: "Orange",
      description: `Latency ${ping} ms | WebSocket ${
        interaction.client.ws.ping ?? 0
      } ms`,
    });

    interaction.editReply({ content: "", embeds: [Embed] });
  },
});
