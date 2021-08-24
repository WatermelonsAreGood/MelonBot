import { Client, Intents, Util } from "discord.js"

import EventEmitter from "events"

export default class DiscordManager extends EventEmitter {
	constructor(token) {
		super()

		this.client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] })

		this.client.on("messageCreate", async  message => {
			if(message.author.bot) return

			if(message.channel.parentId) {
				const category = await message.guild.channels.fetch(message.channel.parentId)
				const findChannels = this.categoryToChannel.get(category)

				if(findChannels) {
					const findClient = this.clients.get(message.channel.name  + category.name.toLowerCase())

					if(!findClient) {
						console.log("Couldn't find client. " + message.channel.name + "/"+category.name+" probably broken.")
						return
					}

					findClient.sendMessage(`[discord.gg/DgAHFKBw44] ${message.author.username}#${message.author.discriminator}: ${message.content}`)
				}
			}	
		})

		this.client.on("ready", () => {
			let [guild] = this.client.guilds.cache.values()
			
			this.guild = guild

			this.emit("ready")
		})

		this.buffer = [] /* Array<Object<server, channel, content>> */

		this.clients = new Map() /* String, client */
		this.categoryToChannel = new Map() /* category, Array<channel> */
		
		this.on("connected", (clientt, data) => {
			this.clients.set(data.toLowerCase().replaceAll(" ", "-").replaceAll("'", "").replaceAll("/","") , clientt)
		})

		setInterval(() => {
			if(this.buffer.length == 0) return
			this.buffer.forEach(async s => {
				let findCategory = this.guild.channels.cache.find(e => e.name == s.server.name && e.type == "GUILD_CATEGORY")
        
				if(!findCategory) {
					console.log("Couldn't send message for " + s.server.ws + ". Couldn't find category.")
					return
				}
		
				let findChannel = this.categoryToChannel.get(findCategory).find(e => e.name == s.channel.toLowerCase().replaceAll(" ", "-").replaceAll("'", "").replaceAll("/","")  && e.type == "GUILD_TEXT")
				
				if(!findChannel) {
					console.log("Couldn't send message for " + s.channel + " " + s.server.ws + ". Couldn't find channel.")
					return
				}
				
				try {
					Util.splitMessage(s.content.join("\n")).forEach(async l => {
						await findChannel.send(l)
					})
				} catch(error) {
					console.log("Failed to send a message. This is nothing to worry about usually. " + error)
				}
			})

			this.buffer = []
		}, 600)
		
		this.client.login(token)
	}


	async createBridgeChannels(server) {
		let findCategory = this.guild.channels.cache.find(e => e.name == server.name && e.type == "GUILD_CATEGORY")
		
		if(!findCategory) {
			findCategory = await this.guild.channels.create(server.name, {"type": "GUILD_CATEGORY"})
		}

		const populateChannels = []

		server.channels.forEach(async channel => {
			let findChannel = this.guild.channels.cache.find(e => e.name == channel.toLowerCase().replaceAll(" ", "-").replaceAll("'", "").replaceAll("/","")  && e.type == "GUILD_TEXT" && e.parent == findCategory)

			if(!findChannel) {
				findChannel = await this.guild.channels.create(channel, {"type": "GUILD_TEXT"})
				findChannel.setParent(findCategory)
			}

			populateChannels.push(findChannel)
		})

		this.categoryToChannel.set(findCategory, populateChannels)
	}

	async recieveMessage(server, channel, message) {
		this.sendRaw(server, channel, `\`${message.user._id.slice(0, 6)}\` ${message.user.name}: ${message.content}`)
	}

	async sendRaw(server, channel, content) {
		const bufferElement  = this.buffer.find(e => e.server == server)
		
		if(bufferElement) {
			bufferElement.content.push(content)
			
			this.buffer = this.buffer.filter(e => e.server != server)
			this.buffer.push(bufferElement)
		} else {
			this.buffer.push({server, channel, content: [ content ]})
		}

	}
}