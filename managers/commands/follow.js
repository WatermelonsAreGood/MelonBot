export default class command {
	constructor(client) {
		this.client = client
	}

	run(message, args) {
		if(args.length == 0) {
			this.client.sendMessage(`!! Now following ${message.user.name}!`)
			this.client.following = message.user.id
		} else {
			if(this.client.users.has(args[0])) {
				const user = this.client.users.get(args[0])
				this.client.sendMessage(`Now following ${user.name}!`)
				this.client.following = user.id
			} else {
				this.client.sendMessage("Couldn't find user!")
			}
		}

	}
}