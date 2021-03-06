const sleep = require("sleep-promise");
const waitUntil = require("async-wait-until");
const randInt = require("random-int");

async function forEachAsync(targetArray, callback) {
	for (const item of targetArray) {
		await callback(item);
	}
}

const debug = require("debug")("pxls-constructor");

// we are using this for regular output, so always enable it
debug.enabled = true;

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
		this.client.send(JSON.stringify({
			type: "pixel",
			color: this.color,
			x: this.position.x,
			y: this.position.y,
		}));
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
	async placeAllTimed(watch) {
		await forEachAsync(this.allPixels(), async pixel => {
			if (pixel.color !== null) {
				await waitUntil(hasCooledDown, 120000);
				await sleep(randInt(500, 2500));

				pixel.place();

				debug("Cooled down!");
			}
		});
		if (watch) {
			debug("Watching again.");
			this.placeAllTimed(watch);
		} else {
			debug("All pixels have been placed!");
		}
	}
}

let cooldown = 0;

const version = require("./package.json").version;

const ws = require("ws");

function hasCooledDown() {
	return cooldown < Date.now();
}

function makeClient(token) {
	const client = new ws("wss://pxls.space/ws/", [], {
		headers: {
			"Cookie": "pxls-token=" + token,
			"User-Agent": `Pxls-Constructor v${version}`,
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

/**
 * Makes a 2D array filled with a specific value.
 * @param {number} width The width of the 2D array.
 * @param {number} height The height of the 2D array.
 * @param {number} value The value to fill the 2D array with.
 */
function rectArray(width, height, value) {
	return new Array(height).fill(new Array(width).fill(value));
}

const yargonaut = require("yargonaut");

yargonaut.helpStyle("green");
yargonaut.errorsStyle("red");

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
	builder.option("watch", {
		description: "If true, repeats the building after all pixels were placed.",
		type: "boolean",
	});
}, argv => {
	const client = makeClient(argv.token);
	try {
		const map = JSON.parse(argv.art);

		const build = new PixelBuild(argv.x, argv.y, map, client);
		build.placeAllTimed(argv.watch);
	} catch (error) {
		process.stderr.write("This JSON is malformed. Use Palette Image Mapper to make correct JSON.\n");
	}
});
yargs.command("fill", "Fills a rectangular space with a single color.", builder => {
	builder.option("x", {
		description: "The X position of the rectangle.",
		type: "number",
		default: 0,
	});
	builder.option("y", {
		description: "The Y position of the rectangle.",
		type: "number",
		default: 0,
	});
	builder.option("width", {
		description: "The width of the rectangle.",
		type: "number",
		default: 5,
	});
	builder.option("height", {
		description: "The height of the rectangle.",
		type: "number",
		default: 5,
	});
	builder.option("color", {
		description: "The color index of the rectangle.",
		type: "number",
		default: 0,
	});
	builder.option("watch", {
		description: "If true, repeats the filling after all pixels were placed.",
		type: "boolean",
	});
}, argv => {
	const client = makeClient(argv.token);

	const rect = rectArray(argv.width, argv.height, argv.color);

	const build = new PixelBuild(argv.x, argv.y, rect, client);
	build.placeAllTimed(argv.watch);
});
yargs.command("random", "Be an annoyance and randomly place pixels.", builder => {
	builder.command("specific", "Places a specific color at random positions.", {
		color: {
			description: "The color index to place.",
			default: 0,
			type: "number",
		},
	}, argv => {
		const color = parseInt(argv.color);
		setInterval(() => {
			new Pixel(randInt(1000), randInt(1000), color).place();
		});
	});
	builder.command("all", "Places random colors randomly.", {}, () => {
		setInterval(() => {
			new Pixel(randInt(1000), randInt(1000), randInt(0, 23)).place();
		});
	});
});

yargs.env("PXLS_CONSTRUCTOR");
yargs.wrap(yargs.terminalWidth());

yargs.argv;