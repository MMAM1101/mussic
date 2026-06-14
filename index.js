const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.on("ready", () => {
  console.log("Bot is online");
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!play")) return;

  const query = message.content.replace("!play", "").trim();
  if (!query) return message.reply("اكتب اسم الأغنية");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.reply("ادخل روم صوت");

  const search = await play.search(query, { limit: 1 });
  const video = search[0];

  const stream = await play.stream(video.url);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type
  });

  const player = createAudioPlayer();

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator
  });

  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
  });

  message.reply(`🎵 شغال: ${video.title}`);
});

client.login(process.env.TOKEN);
