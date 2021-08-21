export default class command {
	constructor(client) {
		this.client = client
	}

	run() {
		this.client.sendMessage("Stopped following!")
		this.client.following = ""
	}
}