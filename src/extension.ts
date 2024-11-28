import { commands, ExtensionContext } from "vscode";
import {
  flakyMarker,
  onDeactivate as onFlakyMarkerDeactivated,
} from "./FlakyMarkerCommand";
import { todoListCommand } from "./TodoListCommand";
import { fixFlakyActionCommand } from "./FixFlakyActionCommand";
import { setFlakyTestsOnInit } from "./data-fetcher";

export async function activate(context: ExtensionContext) {
  await setFlakyTestsOnInit(context);
  context.subscriptions.push(
    commands.registerCommand("FlakeManager.flakyMarker", flakyMarker),
    commands.registerCommand("vscode-todo.run", () => todoListCommand(context))
  );
  fixFlakyActionCommand(context);
}

export function deactivate() {
  onFlakyMarkerDeactivated();
}
