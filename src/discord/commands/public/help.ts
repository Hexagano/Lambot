import { Command } from "#base";
import {
  ApplicationCommandType,
} from "discord.js";

import { log } from "#settings";
import { res } from "#functions";

// Comando para enviar o meme
new Command({
  name: "ajuda",
  description: "Um comando para obter ajuda relacionado aos outros comandos.",
  type: ApplicationCommandType.ChatInput,
  options: [],
  async run(interaction) {
    try {
      await interaction.reply(res.success("Cooming soon!"));
    } catch (e) {
      log.error("Failed to send simple menu", e);
    }
  },
});
