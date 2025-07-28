const makeWASocket = require("@whiskeysockets/baileys").default;
const { useSingleFileAuthState } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const { state, saveState } = useSingleFileAuthState("auth_info.json");

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message?.imageMessage) return;

    const buffer = await sock.downloadMediaMessage(msg);
    const filename = `temp-${Date.now()}.jpg`;
    fs.writeFileSync(filename, buffer);

    const output = `sticker-${Date.now()}.webp`;
    const cmd = `convert ${filename} -resize 512x512 -gravity center -background black -extent 512x512 ${output}`;

    exec(cmd, async (err) => {
      if (!err) {
        const sticker = fs.readFileSync(output);
        await sock.sendMessage(msg.key.remoteJid, {
          sticker: { url: output },
        });
        fs.unlinkSync(filename);
        fs.unlinkSync(output);
      }
    });
  });
}

startBot();
