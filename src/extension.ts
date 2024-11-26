import { commands, ExtensionContext } from "vscode";
import { TodoPanel } from "./panels/TodoPanel";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("vscode-todo.run", () => {
      TodoPanel.render(context.extensionUri);
    })
  );
}
