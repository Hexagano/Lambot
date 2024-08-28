import { Schema } from "mongoose";
import { t } from "../utils.js";

export const memberSchema = new Schema(
    {
        id: t.string,
        guildId: t.string,
        cooldowns: {
            type: Map,
            of: Date,
            default: new Map()
        }
    },
    {
        statics: {
            async get(member: { id: string, guild: { id: string } }) {
                const query = { id: member.id, guildId: member.guild.id };
                return await this.findOne(query) ?? this.create(query);
            }
        }
    },
);