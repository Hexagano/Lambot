import { GuildSchema } from "#database";
import { HydratedDocument } from "mongoose";
import { Rainlink } from "rainlink";

declare module "discord.js" {
	interface Client {
		readonly mainGuildData: HydratedDocument<GuildSchema>
		rainlink: Rainlink;
	}
}