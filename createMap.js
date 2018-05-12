const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const getter = require("pixel-getter");
const sizeOf = require("buffer-image-size");

fs.readFile(path.normalize("./image.png"), (error, data) => {
    if (error) { 
        const errorOutput = (() => {
            switch (error.code) {
                case "EACCES":
                    return "Access permission was denied for the file."
                case "ENOENT":
                    return "The file couldn't be found.";
                default:
                    return error.message;
            }
        })();
        process.stdout.write(chalk.red(`Error: ${errorOutput}\n`));
    } else {
        console.log(data)
        getter.get(data, (error, pixels) => {
            //console.log(pixels);
        });
    }
});