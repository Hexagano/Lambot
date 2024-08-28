import { Command } from "#base";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

import { log } from "#settings";
import { sendWeather } from "discord/responders/weatherHandler/weather.js";
import { res } from "#functions";

// Comando para enviar o meme
new Command({
  name: "clima",
  description: "Um comando para mandar a previsão do clima ⛅",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "cidade",
      type: ApplicationCommandOptionType.String,
      description: "Nome da cidade",
      required: true,
    },
  ],
  async run(interaction) {
    try {
      const cidade = interaction.options.getString("cidade", true);
      await interaction.editReply(res.warning("Pesquisando..."));
      sendWeather(interaction, cidade);
    } catch (e) {
      log.error("Failed to send simple menu", e);
    }
  },
});
