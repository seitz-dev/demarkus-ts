import { marked } from "marked";
import { DemarkusClient } from "../../src/client/client";
import { DemarkusVerbs, type DemarkusVerb } from "../../src/protocol/verbs";
import TerminalRenderer from "marked-terminal";
import chalk from "chalk";
import { parseArgs } from "util";

// setup params, first real positional argument is the URL, otherwise default to hub, if --method is provided, use that instead of FETCH
const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    method: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

let markUrl = positionals[2] || "mark://hub.demarkus.io/";

if(!markUrl.startsWith("mark://")) {
  markUrl = "mark://" + markUrl;
}

if(values.method){
  if(!Object.values(DemarkusVerbs).includes(values.method as any)) {
    console.error(`Invalid method ${values.method}. Valid methods are: ${Object.values(DemarkusVerbs).join(", ")}`);
    process.exit(1);
  }
}

console.log("Fetching Demarkus Hub...");

const client = new DemarkusClient();

const response = await client.request(markUrl, (values.method as DemarkusVerb) || DemarkusVerbs.FETCH);

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