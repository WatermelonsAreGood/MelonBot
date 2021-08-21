export default class command {
	constructor(client) {
		this.client = client
		this.admin = true
	}

	async run(message, args) {
		
		try {
			const result = eval(args.join(" "))
			this.client.sendMessage(`✔️ ${result}`)
		} catch(error) {
			this.client.sendMessage(`❌ ${error.toString().split("\n")[0]}`)
		}

	}
}