export default class command {
	constructor(client) {
		this.client = client
		this.admin = true
	}

	async run(message) {

		if(this.client.crown) {
			this.client.sendPacket("chown", {
				"id": message.user.id
			})

			this.client.sendMessage("Crown given.")
		} else {
			this.client.sendMessage("I don't have the crown.")
		}
	}
}