$(() => {
	let gui = new Gui(disconnect, connect, (_) => {});
	let client;

	async function connect(ip, port) {
		disconnect();

		try {
			client = new Client(
				ip,
				port,
				(_, __) => {},
				(_) => {},
				disconnect
			);
			await client.init();

			gui.send = (msg) => Client.prototype.send_str.call(client, msg);

			// Create gui handler and add events to client
			client.setnick = (me) => (gui.nick = me);
			client.onmsg = (nick, content) => gui.recv_msg(nick, content);
			alert("Connected")
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	}

	async function disconnect() {
		if (client === null) {
			client = null;
			gui.disconnect = () => {};
			gui.send = () => {};
			gui.clear();
			gui.nick = "";
			gui.show_disconnect();

			alert("Disconnected");
		}
	}
});
