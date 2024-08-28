import { Responder, ResponderType } from "#base";
import { icon, res } from "#functions";
import { RainlinkPlayerState } from "rainlink";

// Handler para o menu de queue
new Responder({
    customId: "music/:action",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction, { action }) {
      const { guild, member } = interaction;
      const voiceChannel = member.voice.channel;
      if (!voiceChannel) {
        return interaction.reply(
          res.danger("Você precisa estar em um canal de voz para usar este comando!"),
        );
      }
      const getPlayer = interaction.client.rainlink.players.get(guild.id);
      if (getPlayer?.state !== RainlinkPlayerState.CONNECTED) {
        return interaction.reply(res.warning("Não tenhe nenhuma musica tocando!"));
      }
      switch (action) {
        case "Stop": {
          getPlayer?.stop(false);
          return interaction.reply(
            res.success(
              `${icon.stop} A musica foi parada por ${
                interaction.user?.username || "Desconhecido"
              }`,
            ),
          );
        }
        case "Resume": {
          if (getPlayer?.playing) {
            return interaction.reply(res.danger("A musica já esta tocando."));
          }
          getPlayer?.resume();
          return interaction.reply(
            res.success(
              `${icon.resume} musica retomada por ${
                interaction.user?.username || "Desconhecido"
              }`,
            ),
          );
        }
        case "Pause": {
          if (!getPlayer?.playing) {
            return interaction.reply(res.danger("A musica já não esta tocando."));
          }
          getPlayer?.pause();
          return interaction.reply(
            res.success(
              `${icon.pause} musica pausada por ${
                interaction.user?.username || "Desconhecido"
              }`,
            ),
          );
        }
        case "Next": {
          if (!getPlayer?.playing) {
            return interaction.reply(res.danger("A musica não esta tocando."));
          }
          getPlayer?.skip();
          return interaction.reply(
            res.success(
              `${icon.next} musica foi pulada pra frente por ${
                interaction.user?.username || "Desconhecido"
              }`,
            ),
          );
        }
        case "Previous": {
          if (!getPlayer?.playing) {
            return interaction.reply(res.danger("A musica não esta tocando."));
          }
          getPlayer?.previous();
          return interaction.reply(
            res.success(
              `${icon.previous} musica foi pulada pra tras por ${
                interaction.user?.username || "Desconhecido"
              }`,
            ),
          );
        }
        default: {
          return interaction.reply(res.danger("Butão invalido!"));
        }
      };
    },
  });
  