import {
  CancellationToken,
  CodeLens,
  TextDocument,
  window,
  CodeLensProvider,
  ProviderResult,
  ExtensionContext,
  workspace,
  Range,
} from "vscode";
import { parse } from "./parser";
import { testMap as flakyTests } from "./data-fetcher";
import { ItBlock } from "jest-editor-support";

export class TestCodeLensProvider implements CodeLensProvider {
  private context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
    const codeLenses: CodeLens[] = [];
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      return [];
    }
    const relativePath = workspace.asRelativePath(document.uri);
    const languageId = document.languageId;
    if (!flakyTests.has(relativePath)) {
      return [];
    }
    const flakyTestsForFile = flakyTests.get(relativePath)!;
    const parsedTestFile = parse(activeEditor.document.fileName);
    const visitedLines = new Set<number>();
    for(const { test_path } of flakyTestsForFile) {
      const actualTestName = test_path[test_path.length - 1];
      let filteredTests = parsedTestFile.itBlocks.filter((itBlock) => itBlock.name.trim() === actualTestName);
      if (filteredTests.length === 0) {
        continue;
      }
      // there is only one test with this name
      if (filteredTests.length === 1) {
        const startLine = filteredTests[0].start?.line! - 1;
        // if we have already added a code lens for this line, skip
        if (visitedLines.has(startLine)) {
          continue;
        }
        const range = new Range(startLine, 0, startLine, 0);
        codeLenses.push(new CodeLens(range, {
          title: "Flaky",
          command: "",
          arguments: [],
        }));
        visitedLines.add(startLine);
        continue;
      }
      // there are multiple tests with this name, so filter by describe block
      const updatedTestPath = test_path.slice(0, test_path.length - 1);
      for (const path of updatedTestPath) {
        const describeBlock = parsedTestFile.describeBlocks.find((describeBlock) => describeBlock.name.trim() === path);
        if (!describeBlock) {
          continue;
        }
        filteredTests = filteredTests.filter(itBlock => itBlock.start?.line! > describeBlock.start?.line!);
      }
      if (filteredTests.length !== 1) {
        continue;
      }
      let startLine = filteredTests[0].start?.line! - 1;
      if (visitedLines.has(startLine)) {
        continue;
      }
      const range = new Range(startLine, 0, startLine, 0);
      codeLenses.push(new CodeLens(range, {
        title: "Flaky",
        command: "",
        arguments: [],
      }));
      visitedLines.add(startLine);
    }

    return codeLenses;
  }
}

export function codeLensActivateCallback(testname: string) {
  window.showInformationMessage(`Marked test "${testname}" as fixed.`);
}
