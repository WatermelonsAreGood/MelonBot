import Josh from "@joshdb/core"
import provider from "@joshdb/sqlite"

import ClientManager from "./managers/ClientManager.js"
import CommandManager from "./managers/CommandManager.js"
import DiscordManager from "./managers/DiscordManager.js"
import fs from "fs"

const config = JSON.parse(fs.readFileSync("config.json"))
const discord = new DiscordManager(config.discord.token)

const DB = new Josh({
	name: "MelonBot",
	provider,
})

await DB.ensure("bans", [])

discord.on("ready", () => {
	config.links.forEach(server => {
		discord.createBridgeChannels(server)

		for (let i = 0; i < server.channels.length; i++) {
			setTimeout(() => {
				startBot(server, server.channels[i])
			},2000*i)
		}
	})
})

function startBot(server, channel) {
	const client = new ClientManager(server.ws, config.token, discord)
	const CManager = new CommandManager(client,)

	client.on("ready", () => {
		client.setChannel(channel)
		client.setUsername(config.username)
		
		client.dvd.startLoop()

		discord.emit("connected", client, channel+server.name)

		setTimeout(() => {
			discord.sendRaw(server, channel, `\`Connected.\``)
		}, 4000)
		
		console.log("I have connected to " + server.ws + " #" + channel)		
	})

	client.on("message", message => {
		if(client.user._id == message.user._id) return;
		CManager.handleMessage(message)

		discord.recieveMessage(server, channel, message)
		return 
	})

	client.on("end", (reason) => {
		console.log(`Client closed due to \`${reason}\`. Reconnecting in 2s. (${server.ws})`)
	
		client.midi.stop()
		delete client.users

		discord.sendRaw(server, channel, `Client ended due to ${reason}. Reconnecting.`)

		setTimeout(() => {
			console.log("Attempting to connect.")
			startBot(server, channel, discord)
		}, 10000)
	})
}
