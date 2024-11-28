import {
  commands,
  ExtensionContext,
} from "vscode";

import { flakyMarker, onDeactivate as onFlakyMarkerDeactivated } from "./FlakyMarkerCommand";
import { todoListCommand } from "./TodoListCommand";
import { fixFlakyActionCommand } from "./FixFlakyActionCommand";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("FlakeManager.flakyMarker", flakyMarker),
    commands.registerCommand("vscode-todo.run", () => todoListCommand(context)),
  );
  fixFlakyActionCommand(context);
}

export function deactivate() {
  onFlakyMarkerDeactivated();
}
