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
    commands.registerCommand("Codelassian.detectFlakyJestUnitTestsInJira", async () => {

      try {
        const token = process.env.SLAUTH_TOKEN!;
        const flakyTests = await getQuarantinedTests(token, 'jira', 'jest-unit');
        FlakyTestsPanel.createOrShow(context.extensionUri, flakyTests);
      } catch (error) {
        window.showErrorMessage(`Failed to fetch jira jest-unit flaky tests: ${error}`);
      }

    })
  );
  fixFlakyActionCommand(context);
}

export function deactivate() {
  onFlakyMarkerDeactivated();
}