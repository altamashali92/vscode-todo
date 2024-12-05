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

      try {
        const token = process.env.SLAUTH_TOKEN!;
        const flakyTests = await getQuarantinedTests(token, 'jira', 'jest-unit');
        FlakyTestsPanel.createOrShow(context.extensionUri, flakyTests);
      } catch (error) {
        window.showErrorMessage(`Failed to fetch flaky tests: ${error}`);
      }

    })
  );
  fixFlakyActionCommand(context);


  // // Handle messages from webview
  // window.registerWebviewPanelSerializer('flakyTestsPanel', {
  //   async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
  //     webviewPanel.webview.options = {
  //       enableScripts: true,
  //     };

  //     webviewPanel.webview.onDidReceiveMessage(
  //       async (message) => {
  //         console.log("hooray! received a messsage");

  //         switch (message.command) {
  //           case 'openFile':
  //             console.log("entered openfile block");

  //             if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
  //               const rootPath = workspace.workspaceFolders[0].uri.fsPath;
  //               // const fullPath = path.join(rootPath, 'jira', message.filePath);
  //               const fullPath = path.join(rootPath, message.filePath);

  //               console.log("calculated paths", rootPath, fullPath);
  //               try {
  //                 const document = await workspace.openTextDocument(fullPath);
  //                 await window.showTextDocument(document);
  //               } catch (error) {

  //                 console.log(`Failed to open file: 
  //                   fullPath: ${fullPath}
  //                   ${error}`);

  //                 window.showErrorMessage(`Failed to open file: 
  //                   fullPath: ${fullPath}
  //                   ${error}`);
  //               }
  //             } else {
  //               window.showErrorMessage('No workspace folder is open');
  //             }
  //             break;
  //         }
  //       },
  //       undefined,
  //       context.subscriptions
  //     );
  //   }
  // });
}

export function deactivate() {
  onFlakyMarkerDeactivated();
}