import { commands, ExtensionContext, languages, window } from "vscode";
import { TestCodeLensProvider } from "./TestCodeLensProvider";

export function fixFlakyActionCommand(context: ExtensionContext) {
    // code lens
  const supportedLanguages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
  supportedLanguages.forEach((language) => {
    context.subscriptions.push(
      languages.registerCodeLensProvider({scheme: 'file', language}, new TestCodeLensProvider())
    );
  });
  context.subscriptions.push(
    commands.registerCommand("FlakeManager.markAsFixed", (testname: string) => {
      window.showInformationMessage(`Marked test ${testname} as fixed.`);
    }),
  );
}