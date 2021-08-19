export default class command {
	constructor(client) {
		this.client = client
	}

	run(message) {
		this.client.sendMessage(`!! Now following ${message.user.name}!`)
		this.client.following = message.user.id
	}
}