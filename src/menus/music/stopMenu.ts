import { icon } from "#functions";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";

export function musicStopMenu(){
    const embed = createEmbed({
        color: settings.colors.primary,
        title: `Obrigado por usar o lambda, fico muito feliz por dar uma chance pra nos. ${icon.anyajumping || "😊"} `
    });

    return { embeds: [embed] };
}