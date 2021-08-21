export default class command {
	constructor(client) {
		this.client = client
	}

	run(message, args) {
		if(this.client.midi.midis.includes(args[0])) {
			this.client.midi.play(`./managers/midis/${args[0]}.mid`)
		} else {
			this.client.sendMessage("Could not find MIDI.")
		}
	}
}