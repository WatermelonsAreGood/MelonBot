import Josh from "@joshdb/core"
import provider from "@joshdb/sqlite"

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
		this.client.sendMessage(`!! You have ${me.money}$!`)
	}
}