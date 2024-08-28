import { Command } from "#base";
import {
  ApplicationCommandType,
} from "discord.js";

import { log } from "#settings";
import { sendMeme } from "discord/responders/memeHandler/meme.js";

// Comando para enviar o meme
new Command({
  name: "meme",
  description: "Um comando para mandar memes engraçados 🤣",
  type: ApplicationCommandType.ChatInput,
  run(interaction) {
    try {
      sendMeme(interaction);
    } catch (e) {
      log.error("Failed to send simple menu", e);
    }
  },
});