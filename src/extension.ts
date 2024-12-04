import { commands, ExtensionContext, window, WebviewPanel, workspace } from "vscode";
import {
  flakyMarker,
  onDeactivate as onFlakyMarkerDeactivated,
} from "./FlakyMarkerCommand";
import { todoListCommand } from "./TodoListCommand";
import { fixFlakyActionCommand } from "./FixFlakyActionCommand";
import { setFlakyTestsOnInit } from "./data-fetcher";
import dotenv from "dotenv";

import path from "path";
import { getQuarantinedTests } from "./api";
import { FlakyTestsPanel } from "./panels/FlakyTestsPanel";



export async function activate(context: ExtensionContext) {
  // load environment variables
  const envPath = path.join(context.extensionPath, '.env');
  dotenv.config({ path: envPath });
  const token = process.env.SLAUTH_TOKEN!;

  await setFlakyTestsOnInit(token, context);
  context.subscriptions.push(
    commands.registerCommand("FlakeManager.flakyMarker", flakyMarker),
    commands.registerCommand("vscode-todo.run", () => todoListCommand(context)),
    commands.registerCommand("FlakeManager.detectFlakyTests", async () => {

      const token = process.env.SLAUTH_TOKEN!;
      const flakyTests = await getQuarantinedTests(token, 'jira', 'jest-unit');
      FlakyTestsPanel.createOrShow(context.extensionUri, flakyTests);

    })
  );
  fixFlakyActionCommand(context);


  // Handle messages from webview
  window.registerWebviewPanelSerializer('flakyTestsPanel', {
    async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
      webviewPanel.webview.options = {
        enableScripts: true,
      };

      webviewPanel.webview.onDidReceiveMessage(
        async (message) => {

          switch (message.command) {
            case 'openFile': 
              const document = await workspace.openTextDocument(message.filePath);
              await window.showTextDocument(document);
              break;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  });

}

export function deactivate() {
  onFlakyMarkerDeactivated();
}