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
			this.client.sendMessage("!! Missing argument.")
			return
		}

		const bans = await DB.get("bans")

		if(bans.includes(args[0])) {
			this.client.sendMessage("!! User " + args[0] + " is already banned.")
		} else {
			bans.push(args[0])
			await DB.set("bans", bans)

			if(this.client.crown && this.client.users.has(args[0])) {
				this.client.sendPacket("kickban", {
					_id: args[0],
					ms: 3600000,
				})
			}
			this.client.sendMessage("!! User " + args[0] + " now banned. There are " + bans.length + " bans now.")
		}
	}
}