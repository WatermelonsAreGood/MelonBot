

import MidiPlayer from "midi-player-js"
import fs from "fs"
import { EventEmitter } from "events"

const getLastItem = thePath => thePath.substring(thePath.lastIndexOf("/") + 1)

export default class MidiManager extends EventEmitter {
	constructor(client) {
		super()
		
		const keymap = {"A0":"a-1","Bb0":"as-1","B0":"b-1","C1":"c0","Db1":"cs0","D1":"d0","Eb1":"ds0","E1":"e0","F1":"f0","Gb1":"fs0","G1":"g0","Ab1":"gs0","A1":"a0","Bb1":"as0","B1":"b0","C2":"c1","Db2":"cs1","D2":"d1","Eb2":"ds1","E2":"e1","F2":"f1","Gb2":"fs1","G2":"g1","Ab2":"gs1","A2":"a1","Bb2":"as1","B2":"b1","C3":"c2","Db3":"cs2","D3":"d2","Eb3":"ds2","E3":"e2","F3":"f2","Gb3":"fs2","G3":"g2","Ab3":"gs2","A3":"a2","Bb3":"as2","B3":"b2","C4":"c3","Db4":"cs3","D4":"d3","Eb4":"ds3","E4":"e3","F4":"f3","Gb4":"fs3","G4":"g3","Ab4":"gs3","A4":"a3","Bb4":"as3","B4":"b3","C5":"c4","Db5":"cs4","D5":"d4","Eb5":"ds4","E5":"e4","F5":"f4","Gb5":"fs4","G5":"g4","Ab5":"gs4","A5":"a4","Bb5":"as4","B5":"b4","C6":"c5","Db6":"cs5","D6":"d5","Eb6":"ds5","E6":"e5","F6":"f5","Gb6":"fs5","G6":"g5","Ab6":"gs5","A6":"a5","Bb6":"as5","B6":"b5","C7":"c6","Db7":"cs6","D7":"d6","Eb7":"ds6","E7":"e6","F7":"f6","Gb7":"fs6","G7":"g6","Ab7":"gs6","A7":"a6","Bb7":"as6","B7":"b6","C8":"c7"}

		this.midis = fs.readdirSync("./managers/midis/").map(e => e.split(".mid")[0])
		
		this.currentlyPlaying = ""
		this.currentlyRepeating = false

		let Player = new MidiPlayer.Player()

		Player.on("midiEvent", (event) => {
			if (event.name == "Note off" || (event.name == "Note on" && event.velocity === 0)) {
				client.sendPacket("n", {
					n: [{ 
						n: keymap[event.noteName], 
						s: 1 
					}], 
					t: Date.now() + 1000 
				})
			} else if (event.name == "Note on") {
				client.sendPacket("n", {
					n: [{ n: keymap[event.noteName], 
						v:  event.velocity / 127 }], 
					t: Date.now() + 1000 
				})
		
			} else if (event.name == "Set Tempo") {
				Player.setTempo(event.data)
			}
		})

		Player.on("fileLoaded", () => {
			this.emit("start", getLastItem(this.currentlyPlaying))
		})
		
		Player.on("endOfFile", () => {
			if(this.currentlyRepeating) {
				this.emit("repeated", getLastItem(this.currentlyPlaying))

				setTimeout(() => {
					this.player.play()
				}, 200)
			} else {
				this.emit("end", getLastItem(this.currentlyPlaying))
			}
		})

		Player.sampleRate = 0
		this.player = Player
	}

	play(file) {
		this.player.stop()

		this.currentlyPlaying = file
		
		this.player.loadFile(file)
		this.player.play()
	}

	stop() {
		this.player.stop()
		this.currentlyPlaying = false
	}

}

