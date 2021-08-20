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

		const myself = this.client.users.get(message.user._id)

		if(myself.isFarming) {
			this.client.sendMessage("!! You've been farming since " + new Date(myself.isFarming).toLocaleTimeString())
			return
		} else {
			myself.isFarming = Date.now()
			this.client.users.set(message.user._id, myself)
		}

		this.client.sendMessage("!! Started farming!")
		const itemsToGive = []

		items.forEach(item => {
			if(Math.floor(Math.random() * item.chance) === 0) {
				itemsToGive.push(item)
			}
		})

		setTimeout(async () => {
			delete this.client.users.get(message.user._id).isFarming

			itemsToGive.forEach(item => {
				const myItem = me.inventory.find(e => e.id == item.id)

				if(myItem) {
					myItem.amount++

					me.inventory = me.inventory.filter(e => e.id != item.id)

					me.inventory.push(myItem)
				} else {
					me.inventory.push({
						id: item.id,
						amount: 1
					})
				}
			})

			await USERS.set(message.user._id, me)

			this.client.sendMessage(`${message.user.name}, got ${itemsToGive.map(e => e.name).join(", ")}`)
		}, 30000 + Math.floor(Math.random() * 30000))
	}
}