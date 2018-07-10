// Anonymous function to prevent Pxls.space
// from detecting any of the classes defined
// by this tool and handing out a shadow ban.
(() => {
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
			App.color(this.color);
			App.place(this.position.x, this.position.y);
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
					await waitUntil(() => {
						return App.cooledDown();
					}, 120000);
					await sleep(randInt(500, 2500));
					pixel.place();
					console.log("Cooled down!");
				}
			});
			console.log("All pixels have been placed!");
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
	setUpGuide();
})();

/*
Example map
[
    [4, 5, 6],
    [7, 8, 9]
]
*/