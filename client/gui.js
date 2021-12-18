class Gui {
	constructor(disconnect, connect, send) {
		this.textarea = $(".text-area");
		this.nickarea = $(".nick-area");
		this.msgarea = $("#msg-inp");
		this.ip_input = $(".ip-input");
		this.port_input = $(".port-input");
		this.disconnect = disconnect;
		this.connect = connect;
		this.input_color = "purple";
		this.input_color_invalid = "red";
		this.connect_button = $(".connect-button");
		// this.client = client;
		this.send = send;
		this.msgarea.on("keydown", (e) => {
			if (e.key == "Enter") this.send_msg(this.msgarea.val());
		});

		this.ip_input.on("input propertyChange", async (e) => {

			this.check_ip(e.target.value);
		});

		this.port_input.on("input propertyChange", async (e) => {

			this.check_port(e.target.value);
		});

		this.connect_button.on("click", (ev) => {
			if (this.check_legal()) {
				this.connect(this.ip_input.val(), this.port_input.val());
			} else {
				alert("Invalid Parameters");
			}
		});
	}

	check_legal() {
		return this.check_ip() & this.check_port();
	}

	check_port(port) {
		if (!port) port = this.port_input.val();
		const portre = /^\d{2,6}$/;
		const islegal = portre.test(port);
		if (islegal) {
			this.port_input.css("border-color", this.input_color);
		} else {
			this.port_input.css("border-color", this.input_color_invalid);
		}

		return islegal;
	}
	check_ip(ip) {
		if (!ip) ip = this.ip_input.val();
		const ipre = /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/;
		const islegal = ipre.test(ip);
		if (islegal) {
			this.ip_input.css("border-color", this.input_color);
		} else {
			this.ip_input.css("border-color", this.input_color_invalid);
		}

		return islegal;
	}

	recv_msg(nick, msg) {
		console.log("recv msg");
		this.textarea.html(
			this.textarea.html() + `<span class="msg-nick">${nick}</span> > ${msg}<br>`
		);
	}

	get nick() {
		return this.nickarea.text();
	}

	set nick(value) {
		this.nickarea.text(value);
	}

	clear() {
		this.textarea.html("");
	}

	async send_msg(msg) {
		await this.send(msg);
		this.msgarea.val("");
	}
}
