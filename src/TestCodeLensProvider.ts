import {
  CancellationToken,
  CodeLens,
  Range,
  TextDocument,
  window,
  CodeLensProvider,
  ProviderResult,
} from "vscode";
import { parse } from "./parser";

export class TestCodeLensProvider implements CodeLensProvider {
  provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
    const codeLenses: CodeLens[] = [];
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      return [];
    }
    const parsedTestFile = parse(activeEditor.document.fileName);
    console.log("parsedTestFile", parsedTestFile);
    const regex = /it\(['"`](.*?)['"`],/g;
    const text = document.getText();
    let match;

    while ((match = regex.exec(text)) !== null) {
      const line = document.positionAt(match.index).line;
      const range = new Range(line, 0, line, 0);
      const command = {
        title: "Flaky",
        command: "",
        arguments: [],
      };
      codeLenses.push(new CodeLens(range, command));
    }
    return codeLenses;
  }
}

export function codeLensActivateCallback(testname: string) {
  window.showInformationMessage(`Marked test "${testname}" as fixed.`);
}
