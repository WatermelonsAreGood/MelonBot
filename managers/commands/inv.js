import Josh from "@joshdb/core"
import provider from "@joshdb/sqlite"

import fs from "fs"

const items = JSON.parse(fs.readFileSync("items.json"))

const USERS = new Josh({
	name: "MelonBot-Users",
	provider,
})

export default class command {
	constructor(client) {
		this.client = client
	}

	async run(message) {
		const me = await USERS.get(message.user._id)
		if(me.inventory.length != 0) {
			const text = `!! ${message.user.name} has ${me.inventory.map(e => `${items.find(b => b.id == e.id).name} (x${e.amount})`).join(", ")}`.match(/.{1,511}/g)

			setTimeout(() => {
				for (let i = 0; i < text.length; i++) {
					setTimeout(() => {
						this.client.sendMessage(text[i])
					}, i * 1000)
				}
			}, 100)
		} else {
			this.client.sendMessage("!! Your inventory is empty. To populate it with fruit, use ??farm.")
		}
	}
}