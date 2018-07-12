const sleep = require("sleep-promise");
const waitUntil = require("async-wait-until");
const randInt = require("random-int");

async function forEachAsync(targetArray, callback) {
	for (const item of targetArray) {
		await callback(item);
	}
}

class Pixel {
	constructor(x, y, color, client) {
		this.position = {
			x: x,
			y: y,
		};
		this.color = color;
		this.client = client;
	}
	place() {
		this.client.send({
			type: "pixel",
			color: this.color,
			x: this.position.x,
			y: this.position.y,
		});
	}
}
class PixelBuild {
	constructor(x, y, map, client) {
		this.position = {
			x: x,
			y: y,
		};
		this.client = client;

		this.map = map.map((row, yIndex) => {
			return row.map((pixel, xIndex) => {
				return new Pixel(x + xIndex, y + yIndex, pixel, client);
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

				process.stdout.write("Cooled down!\n");
			}
		});
		process.stdout.write("All pixels have been placed!\n");
	}
}

let cooldown = 0;

const randomUseragent = require("random-useragent");

const ws = require("ws");

function hasCooledDown() {
	return cooldown < Date.now();
}

function makeClient(token) {
	const client = new ws("wss://pxls.space/ws/", [], {
		headers: {
			"Cookie": token,
			"User-Agent": randomUseragent.getRandom(),
		},
	});
	client.on("message", message => {
		const data = JSON.parse(message);
		if (data.type === "cooldown") {
			cooldown = (new Date()).getTime() + (data.wait * 1000);
		}
	});

	return client;
}

const yargs = require("yargs");

yargs.option("token", {
	description: "The token for authentication with Pxls.",
	demandOption: true,
});

yargs.command("build", "Builds art via a 2D array.", builder => {
	builder.option("x", {
		description: "The X position of the art.",
		type: "number",
		default: 0,
	});
	builder.option("y", {
		description: "The Y position of the art.",
		type: "number",
		default: 0,
	});
	builder.option("art", {
		description: "A 2D array in JSON format representing the art you would like to build.",
		type: "string",
		demandOption: true,
	});
}, argv => {
	const client = makeClient(argv.token);
	try {
		const map = JSON.parse(argv.art);

		const build = new PixelBuild(argv.x, argv.y, map, client);
		build.placeAllTimed();
	} catch (error) {
		process.stderr.write("This JSON is malformed. Use Palette Image Mapper to make correct JSON.\n");
	}
});
yargs.command("random", "Be an annoyance and randomly place pixels.", builder => {
	builder.option("color", {
		description: "The color to place, or 'random'.",
		default: "random",
	});
}, argv => {
	if (argv.color === "random") {
		setInterval(() => {
			new Pixel(randInt(1000), randInt(1000), randInt(0, 23)).place();
		});
	} else {
		const color = parseInt(argv.color);
		setInterval(() => {
			new Pixel(randInt(1000), randInt(1000), color).place();
		});
	}
});

yargs.argv;