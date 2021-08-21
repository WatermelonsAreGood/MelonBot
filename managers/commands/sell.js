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

	async run(message, args) {
		const me = await USERS.get(message.user._id)
		const itemObject = items.find(e => e.name == args.join(" "))
		
		if(!itemObject) {
			this.client.sendMessage("Fruit doesn't exist.")
		} else {
			const item = me.inventory.find(e => e.id == itemObject.id)

			if(item) {
				this.client.sendMessage(`Sold ${item.amount} ${itemObject.name} for ${itemObject.cost * item.amount}`)
				
				me.money += itemObject.cost * item.amount
				me.inventory = me.inventory.filter(e => e.id != itemObject.id)

				await USERS.set(message.user._id, me)
			} else {
				this.client.sendMessage("You don't have this fruit.")
			}
		}
	}
}