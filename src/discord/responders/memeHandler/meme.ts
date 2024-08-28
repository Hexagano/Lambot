import { Cooldown, Responder, ResponderType, Store } from "#base";
import { createEmbed, createRow } from "@magicyan/discord";
import {
  ButtonBuilder,
  ButtonStyle,
  time,
  ChatInputCommandInteraction,
  ButtonInteraction,
  MessageComponentInteraction,
} from "discord.js";
import { env } from "process";
import { log } from "#settings";

import fetch from "node-fetch";
import { icon } from "functions/utils/emojis.js";

const cooldowns = new Store<Date>();

interface MemeTypes {
  postLink: string;
  subreddit: string;
  title: string;
  author: string;
  ups: string;
  url: string;
}
const sendMeme = async (
  interaction:
    | MessageComponentInteraction<"cached">
    | ChatInputCommandInteraction<"cached">
    | ButtonInteraction<"cached">
) => {
  if (interaction == null) return log.log("something unexpected was happen :/");

  await interaction.deferReply({fetchReply, ephemeral}); // Definir uma reply

  // A parte do cooldown
  const inCooldown = cooldowns.get(interaction.user.id);

  if (inCooldown && inCooldown > new Date()) {
    interaction.editReply({
      content: `Você precisa esperar ${time(
        inCooldown,
        "R"
      )} para usar usar este comando novamente.`,
    });
    return;
  } else {
    fetch(
      `${env.MEME_API_URI + encodeURIComponent(env.SUB_REDDIT || "meme")}` ||
        "error"
    )
      .then(async (r) => {
        const memeData = (await r.json()) as MemeTypes;
        const image =
          memeData.url ?? "https://ik.imagekit.io/9k3mcoolader/image.png";
        const title = memeData.title ?? "Unknown";
        const author = memeData.author ?? "Unknown";
        const ups = memeData.ups ?? "Unknown";

        var isAlreadySended: boolean = false;

        // E esta é a antiga row
        const row = createRow(
          new ButtonBuilder({
            customId: "meme/generate",
            label: "Gerar",
            style: ButtonStyle.Success,
          })
        );
  
        const embed = createEmbed({
          title: `${title}`,
          image: `${image}`,
          footer: { text: `${author}, 👍 ${ups}` },
          color: env.EMBED_COLOR,
        });
        const alreadySendEmbed = createEmbed({
          title: `${title}`,
          image: `${image}`,
          description: `${icon.amogusspin} Gerado por + ${
            interaction.user.displayName ?? "_ER$RO"
          }`,
          footer: { text: `${author}, 👍 ${ups}` },
          color: env.EMBED_COLOR,
        });
        interaction.editReply({
          embeds: [!isAlreadySended ? embed : alreadySendEmbed],
          components: [row]
        }).then(() => {
          isAlreadySended = true;
          log.log("[MEME] " + interaction.user.username + " ja mandou este meme.");
        });
      })
      .catch((err) => {
        interaction.editReply({content: "Falha ao mandar o menu: " + err });
      });
  }

  const c = new Cooldown();
  const now = Date.now();
  if(inCooldown && inCooldown.getTime() > now){
    interaction.editReply({content: `O Cooldown foi expirado, agora você pode continuar com os comandos ${icon.whitethingtwerking}`});
  }else{
    c.add(10, "seconds");
    cooldowns.set(interaction.member.id, c.expiresAt, {time: 6000});
  }
};

// Handler para o menu de meme
new Responder({
  customId: "meme/:action",
  type: ResponderType.Button,
  cache: "cached",
  run(interaction, { action }) {
    switch (action) {
      case "generate":
        sendMeme(interaction);
        break;
      default:
        interaction.reply("Interação invalida :/");
        break;
    }
  },
});


export {sendMeme};