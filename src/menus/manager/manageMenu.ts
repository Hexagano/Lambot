import { createEmbed, createEmbedAuthor, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, User } from "discord.js";
import { env } from "process";

// O menu em si de gerenciar os usuários
const simpleMenu = (user: User, target: User) => {
  const date: Date = new Date();
  const embed = createEmbed({
    title: "Menu para gerenciar usuários",
    author: createEmbedAuthor(user),
    footer: {
      text: "Admin: " + user.displayName + " | Alvo: " + target.displayName,
    },
    color: env.EMBED_COLOR,
    description:
      date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear(),
  });
  const row = createRow(
    new ButtonBuilder({
      customId: `manage/user/${target.id}/promptBanir`,
      label: "Banir",
      style: ButtonStyle.Danger,
    }),
    new ButtonBuilder({
      customId: `manage/user/${target.id}/promptKickar`,
      label: "Kickar",
      style: ButtonStyle.Danger,
    }),
    new ButtonBuilder({
      customId: `manage/user/${target.id}/desbanir`,
      label: "Desbanir",
      style: ButtonStyle.Danger,
    })
  );
  return { ephemeral, embeds: [embed], components: [row] };
}

export {simpleMenu}