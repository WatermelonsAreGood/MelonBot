import { EventEmitter } from "events"
import WebSocket from "ws"
import Josh from "@joshdb/core"
import provider from "@joshdb/sqlite"

import MidiManager from "./MidiManager.js"
import DVDManager from "./DVDManager.js"

const DB = new Josh({
	name: "MelonBot",
	provider,
})

export default class ClientManager extends EventEmitter {

	constructor(url, token) {
		super()

		this.url = url
		this.token = token
		this.crown = false
		this.following = ""
		this.users = new Map()
		this.midi = new MidiManager(this)
		this.dvd = new DVDManager({})

		this.ws = new WebSocket(this.url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
			}
		})
		
		this.midi.on("end", song => {
			this.sendMessage(`${song} ended.`)
		})
		
		this.midi.on("start", song => {
			this.sendMessage(`${song} started.`)
		})

		this.ws.on("open", () => {
			setInterval(() => {
				this.sendPacket("t", {
					e: Date.now()
				})
			}, 15000)
			
			this.sendPacket("hi", {
				token: this.token,
			})

			this.dvd.on("update", () => {
				if(!this.midi.player.isPlaying() && !this.following) {
					this.sendPacket("m", {x: this.dvd.pos.x, y: this.dvd.pos.y})
				}
			})
		})

		this.ws.on("message", async message => {
			let packet
			try {
				packet = JSON.parse(message.toString())[0]
			} catch {
				return
			}

			switch(packet.m) {
			case "hi":
				this.user = packet.u
				this.emit("ready")
				break
			case "a":
				this.emit("message", {
					content: packet.a,
					user: packet.p
				})
				break
			case "ch": {
				this.users = new Map()
				const bans = await DB.get("bans")
				
				if(packet.ch.crown) {
					this.crown = packet.ch.crown.userId == this.user._id
				} else {
					this.crown = false
				}
				
				packet.ppl.forEach(u => {
					this.users.set(u._id, u)
					
					if(this.crown && bans.includes(u._id)) {
						this.sendPacket("kickban", {
							_id: u._id,
							ms: 3600000,
						})
					}

					if(u._id == this.user._id) {
						this.user = u
					}
				})
				
				break
			}
			case "p": {
				this.users.set(packet._id, packet)

				const bans = await DB.get("bans")
				
				if(this.crown && bans.includes(packet._id)) {
					this.sendPacket("kickban", {
						_id: packet._id,
						ms: 3600000,
					})
				} else {
					if(!this.users.has(packet._id))
						this.emit("join", packet)
				}
				break
			}
			case "bye": {
				const usr = this.users.get(packet.p);
				
				if(usr)
					this.emit("leave", usr)

				this.users.delete(packet.p)
				break
			}
			case "m":
				if(this.following == packet.id) {
					this.sendPacket("m", {
						...packet 
					})
				}
				break
			}

		})

		this.ws.on("close", (code, reason) => {
			this.emit("end", `${code} - ${reason}`)
		})

		this.ws.on("error", e => {
			console.log(e)
		})
	}

	setUsername(name) {
		this.sendPacket("userset", {
			set: {
				name
			}
		})
	}
	setChannel(_id) {
		this.sendPacket("ch", {
			_id,
			set: {
				visible: true
			}
		})
	}

	sendMessage(message) {
		this.sendPacket("a", {
			message,
		})
	}
	
	sendPacket(m, packet) {
		this.ws.send(JSON.stringify([{
			m,
			...packet
		}]))
	}

}

