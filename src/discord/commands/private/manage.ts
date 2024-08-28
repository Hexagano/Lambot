import { Command, Cooldown, Responder, ResponderType, Store } from "#base";

import {
  createEmbed,
  createModalFields,
} from "@magicyan/discord";

import {
  ApplicationCommandType,
  PermissionsBitField,
  TextInputStyle,
  time,
} from "discord.js";
import { log } from "#settings";
import { simpleMenu } from "#menus";

const cooldowns = new Store<Date>();
var alvoUserId: string = "";

// Comando para enviar o menu
new Command({
  name: "Gerenciar",
  // description: "Um comando para gerenciar usuários",
  type: ApplicationCommandType.User,
  run(interaction) {
    const { targetUser } = interaction;
    alvoUserId = targetUser.id;
    const administrator = interaction.member
      .permissionsIn(interaction.channelId)
      .has(PermissionsBitField.Flags.Administrator);

    if (administrator) {
      try {
        interaction.reply(simpleMenu(interaction.user, targetUser));
      } catch (e) {
        log.error("Failed to send simple menu", e);
      }
    } else {
      interaction.reply({fetchReply, ephemeral, content: "Você não é um administrador" });
    }
  },
});

// Handler para o menu
new Responder({
  customId: "manage/user/:userid/:action", // <= :motivo é opcional, e tambem só pros comandos de moderação.
  // :userid pode ser ou o id do membro que esta usando este comando, ou o id do alvo
  type: ResponderType.Button,
  cache: "cached",
  async run(interaction, { userid, action }) {
    if(!userid) return;
    if(!action) return;
    // userid = id do alvo
    // interaction = admin

    const { guild } = interaction;
    const inCooldown = cooldowns.get(interaction.user.id);

    const c = new Cooldown(); // Coloquei aqui para não arrumar o erro do typescript ￣へ￣
    var alvo = null;

    // A parte do cooldown

    if (inCooldown && inCooldown < new Date()) {
      interaction.reply({
        content: `Você precisa esperar ${time(
          inCooldown,
          "R"
        )} para usar usar este butão novamente.`,
        ephemeral: true,
      });
      return;
    }

    switch (action) {
      case "desbanir":
        // Verificar se o id do alvo não esta nullo

        if (alvoUserId == "") return interaction.reply("ID do alvo inválido");

        //Procurar na lista de banimentos do propio discord pelo id do alvo.

        const bansAlvo = guild.bans.fetch(`${alvoUserId}`);
        // Verificar se o bansAlvo esta nullo ou não, se não estiver nullo, então significa que o alvo existe na lista de banimentos.
        // caso ocontrario, o alvo não existe na lista de banimentos do proprio discord.
        if (bansAlvo != null) {
          alvo = (await bansAlvo).user.fetch(); // Definir o parametro alvo para o usuário achado na lista.

          // Verificar se o parametro alvo não esta nullo

          if (alvo != null) {
            // Embed de enviar que o alvo foi desbanido

            const Embed = createEmbed({
              title: `Usuário ${(await alvo).username} foi desbanido`,
              color: "Orange",
            });

            // Desbanir o alvo com motivo desconhecido (porque não conseguir passar o motivo, e tambem nem precisa :/)

            guild.members.unban(`${alvoUserId}`, "");

            // Enviar a propria mensagem

            interaction.reply({fetchReply, ephemeral, embeds: [Embed] });
          } else {
            // Se estiver nullo então enviar uma mensagem de erro.

            interaction.reply("Parametro alvo esta nullo.");
          }
        } else {
          interaction.reply({
            content: "Alvo não encontrado na lista de banimentos.",
          });
        }
        break;
      case "promptBanir":
        // Mostrar a tela para banir os usuários
        interaction.showModal({
          customId: `manage/promptBanir/user/${userid}`,
          title: "Tela de banimento",
          components: createModalFields({
            reason: {
              label: "Motivo",
              style: TextInputStyle.Short,
              placeholder: "Motivo pro banimento aqui.",
            },
          }),
        });

        break;
      case "promptKickar":
        // Mostrar a tela para banir os usuários
        interaction.showModal({
          customId: `manage/promptKickar/user/${userid}`,
          title: "Tela de expulsamento",
          components: createModalFields({
            reason: {
              label: "Motivo",
              style: TextInputStyle.Short,
              placeholder: "Motivo para expulsar aqui.",
            },
          }),
        });
        break;
      default:
        interaction.reply("Interação invalida :/");
        break;
    }

    if (c.expiresAt > new Date()) {
      c.add(10, "seconds");
    }

    cooldowns.set(interaction.member.id, c.expiresAt, { time: 6000 });
    return;
  },
});