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
		
		if(me.inventory.length == 0) {
			this.client.sendMessage("!! You don't have any items.")
			return
		}

		let value = 0

		me.inventory.forEach(item => {
			const itemObject = items.find(e => e.id == item.id)
			value += itemObject.cost * item.amount
		})

		me.inventory = []
		me.money += value

		await USERS.set(message.user._id, me)

		this.client.sendMessage("!! You sold all of your items. You got " + value + "$!")
	}
}