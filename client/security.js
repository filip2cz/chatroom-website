class Asymmetric {
	public = null;
	private = null;

	static async new() {
		const key = new Asymmetric();

		const pair = await window.crypto.subtle.generateKey(
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
				modulusLength: 2048,
				publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
			},
			true,
			["decrypt", "encrypt"]
		);
		key.private = pair.privateKey;
		key.public = pair.publicKey;

		return key;
	}

	static async import(public_key, private_key) {
		public_key = await window.crypto.subtle.importKey(
			"spki",
			public_key,
			{ name: "RSA-OAEP", hash: "SHA-256" },
			true,
			["encrypt"]
		);
		let key = new Asymmetric();
		key.public = public_key;
		if (private_key) {
			key.private = await window.crypto.subtle.importKey(
				"spki",
				private_key,
				{ name: "RSA-OAEP", hash: "SHA-256" },
				true,
				["encrypt"]
			);
		}

		return key;
	}

	async export_public() {
		return await window.crypto.subtle.exportKey("spki", this.public);
	}

	async encrypt(msg) {
		return await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, this.public, msg);
	}

	async decrypt(msg) {
		return await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, this.private, msg);
	}
}

class Symmetric {
	key = null;
	constructor(key) {
		if (key) {
			this.key = key;
		} else {
			this.key = window.crypto.getRandomValues(new Uint8Array(16));
		}
	}

	async encrypt(msg) {
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const alg = { name: "AES-GCM", iv: iv };
		const aes = await crypto.subtle.importKey("raw", this.key, alg, false, ["encrypt"]);
		// return iv + await crypto.subtle.encrypt(alg, aes, msg);
		return appendBuffer(iv, await crypto.subtle.encrypt(alg, aes, msg));
	}

	async decrypt(msg) {
        // console.log('getting iv');
		const iv = msg.slice(0, 12);
        // console.log('getting tag');
		// const tag = msg.slice(msg.byteLength - ((128 + 7) >> 3));
		// msg = msg.slice(12 + 16);
		msg = msg.slice(12);
		const alg = { name: "AES-GCM", iv: iv };
		const aes = await crypto.subtle.importKey("raw", this.key, alg, false, ["decrypt"]);

		return await crypto.subtle.decrypt(alg, aes, msg);
	}
}

function appendBuffer(buffer1, buffer2) {
	var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	tmp.set(new Uint8Array(buffer1), 0);
	tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
	return tmp;
}
