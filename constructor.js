const sleep = require("sleep-promise");
const waitUntil = require("async-wait-until");
const randInt = require("random-int");

async function forEachAsync(targetArray, callback) {
	for (const item of targetArray) {
		await callback(item);
	}
}

class Pixel {
	constructor(x, y, color) {
		this.position = {
			x: x,
			y: y,
		};
		this.color = color;
	}
	place() {
		ws.send({
			type: "pixel",
			color: this.color,
			x: this.position.x,
			y: this.position.y,
		});
	}
}
class PixelBuild {
	constructor(x, y, map) {
		this.position = {
			x: x,
			y: y,
		};

		this.map = map.map((row, yIndex) => {
			return row.map((pixel, xIndex) => {
				return new Pixel(x + xIndex, y + yIndex, pixel);
			});
		});
	}
	allPixels() {
		return [].concat(...this.map);
	}
	placeAll() {
		this.allPixels().forEach(pixel => {
			pixel.place();
		});
	}
	async placeAllTimed() {
		await forEachAsync(this.allPixels(), async pixel => {
			if (pixel.color !== null) {
				await waitUntil(hasCooledDown, 120000);
				await sleep(randInt(500, 2500));

				pixel.place();

				process.stdout.write("Cooled down!");
			}
		});
		process.stdout.write("All pixels have been placed!");
	}
}

const modes = {
	build: () => {
		const x = parseInt(prompt("X position for build?", 0));
		const y = parseInt(prompt("Y position for build?", 0));
		try {
			const map = JSON.parse(prompt("A 2D array in JSON (the map) for the build? You can generate this with Palette Image Mapper.", "[ [1, 2], [3, 4] ]"));

			const build = new PixelBuild(x, y, map);
			build.placeAllTimed();
		} catch (error) {
			alert("This JSON is malformed. Use Palette Image Mapper to make correct JSON.");
		}
	},
	random: () => {
		const colorPrompt = prompt("Which color pixel? (Color index or 'random')", "random");
		const board = document.getElementById("board");
		if (colorPrompt === "random") {
			setInterval(() => {
				new Pixel(randInt(board.width), randInt(board.height), randInt(0, 23)).place();
			});
		} else {
			const color = parseInt(colorPrompt);
			setInterval(() => {
				new Pixel(randInt(board.width), randInt(board.height), color).place();
			});
		}
	},
};

function setUpGuide() {
	const type = prompt("Pick a mode: " + Object.keys(modes).join(", "), "build");
	if (modes[type]) {
		return modes[type]();
	} else {
		alert("That's not a mode.");
	}
}

let cooldown = 0;

const randomUseragent = require("random-useragent");

const ws = require("ws");
const client = new ws("wss://pxls.space/ws/", [], {
	headers: {
		"Cookie": "pxls-token=6283|ZDNToTiOZaMKuqmqgyQwguNzImhBcQeZv",
		"User-Agent": randomUseragent.getRandom(),
	},
});
client.on("message", message => {
	const data = JSON.parse(message);
	if (data.type === "cooldown") {
		cooldown = (new Date()).getTime() + (data.wait * 1000);
	}
});

function hasCooledDown() {
	return cooldown < Date.now();
}