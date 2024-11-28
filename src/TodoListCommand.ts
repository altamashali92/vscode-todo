import { ExtensionContext } from "vscode";
import { TodoPanel } from "./panels/TodoPanel";


export const todoListCommand = (context: ExtensionContext) => TodoPanel.render(context.extensionUri);