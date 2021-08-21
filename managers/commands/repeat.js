export default class command {
	constructor(client) {
		this.client = client
	}

	run() {
		this.client.midi.currentlyRepeating = !this.client.midi.currentlyRepeating
		this.client.sendMessage((this.client.midi.currentlyRepeating ? "Turned on `repeating` mode. " : "Turned off repeating mode."))
	}
}