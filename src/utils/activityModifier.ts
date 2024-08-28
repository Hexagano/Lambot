import { ActivityType, Client } from "discord.js";
type Nullable<T> = T | null;
const modifyActivity = (client: Client<boolean>, type: ActivityType, url:Nullable<string> , name: string) => {
    if(!client) return;
    client?.user?.setActivity({type: type || ActivityType.Streaming, url: url as string, name: name || "Unknown activity"});
}

export {modifyActivity}