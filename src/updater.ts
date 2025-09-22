import fs from "fs";
import path from "node:path";
import * as log from "./utils/logger.js";
import { IVersion } from "./types.js";
import unzipper from "unzipper";

const __dirname = import.meta.dirname;

let deployed = true;
if (process.argv[2] == "--development") {
    deployed = false;
}

export function getVersion() {
    const versionFileContent = fs.readFileSync(path.join(__dirname, "../versionfile"));
    const versionRaw = versionFileContent.toString().split("|");
    return { name: versionRaw[0], codename: versionRaw[1], color: versionRaw[2] } as IVersion;
}
export async function update(buffer?: Buffer, exit_on_update: boolean = true) {
    log.warn("Update issued.");
    if (!deployed) { log.warn(`You can't update the development version of the bot!`); return; };
    const updatePath = path.join(__dirname, "../update.zip");
    const tempUpdatePath = path.join(__dirname, "../temp/update");
    if (buffer || fs.existsSync(updatePath)) {
        log.warn(`Extracting update from ${buffer ? "buffer" : updatePath}...`);
        let dir;
        if (buffer) {
            dir = await unzipper.Open.buffer(buffer);
        } else {
            dir = await unzipper.Open.file(updatePath);
        }
        if (fs.existsSync(tempUpdatePath)) { fs.rmSync(tempUpdatePath, { recursive: true, force: true }) };
        await dir.extract({ path: tempUpdatePath });
        log.warn(`Updating...`);
        fs.cpSync(tempUpdatePath, path.join(__dirname, "../"), { recursive: true });
        log.success("Updated! Cleaning up...");
        fs.rmSync(tempUpdatePath, { recursive: true, force: true });
        if (fs.existsSync(updatePath)) fs.rmSync(updatePath);
        if (exit_on_update) {
            log.warn("Exiting...");
            process.exit();
        }
        return true;
    } else {
        log.warn(`Update isn't present at buffer or ${updatePath}!`);
    }
    return false;
}

update();