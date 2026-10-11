import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const backend = path.join(root, "backend");
const frontend = path.join(root, "frontend");
const vite = path.join(frontend, "node_modules", "vite", "bin", "vite.js");

const pythonCandidates = [
  process.env.VIRTUAL_ENV
    ? path.join(process.env.VIRTUAL_ENV, "Scripts", "python.exe")
    : null,
  path.join(backend, "venv", "Scripts", "python.exe"),
  path.join(root, ".venv", "Scripts", "python.exe"),
].filter(Boolean);
const python = pythonCandidates.find(existsSync);

if (!python) {
  console.error(
    "Python virtual environment not found. Create one in backend\\venv and install backend\\requirements.txt."
  );
  process.exit(1);
}

if (!existsSync(vite)) {
  console.error(
    "Frontend dependencies not found. Run `npm install` from the frontend folder first."
  );
  process.exit(1);
}

const children = [];
let stopping = false;
let exitCode = 0;

function stop(code) {
  if (stopping) return;
  stopping = true;
  exitCode = code;
  for (const childProcess of children) {
    if (!childProcess.closed) childProcess.child.kill();
  }
}

function start(command, args, cwd, label) {
  const child = spawn(command, args, { cwd, stdio: "inherit" });
  const state = { child, closed: false };
  children.push(state);

  child.on("error", (error) => {
    console.error(`${label} failed to start: ${error.message}`);
    stop(1);
  });

  child.on("close", (code) => {
    state.closed = true;
    if (!stopping) {
      console.error(`${label} stopped${code ? ` with exit code ${code}` : ""}.`);
      stop(code || 1);
    }
    if (stopping && children.every((childProcess) => childProcess.closed)) {
      process.exit(exitCode);
    }
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

console.log("Starting CRM 360 backend and frontend. Press Ctrl+C to stop both.");
start(python, ["-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"], backend, "Backend");
start(process.execPath, [vite, "--host", "0.0.0.0"], frontend, "Frontend");
