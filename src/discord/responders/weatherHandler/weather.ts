/* eslint-disable camelcase */
import { Cooldown, Store } from "#base";
import { createEmbed } from "@magicyan/discord";
import {
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

interface WeatherTypes {
  location: {
    name: string,
    region: string,
    country: string,
    tz_id: string,
  };
  current: {
    temp_c: number;
    humidity: number;
    last_updated: string;
    is_day: number;
    cloud: number,
    condition: {
      text: string;
      icon: string;
      code: number;
    };
  };
}

const sendWeather = async (
  interaction:
    | MessageComponentInteraction<"cached">
    | ChatInputCommandInteraction<"cached">
    | ButtonInteraction<"cached">,
  weatherQuery: string
) => {
  if (interaction == null) return log.log("something unexpected was happen :/");

  await interaction.deferReply({ fetchReply, ephemeral }); // Definir uma reply

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
      `${
        env.WEATHER_API +
        encodeURIComponent(env.WEATHER_KEY || "InvalidKey") +
        `&q=${weatherQuery}&aqi=no`
      }` || "error"
    )
      .then(async (r) => {
        const data = (await r.json()) as WeatherTypes;
        const location = data?.location;
        const current = data?.current;

        // Current
        const temp_c = current?.temp_c;
        const humidity = current?.humidity;
        const last_updated = current?.last_updated;
        const is_day = current?.is_day;
        const cloudy = current?.cloud;
        
        const condition = current?.condition;
        const text = condition?.text;
        const icon = condition?.icon;

        //Location
        const cityName = location?.name;
        const region = location?.region;
        const country = location?.country;
        const tz_id = location?.tz_id;

        var translatedText = "";
        
        switch(text){
            case "Overcast":
                translatedText = "Nublado";
                break;
            default:
                translatedText = "????";
                break;
        }

        const embed = createEmbed({
          title: "Clima ⛅",
          thumbnail: `${"https:" + icon || "https://ik.imagekit.io/honi/errorIcon.png?updatedAt=1724734758095"}`,
          description: `Agora esta ${is_day ? "de dia" : "de noite"}, com tempo ${translatedText}`,
          fields: [
            { name: "Temperatura", value: `${temp_c || "Error"}`, inline: true },
            { name: "Humidade", value: `${humidity || "Desconhecida"}`, inline: true },
            { name: "Nuvens", value: `${cloudy ? "Sim" : "Não"}`, inline: true },
            { name: "Região", value: `${region || "Desconhecida"}`, inline: true },
            { name: "Cidade", value: `${cityName || "Desconhecida"}`, inline: true },
            { name: "ID", value: `${tz_id || "Wtf??"}`, inline: true },
            { name: "País", value: `${country || "Desconhecido."}`, inline: true },
          ],
          timestamp: `${last_updated}`,
          color: env.EMBED_COLOR || "Orange",
        });
        interaction.editReply({ embeds: [embed] });
      })
      .catch((err) => {
        interaction.editReply({ content: "Falha ao mandar o menu: " + err });
      });
  }

  const c = new Cooldown();
  const now = Date.now();
  if (inCooldown && inCooldown.getTime() > now) {
    interaction.editReply({
      content: `O Cooldown foi expirado, agora você pode continuar com os comandos ${icon.whitethingtwerking}`,
    });
  } else {
    c.add(10, "seconds");
    cooldowns.set(interaction.member.id, c.expiresAt, { time: 6000 });
  }
};

export { sendWeather };
