class Client {
	constructor(ip, port, onmsg, setnick, disconnect) {
		this.ip = ip;
		this.port = port;
		this.addr = (ip, port);
		this.onmsg = onmsg;
		this.setnick = setnick;
		this.disconnect = disconnect;
	}

	async init() {
		this.asym = await Asymmetric.new();
		this.socket = new WebSocket(`ws://${this.ip}:${this.port}/`);

		this.socket.onopen = async (_) => {
			console.log('opened');
			this.socket.onmessage = async (event) => {
				if (!this.remote_key) {
					this.remote_key = true;
					const key_bytes = await new Response(event.data).arrayBuffer();
					this.remote_key = await Asymmetric.import(key_bytes);
				} else if (!this.sym) {
					const key_data = await this.asym.decrypt(
						await new Response(event.data).arrayBuffer()
					);
					this.sym = new Symmetric(key_data);
					console.log(this.sym);
				} else {
					const text_en = await new Response(event.data).arrayBuffer();
					const text_byte = await this.sym.decrypt(text_en);
					const text = new TextDecoder("UTF-8").decode(text_byte);
					console.log(`text: ${text}`);
					const [me, nick, content] = text.split(NAME_SPLITTER);
					this.onmsg(nick, content);

					this.setnick(me);
				}

				return false;
			};

			const exported_key = await this.asym.export_public();
			this.socket.send(exported_key);
		};

		this.socket.onclose = (_) => {
			this.disconnect();
		}
	}

	async send(msg) {
		await this.socket.send(msg);
	}

	async send_str(msg) {
		console.log(this);
		const array_msg = new TextEncoder("utf-8").encode(msg);
		// const encrypted = await this.remote_key.encrypt(array_msg);
		const encrypted = await this.sym.encrypt(array_msg);
		// console.log(`encryped: ${encrypted}`);
		await this.socket.send(encrypted);
	}
}
