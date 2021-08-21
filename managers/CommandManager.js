import Josh from "@joshdb/core"
import provider from "@joshdb/sqlite"

import fs from "fs"

const USERS = new Josh({
	name: "MelonBot-Users",
	provider,
})

const DB = new Josh({
	name: "MelonBot",
	provider,
})

export default class ClientManager {
	constructor(client) {
		this.client = client
		this.commands = fs.readdirSync("managers/commands/").map(e => e.split(".js")[0])
		this.config = JSON.parse(fs.readFileSync("config.json").toString())
	}


	async handleMessage(message) {
		const bans = await DB.get("bans")

		const args = message.content.split(" ")
		let command = args.shift()
		
		if(command.startsWith("??")) command = command.substring(2); else return
		
		if(this.commands.includes(command)) {
			const nodeCommand = await import(`./commands/${command}.js`)
			const classCommand = new nodeCommand.default(this.client)
			
			if(bans.includes(message.user._id)) {
				this.client.sendMessage("You are banned.")
				return
			}

			if(classCommand.admin && !this.config.admins.includes(message.user._id)) {
				this.client.sendMessage("You are not a admin.")
				return
			}

			await USERS.ensure(message.user._id, {
				money: 0,
				inventory: []
			})
			
			classCommand.run(message, args)
		}
	}
}

