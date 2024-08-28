import { Command } from "#base";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { brBuilder } from "@magicyan/discord";
import { ActivityType, ApplicationCommandOptionType } from "discord.js";
import { settings } from "#settings";
import { Logger } from "utils/coolutils.js";
import { modifyActivity } from "utils/activityModifier.js";
import {
  RainlinkLoopMode,
  RainlinkPlayerState,
  RainlinkSearchResultType,
} from "rainlink";

new Command({
  name: "music",
  description: "Comando de música",
  options: [
    {
      name: "tocar",
      description: "Tocar uma música",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "busca",
          description: "Nome da música ou url",
          type: ApplicationCommandOptionType.String,
          required,
        },
        {
          name: "engine",
          description:
            "O tipo de plataforma para pesquisar a musica (menusculo)",
          type: ApplicationCommandOptionType.String,
          required,
          choices: [
            {
              name: "spotify",
              value: "spotify",
            },
            {
              name: "deezer",
              value: "deezer",
            },
          ],
        },
      ],
    },
    {
      name: "volume",
      description: "Alterar o volume",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "valor",
          description: "Valor para o volume ser aumentado",
          type: ApplicationCommandOptionType.Integer,
          required,
        },
      ],
    },
    {
      name: "pausar",
      description: "Pausa a música atual",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "retomar",
      description: "Retoma a música atual",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "parar",
      description: "Para a música atual",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "pular",
      description: "Pular músicas da fila",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "quantidade",
          description: "Quantide de músicas para pular",
          type: ApplicationCommandOptionType.Integer,
          minValue: 1,
        },
      ],
    },
    {
      name: "repetir",
      description: "Colocar a musica pra ficar repetindo.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [],
    },
    {
      name: "fila",
      description: "Exibe a fila atual",
      type: ApplicationCommandOptionType.Subcommand,
      options: [],
    },
    {
      name: "sair",
      description: "Sair da chamada de voz.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [],
    },
    {
      name: "embaralhar",
      description: "Embaralha a ordem das músicas na fila",
      type: ApplicationCommandOptionType.Subcommand,
      options: [],
    },
  ],
  async run(interaction) {
    const { options, member, guild, channel } = interaction;

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply(
        res.danger(
          "Você precisa estar em um canal de voz para usar este comando!"
        )
      );
    }
    if (!channel) {
      return interaction.reply(
        res.danger("Não possível utilizar este comando neste canal de texto!")
      );
    }

    const getPlayer = interaction.client.rainlink.players.get(guild.id);
    const queue = getPlayer?.queue;

    await interaction.deferReply({ ephemeral });
    let loop: boolean = false;
    if (!queue) {
      return await interaction.editReply(res.danger("Não há uma fila de reprodução ativa!"));
    }
    switch (options.getSubcommand(true)) {
      case "repetir": {
        if (getPlayer?.playing) {
          loop = !loop;
          if (loop) {
            getPlayer?.setLoop(RainlinkLoopMode.SONG);
          } else {
            getPlayer?.setLoop(RainlinkLoopMode.NONE);
          }
          return await interaction.editReply(
            loop
              ? res.success("O loop foi ativado.")
              : res.danger("O loop foi desativado.")
          );
        } else {
          return await interaction.reply(
            res.danger("Não tenhe nenhuma musica tocando.")
          );
        }
      }
      case "sair": {
        if (getPlayer?.playing) {
          getPlayer?.destroy();
          return await interaction.editReply(res.success("Adeus, depois nois toca mais musica."));
        } else {
          return await interaction.reply(
            res.danger("Não tenhe nenhuma musica tocando.")
          );
        }
      }
      case "volume": {
        const valor = options.getInteger("valor", true);
        if (isNaN(valor)) {
          return interaction.channel?.send({
            content: `${
              interaction?.member.displayName || "Desconhecido"
            } Desculpe me mas, este valor não é um número.`,
          });
        }
        if (valor <= 1) {
          return interaction.channel?.send({
            content: `${
              interaction?.member.displayName || "Desconhecido"
            } Desculpe me mas, este valor é menor que 1.`,
          });
        } else if (valor > 100) {
          return interaction.channel?.send({
            content: `${
              interaction?.member.displayName || "Desconhecido"
            } Desculpe me mas, este valor não é maior que 100.`,
          });
        }
        if (getPlayer?.playing) {
          getPlayer?.setVolume(valor);
          return interaction.channel?.send({
            content: `${icon.volume}Setando o volume para ${valor}%`,
          });
        } else {
          return interaction.channel?.send({
            content: "Nehuma musica esta tocando :/",
          });
        }
      }
      case "tocar": {
        const query = options.getString("busca", true);
        const engine = options.getString("engine", true);
        Logger.info!("Nome da musica: " + query);
        Logger.info!("Plataforma: " + engine);
        try {
          const result = await interaction.client.rainlink.search(query, {
            engine: engine,
            requester: interaction?.member,
          });
          // Troque o engine se necessário

          if (!engine) {
            return interaction.editReply(
              res.danger(
                "Desculpe mas, ou você inseriu a plataforma errada ou a plataforma não existe."
              )
            );
          }

          if (result.tracks.length === 0) {
            return interaction.editReply(res.danger("Nenhuma música encontrada!"));
          }

          // Create connection with Discord voice channel
          const player = interaction.client.rainlink?.create({
            guildId: interaction?.guild.id,
            voiceId: voiceChannel?.id,
            shardId: interaction?.guild.shardId,
            textId: interaction?.channelId,
            deaf: true,
          });
          const track = result.tracks[0];
          const display: string[] = [];
          switch (result?.type) {
            case RainlinkSearchResultType.PLAYLIST:
              for (const track of result?.tracks) {
                track.requester = interaction.user;
                (await player).queue.add(track);
              }
              display.push(
                `${result?.playlistName} foi carregada com ${result?.tracks.length}`
              );
              break;
            default:
              const track = result?.tracks[0];
              track.requester = interaction.user;
              (await player).queue.add(track);
              display.push(`Musica na fila \n \`${track.title}\``);
              break;
          }
          if (
            !(await player).playing &&
            (await player).state == RainlinkPlayerState.CONNECTED
          )
            (await player).play();
          Logger.info!("Url da musica: " + track?.uri || "Desconhecido");

          interaction.client.user.setActivity({
            name: track?.title,
            type: ActivityType.Playing,
          });
          modifyActivity(
            interaction.client,
            ActivityType.Playing,
            null,
            "" + settings.playingActivity.replace("%music_name%", track?.title)
          );

          interaction.channel?.send(
            menus.music.announcement(track, voiceChannel)
          );
          return interaction.editReply(res.success(brBuilder(display)));
        } catch (_) {
          Logger.error!("Un erro foi ocorrido inesperadamente: " + _);
          return interaction.editReply(
            res.danger("Un erro foi ocorrido inesperadamente: " + _)
          );
        }
      }
      case "pausar": {
        if (getPlayer?.playing) {
          if (getPlayer.paused) {
            return await interaction.channel?.send(
              res.danger("A música atual já está pausada!")
            );
          }
          getPlayer.pause();
          return await interaction.channel?.send(res.success("A música atual foi pausada!"));
        } else {
          return await interaction.channel?.send(
            res.warning("Não tenhe nenhuma musica tocando!")
          );
        }
      }
      case "retomar": {
        if (getPlayer?.state !== RainlinkPlayerState.CONNECTED) {
          return await interaction.channel?.send(
            res.warning("Não tenhe nenhuma musica tocando!")
          );
        }
        if (getPlayer?.playing) {
          return await interaction.channel?.send(
            res.danger("A música atual não está pausada, porque ela esta tocando.")
          );
        }
        getPlayer.resume();
        return await interaction.channel?.send(res.success("A música atual foi retomada!"));
      }
      case "parar": {
        if (getPlayer?.state !== RainlinkPlayerState.CONNECTED) {
          return await interaction.channel?.send(
            res.warning("Não tenhe nenhuma musica tocando!")
          );
        }
        getPlayer.destroy();
        return await interaction.channel?.send(res.success("A música atual foi parada"));
      }
      default: {
        return await interaction?.reply(res.danger("Comando inexistente!"));
      }
    };
  },
});
