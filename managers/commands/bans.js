import Josh from "@joshdb/core"
import provider from "@joshdb/sqlite"

const DB = new Josh({
	name: "MelonBot",
	provider,
})

  
export default class command {
	constructor(client) {
		this.client = client
	}

	async run() {
		const bans = await DB.get("bans")

		this.client.sendMessage("!! There are " + bans.length + " bans. Here's one: " + bans[Math.floor(Math.random() * bans.length)])
	}
}