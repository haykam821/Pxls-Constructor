// Anonymous function to prevent Pxls.space
// from detecting any of the classes defined
// by this tool and handing out a shadow ban.
(() => {
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
                    return new Pixel(xIndex, yIndex, pixel);
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
    }

    function setUpGuide() {
        const x = prompt("X position for build?");
        const y = prompt("Y position for build?");
        try {
            const map = JSON.parse(prompt("A 2D array in JSON (the map) for the build?"));
            
            const build = new PixelBuild(x, y, map);
            build.placeAll();
        } catch (error) {
            alert("This JSON is malformed. Use createMap.js to make correct JSON.");
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