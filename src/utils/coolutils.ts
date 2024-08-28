import Pino from "pino";
import Cluster from "cluster";

export interface IpcContent {
  op: string;
  data?: unknown;
}

export interface IpcMessage {
  reply: (data: unknown) => void;
  content: IpcContent;
  repliable: boolean;
}

export interface UpdateCommandsOptions {
  guildId?: string;
  clear?: boolean;
}

export interface ClientStatistics {
  guilds: number;
  users: number;
  channels: number;
  players: number;
  shards: number;
  ram: number;
}

export interface ConfigOptions {
  level: string;
  owners: string[];
  token: string;
  shards: number | null;
  clusters: number | null;
  slashOptions: {
    update: boolean;
    dev: boolean;
    clear: boolean;
    guildId: string;
  };
}

export const IndomitableEnvVariables = {
  clusterId: Number(process.env.INDOMITABLE_CLUSTER),
  clusterTotal: Number(process.env.INDOMITABLE_CLUSTER_TOTAL),
};

export const Colors = {
  Normal: 0x7e686c,
  Fail: 0xff7276,
};

const transport = Pino.transport({
  target: "pino-pretty",
  options: {
    colorize: true, // Adiciona cores aos logs
    translateTime: "SYS:standard", // Traduz o timestamp para um formato legível
  },
});

// @ts-expect-error
const Logger = Pino({ level: "info" }, transport);

export const AsciiArt = `
${"db       .d8b.  .88b  d88. d8888b.  .d88b.  d888888b "}
${"88      d8' `8b 88'YbdP`88 88  `8D .8P  Y8. `~~88~~' "}
${"88      88ooo88 88  88  88 88oooY' 88    88    88    "}
${"88      88~~~88 88  88  88 88~~~b. 88    88    88    "}
${"88booo. 88   88 88  88  88 88   8D `8b  d8'    88    "}
${"Y88888P YP   YP YP  YP  YP Y8888P'  `Y88P'     YP    "}
`;

if (Cluster.isPrimary) {
  Logger.info!("Starting....");
  Logger.info!(AsciiArt);
}

export { Logger };
