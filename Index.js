const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, downloadMediaMessage } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const { stickifyImage } = require("./stickify");

const { state, saveState } = useSingleFileAuthState("./auth_info.json");

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveState);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;

        if (msg.message.imageMessage) {
            const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
            const inputPath = "./media/input.jpg";
            const outputPath = "./media/output.webp";

            fs.writeFileSync(inputPath, buffer);
            await stickifyImage(inputPath, outputPath);

            const stickerBuffer = fs.readFileSync(outputPath);
            await sock.sendMessage(sender, { sticker: stickerBuffer });
        } else {
            await sock.sendMessage(sender, { text: "Envie uma imagem para transformá-la em figurinha estilo Jeff The Killer." });
        }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        }
    });
}

startBot();
