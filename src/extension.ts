import { commands, ExtensionContext } from "vscode";
import {
  flakyMarker,
  onDeactivate as onFlakyMarkerDeactivated,
} from "./FlakyMarkerCommand";
import { todoListCommand } from "./TodoListCommand";
import { fixFlakyActionCommand } from "./FixFlakyActionCommand";
import { setFlakyTestsOnInit } from "./data-fetcher";
import dotenv from "dotenv";

import path from "path";



export async function activate(context: ExtensionContext) {
  // load environment variables
  const envPath = path.join(context.extensionPath, '.env');
  dotenv.config({ path: envPath });
  const token = process.env.SLAUTH_TOKEN!;

  await setFlakyTestsOnInit(token, context);
  context.subscriptions.push(
    commands.registerCommand("FlakeManager.flakyMarker", flakyMarker),
    commands.registerCommand("vscode-todo.run", () => todoListCommand(context))
  );
  fixFlakyActionCommand(context);
}

export function deactivate() {
  onFlakyMarkerDeactivated();
}