import { marked } from "marked";
import { DemarkusClient } from "../../src/client/client";
import { DemarkusVerbs } from "../../src/protocol/verbs";
import TerminalRenderer from "marked-terminal";
import chalk from "chalk";

let markUrl = process.argv[2] || "mark://hub.demarkus.io/";

if(!markUrl.startsWith("mark://")) {
  markUrl = "mark://" + markUrl;
}

console.log("Fetching Demarkus Hub...");

const client = new DemarkusClient();

const response = await client.requestOnConn(markUrl, DemarkusVerbs.FETCH);

marked.setOptions({
  renderer: new TerminalRenderer({
    codespan: chalk.bgGray.white, // In-line code with background
    heading: chalk.bold.bgMagenta.white,    // Cyan bold headers
    strong: chalk.bold.yellow,  // Bright yellow bold text
    listitem: chalk.magenta,    // Magenta bullets
    table: chalk.gray,          // Subtle table borders
    emoji: true                 // Support for :rocket:
  }) as any
});

console.log(marked.parse(response.body));