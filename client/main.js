$(() => {
	let gui = new Gui(disconnect, connect, (_) => {});
	let client;

	async function connect(ip, port) {
		disconnect()

		client = new Client(
			ip,
			port,
			(_, __) => {},
			(_) => {},
			disconnect
		);

		await client.init();

		gui.send = (msg) => Client.prototype.send_str.call(client, msg)
 
		// Create gui handler and add events to client
		client.setnick = (me) => (gui.nick = me);
		client.onmsg = (nick, content) => gui.recv_msg(nick, content);
	}

	async function disconnect() {
		client = null;
		gui.disconnect = () => {};
		gui.send = () => {};
		gui.clear();
		gui.nick = "";

		alert("Disconnected");
	}
});
