import {
  CancellationToken,
  CodeLens,
  Range,
  TextDocument,
  window,
} from "vscode";
import { parse } from "./parser";

export class TestCodeLensProvider {
  provideCodeLenses(
    document: TextDocument,
    token: CancellationToken
  ): CodeLens[] {
    const codeLenses: CodeLens[] = [];
    const activeEditor = window.activeTextEditor;
    if (activeEditor) {
        const parsedTestFile = parse(activeEditor.document.fileName);
        console.log("parsedTestFile", parsedTestFile);
    }
    const regex = /it\(['"`](.*?)['"`],/g;
    const text = document.getText();
    let match;

    while ((match = regex.exec(text)) !== null) {
      const line = document.positionAt(match.index).line;
      const range = new Range(line, 0, line, 0);
      const command = {
        title: "Mark as Fixed",
        command: "FlakeManager.markAsFixed",
        arguments: [match[1]],
      };
      codeLenses.push(new CodeLens(range, command));
    }
    return codeLenses;
  }
}

export function codeLensActivateCallback(testname: string) {
  window.showInformationMessage(`Marked test "${testname}" as fixed.`);
}
