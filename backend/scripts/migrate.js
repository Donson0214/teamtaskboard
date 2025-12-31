const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const args = process.argv.slice(2);
const acceptDataLoss = args.includes("--accept-data-loss");

const run = (command) => {
  execSync(command, { stdio: "inherit", cwd: root });
};

try {
  run("npx prisma generate");
  const pushCommand = `npx prisma db push${acceptDataLoss ? " --accept-data-loss" : ""}`;
  run(pushCommand);
} catch (err) {
  process.exitCode = 1;
}
