import { Responder, ResponderType } from "#base";
import { createEmbed } from "@magicyan/discord";

// Modal para banir
new Responder({
  customId: "manage/promptBanir/user/:userid",
  type: ResponderType.ModalComponent,
  cache: "cached",
  run(interaction, { userid }) {
    const { guild } = interaction;
    const motivo = interaction.fields.getTextInputValue("reason"); // Reason to get banned | Motivo para o alvo ser banido
    const mention = guild.members.cache.get(userid ?? "null") ?? null;

    try {
      if (mention != null) {
        if (mention.bannable) {
          const Embed = createEmbed({
            title: `Usuário ${mention} foi banido, por motivo ${
              motivo ?? "Nenhum"
            }`,
            color: "Orange",
          });
          mention.ban();
          interaction.update({ embeds: [Embed] });
        } else {
          const Embed = createEmbed({
            title: `Este usuário ${mention} não é banivel`,
            color: "Red",
          });
          interaction.update({ embeds: [Embed] });
        }
      } else {
        const Embed = createEmbed({
          title: `Este usuário não existe`, // Para quando o usuario não existir
          color: "Red",
        });
        interaction.update({ embeds: [Embed] });
      }
    } catch (e) {
      const Embed = createEmbed({
        title: `Falha no banimento deste usuário: ${e}`,
        color: "Red",
      });
      interaction.update({ embeds: [Embed] });
    }
  },
});

// Modal para kickar
new Responder({
  customId: "manage/promptKickar/user/:userid",
  type: ResponderType.ModalComponent,
  cache: "cached",
  run(interaction, { userid }) {
    const { guild } = interaction;
    const motivo = interaction.fields.getTextInputValue("reason"); // Reason to get kicked | Motivo para o alvo ser kickado
    const mention = guild.members.cache.get(userid ?? "null") ?? null; // get user by id
    try {
      if (mention != null) {
        if (mention.kickable) {
          // Embed de expulsamento
          const Embed = createEmbed({
            title: `Usuário ${mention} foi kickado, por motivo ${
              motivo ?? "Nenhum"
            }`,
            color: "Orange",
          });
          mention.kick();
          interaction.update({ embeds: [Embed] });
        } else {
          // Embed de que o usuário não é kickavel
          const Embed = createEmbed({
            title: `Este usuário ${mention} não é kickavel`,
            color: "Red",
          });
          interaction.update({ embeds: [Embed] });
        }
      } else {
        // Embed de que este usuário não existe
        const Embed = createEmbed({
          title: `Este usuário não existe`, // Para quando o usuario não existir
          color: "Red",
        });
        interaction.update({ embeds: [Embed] });
      }
    } catch (e) {
      // Embed de que ocorreu um erro inesperado no expulsamento.
      const Embed = createEmbed({
        title: `Falha no expulsamento deste usuário, ${e}`,
        color: "Red",
      });
      interaction.update({ embeds: [Embed] });
    }
  },
});
