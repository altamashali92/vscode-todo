import {
  commands,
  ExtensionContext,
  window,
  Range,
  Position,
  TextEditorDecorationType,
  ProgressLocation,
  languages,
} from "vscode";

import { TodoPanel } from "./panels/TodoPanel";
import { TestCodeLensProvider } from "./TestCodeLensProvider";

let flakyDecorationType: TextEditorDecorationType | undefined;

const getFlakyTestsForFile = async (path: string): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  return ["adds two numbers", "divides two numbers"];
};

async function flakyMarker() {
  const activeEditor = window.activeTextEditor;

  if (!activeEditor) {
    window.showInformationMessage("No active editor found.");
    return;
  }

  const document = activeEditor.document;
  const filename = document.fileName;

  console.log("filename", filename);

  if (!/\.(test\.js|test\.ts|test\.jsx|test\.tsx)$/.test(filename)) {
    window.showInformationMessage("No test file found.");
    return;
  }

  const flakyTests = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Fetching flaky tests...",
      cancellable: false,
    },
    async () => {
      // Perform the async operation without reporting progress increments
      return await getFlakyTestsForFile(filename);
    }
  );

  if (flakyTests.length === 0) {
    window.showInformationMessage("No flaky tests found.");
    return;
  }

  console.log("flakyTests", flakyTests);

  const text = document.getText();
  const ranges: Range[] = [];

  flakyTests.forEach((testName) => {
    const testRegex = new RegExp(`test\\(['"\`]${testName}['"\`],`);
    const match = testRegex.exec(text);

    if (match) {
      const testStartIndex = match.index;
      const testStartPos = document.positionAt(testStartIndex);
      const testLine = testStartPos.line;

      if (testLine > 0) {
        const range = new Range(
          new Position(testLine - 1, 0),
          new Position(testLine - 1, 0)
        );
        ranges.push(range);
      }
    }
  });

  if (ranges.length === 0) {
    window.showInformationMessage("No matching tests found in the file.");
    return;
  }

  console.log("ranges", ranges);

  if (flakyDecorationType) {
    activeEditor.setDecorations(flakyDecorationType, []);
  }

  flakyDecorationType = window.createTextEditorDecorationType({
    isWholeLine: true,
    after: {
      contentText: " [Flaky]",
      color: "red",
      margin: "0 0 0 1em",
    },
  });

  activeEditor.setDecorations(flakyDecorationType, ranges);
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("FlakeManager.flakyMarker", flakyMarker),
    commands.registerCommand("vscode-todo.run",() => TodoPanel.render(context.extensionUri))
  );

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

export function deactivate() {
  if (flakyDecorationType) {
    flakyDecorationType.dispose();
  }
}
