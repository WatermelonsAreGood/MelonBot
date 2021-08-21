import Josh from "@joshdb/core"
import provider from "@joshdb/sqlite"

const DB = new Josh({
	name: "MelonBot",
	provider,
})

  
export default class command {
	constructor(client) {
		this.client = client
		this.admin = true
	}

	async run(message, args) {
		if(args.length != 1) {
			this.client.sendMessage("Missing argument.")
			return
		}

		let bans = await DB.get("bans")

		if(!bans.includes(args[0])) {
			this.client.sendMessage("User " + args[0] + " isn't banned.")
		} else {
			bans = bans.filter(e => e != args[0])
			await DB.set("bans", bans)
			this.client.sendMessage("User " + args[0] + " has been unbanned. There are " + bans.length + " bans now.")
		}
	}
}