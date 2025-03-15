import 'dotenv/config';

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import si from 'systeminformation';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let previousNetworkData = null;
let previousTimestamp = Date.now();

function bytesToMbit(bytes, intervalMs) {
  const bits = bytes * 8;
  const mbit = bits / 1_000_000;
  const sec = intervalMs / 1000;
  return (mbit / sec).toFixed(2);
}

function createBar(percent, length = 10) {
  const filled = Math.round((percent / 100) * length);
  const bar = '█'.repeat(filled) + '░'.repeat(length - filled);
  return `[${bar}] ${percent.toFixed(2)}%`;
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function getSystemStats() {
  const currentLoadData = await si.currentLoad();
  const memData = await si.mem();
  const netDataArray = await si.networkStats();

  let totalRx = 0;
  let totalTx = 0;
  netDataArray.forEach((iface) => {
    totalRx += iface.rx_bytes;
    totalTx += iface.tx_bytes;
  });

  const cpuLoadTotal = currentLoadData.currentLoad.toFixed(2);

  const coreLoadTexts = currentLoadData.cpus.map((cpu, index) => {
    const coreIndex = index.toString().padStart(2, '0'); 
    return `C${coreIndex}: ${createBar(cpu.load)}`;
  });

  const totalRamGB = (memData.total / 1073741824).toFixed(2);
  const usedRamGB = (memData.active / 1073741824).toFixed(2);
  const freeRamGB = (memData.available / 1073741824).toFixed(2);
  const ramUsagePercent = (parseFloat(usedRamGB) / parseFloat(totalRamGB)) * 100;

  const totalSwapGB = (memData.swaptotal / 1073741824).toFixed(2);
  const usedSwapGB = (memData.swapused / 1073741824).toFixed(2);
  const freeSwapGB = memData.swaptotal > 0
    ? ((memData.swaptotal - memData.swapused) / 1073741824).toFixed(2)
    : '0.00';
  const swapUsagePercent = parseFloat(totalSwapGB) > 0
    ? (parseFloat(usedSwapGB) / parseFloat(totalSwapGB)) * 100
    : 0;

  let netDown = 0;
  let netUp = 0;
  const currentTimestamp = Date.now();
  if (previousNetworkData) {
    const intervalMs = currentTimestamp - previousTimestamp;
    const diffRx = totalRx - previousNetworkData.rx;
    const diffTx = totalTx - previousNetworkData.tx;
    netDown = bytesToMbit(diffRx, intervalMs);
    netUp = bytesToMbit(diffTx, intervalMs);
  }
  previousNetworkData = { rx: totalRx, tx: totalTx };
  previousTimestamp = currentTimestamp;

  return {
    cpuLoadTotal,
    coreLoadTexts,
    usedRamGB,
    freeRamGB,
    totalRamGB,
    ramUsagePercent,
    usedSwapGB,
    freeSwapGB,
    totalSwapGB,
    swapUsagePercent,
    netDown,
    netUp,
  };
}

async function updateSystemEmbed(message) {
  const stats = await getSystemStats();
  const chunkedCoreLoadTexts = chunkArray(stats.coreLoadTexts, 1);
  const lines = chunkedCoreLoadTexts.map(chunk => chunk.join('    '));
  const cpuCoresText = lines.join('\n');

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🖥 Monitoring Linux VM')
    .setDescription('Live system information')
    .addFields(
      {
        name: '〽️ Total CPU Load',
        value: createBar(parseFloat(stats.cpuLoadTotal)),
        inline: false,
      },
      {
        name: '📊 CPU Cores',
        value: cpuCoresText,
        inline: false,
      },
      {
        name: '🎟 RAM',
        value:
          `Used: ${stats.usedRamGB} GB / Free: ${stats.freeRamGB} GB / Total: ${stats.totalRamGB} GB\n` +
          `Usage: ${createBar(stats.ramUsagePercent)}`,
        inline: false,
      },
      {
        name: '🗂️ Swap',
        value:
          `Used: ${stats.usedSwapGB} GB / Free: ${stats.freeSwapGB} GB / Total: ${stats.totalSwapGB} GB\n` +
          `Usage: ${createBar(stats.swapUsagePercent)}`,
        inline: false,
      },
      {
        name: '🌐 Network',
        value: `↓ ${stats.netDown} MBit/s    |    ↑ ${stats.netUp} MBit/s`,
        inline: false,
      },
    )
    .setTimestamp(new Date());

  await message.edit({ embeds: [embed] });
}

client.once('ready', async () => {
  console.log(`Bot is online as: ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    if (!channel) {
      console.error('Channel not found. Please check your DISCORD_CHANNEL_ID.');
      return;
    }

    const initialEmbed = new EmbedBuilder().setDescription('Starting system monitor...');
    const message = await channel.send({ embeds: [initialEmbed] });

    setInterval(async () => {
      try {
        await updateSystemEmbed(message);
      } catch (error) {
        console.error('Error updating embed:', error);
      }
    }, 15000);

  } catch (err) {
    console.error('Error accessing channel:', err);
  }
});

client.login(DISCORD_TOKEN).catch((err) => {
  console.error('Login error:', err);
});