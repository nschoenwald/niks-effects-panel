import { MODULE_ID } from "./constants.js";

/**
 * Simple logger that prepends the package name if the data is a string
 *
 * @param {string|*} data - The data to log
 */
export function log(data) {
    if (typeof data === "string") {
        console.log(`${MODULE_ID} | ${data}`);
    } else {
        console.log(data);
    }
}
