import { icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, VoiceBasedChannel } from "discord.js";
import { RainlinkTrack } from "rainlink";
import { msToHour } from "utils/duration.js";

export function musicAnnouncementMenu(
  track: RainlinkTrack,
  voiceChannel: VoiceBasedChannel
) {
  const { title, uri, author, duration, artworkUrl } = track;
  const row = createRow(
    new ButtonBuilder({
      customId: "music/Stop",
      label: "⏹️",
      style: ButtonStyle.Secondary,
    }),
    new ButtonBuilder({
      customId: "music/Resume",
      label: "▶️",
      style: ButtonStyle.Secondary,
    }),
    new ButtonBuilder({
      customId: "music/Pause",
      label: "⏸️",
      style: ButtonStyle.Secondary,
    }),
    new ButtonBuilder({
      customId: "music/Next",
      label: "⏩",
      style: ButtonStyle.Secondary,
    }),
    new ButtonBuilder({
      customId: "music/Previous",
      label: "⏪",
      style: ButtonStyle.Secondary,
    }),
  );
  const embed = createEmbed({
    color: settings.colors.primary,
    title: `${icon.discopepe || icon.catdancing} Tocando agora`,
    url: uri || "",
    image:
      artworkUrl ||
      "https://ik.imagekit.io/9k3mcoolader/noteorange.png?updatedAt=1722273085685",
    description: brBuilder(
      `**Titulo**: ${title || "Musica desconhecida"}`,
      `**Autor**: ${author || "Desconhecido"}`,
      `**Canal de voz**: ${voiceChannel || "Desconhecido"}`,
      `**Duração**: ${msToHour(duration) || "0:00"}`
    ),
  });

  return { ephemeral, embeds: [embed], components: [row] };
}
