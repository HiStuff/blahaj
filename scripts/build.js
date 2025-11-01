import fs from "fs";
import readline from "readline";
import path from "path";
import cp from "child_process";
import yazl from "yazl";
import { randomUUID } from "crypto";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const stuffToCopy = [
	"versionfile",
	"package-lock.json",
	"package.json",
	"LICENSE",
	"assets",
	"lang",
	"prisma/schema.prisma",
	"buildinfo.json",
];

let buildOptions = {
	withDatabase: {
		question: "Include database?",
		value: true,
	},
	withDatabaseClient: {
		question: "Include database client?",
		value: true,
	},
	withConfigFile: {
		question: "Include config?",
		value: true,
	},
	withEnvironmentFile: {
		question: "Include .env file?",
		value: true,
	},
};

const yesAnswers = ["yes", "y", "true"];

const noAnswers = ["no", "n", "false"];

const __dirname = import.meta.dirname;
const rootFolderPath = path.join(__dirname, "../");
const buildFolderPath = path.join(__dirname, "../build");

async function question(key) {
	return new Promise((resolve, reject) => {
		const option = buildOptions[key];
		rl.question(
			`${option.question} Default value: ${option.value ? "Yes" : "No"}\nAnswer: `,
			(answer) => {
				if (yesAnswers.includes(answer.toLowerCase())) {
					buildOptions[key].value = true;
					resolve();
				} else if (noAnswers.includes(answer.toLowerCase())) {
					buildOptions[key].value = false;
					resolve();
				} else {
					resolve();
				}
			},
		);
	});
}

function getListOfFilesInDirectory(dirPath) {
	let list = [];
	fs.readdirSync(dirPath, { withFileTypes: true }).forEach((piece) => {
		if (piece.isFile()) {
			list.push(path.join(piece.parentPath, piece.name));
		} else {
			list = list.concat(
				getListOfFilesInDirectory(
					path.join(piece.parentPath, piece.name),
				),
			);
		}
	});
	return list;
}

async function run() {
	for (const option of Object.keys(buildOptions)) {
		await question(option);
	}
	const buildStart = new Date();
	console.log("Removing build folder...");
	fs.rmSync(buildFolderPath, { recursive: true, force: true });
	console.log("Building (Executing tsc)...");
	try {
		cp.execSync("npx tsc");
	} catch (err) {
		console.log(`Build failed! ${err}`);
	}
	fs.rmSync(path.join(buildFolderPath, "config.json"));
	console.log("Copying...");
	if (buildOptions.withDatabase.value) {
		fs.cpSync(
			path.join(rootFolderPath, "prisma/dev.db"),
			path.join(buildFolderPath, "prisma/dev.db"),
			{ recursive: true },
		);
	}
	if (buildOptions.withDatabaseClient.value) {
		fs.cpSync(
			path.join(rootFolderPath, "prisma/client"),
			path.join(buildFolderPath, "prisma/client"),
			{ recursive: true },
		);
	}
	if (buildOptions.withConfigFile.value) {
		fs.cpSync(
			path.join(rootFolderPath, "config.json"),
			path.join(buildFolderPath, "config.json"),
		);
	}
	if (buildOptions.withEnvironmentFile.value) {
		fs.cpSync(
			path.join(rootFolderPath, ".env"),
			path.join(buildFolderPath, ".env"),
		);
	}
	stuffToCopy.forEach((thing) => {
		fs.cpSync(
			path.join(rootFolderPath, thing),
			path.join(buildFolderPath, thing),
			{ recursive: true },
		);
	});
	const buildEnd = new Date();

	console.log("Updating buildinfo.json...");
	const buildInfoPath = path.join(buildFolderPath, "buildinfo.json");
	let buildInfoContent = JSON.parse(fs.readFileSync(buildInfoPath));
	buildInfoContent.build_date = buildEnd;
	fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfoContent));

	console.log(`Build successful in ${buildEnd - buildStart}ms.`);

	console.log("Compressing into update.zip...");
	const updateZip = new yazl.ZipFile();
	getListOfFilesInDirectory(buildFolderPath).forEach((file) => {
		updateZip.addFile(file, path.relative(buildFolderPath, file));
	});
	updateZip.end();
	updateZip.outputStream.pipe(
		fs
			.createWriteStream(path.join(buildFolderPath, `update.zip`))
			.on("close", function () {
				console.log("Compressed into update.zip.");
				process.exit();
			}),
	);
}

run();
