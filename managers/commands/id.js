export default class command {
	constructor(client) {
		this.client = client
	}

	run(message) {
		this.client.sendMessage(`_ID ${message.user._id}${message.user._id != message.user.id ? ` | ID ${message.user.id}` : ""}`)
	}
}