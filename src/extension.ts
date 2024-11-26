import { commands, ExtensionContext, window, Range, Position, TextEditorDecorationType } from "vscode";
import { TodoPanel } from "./panels/TodoPanel";

const getFlakyTestsForFile = (path: string) => {
  return Promise.resolve([
    'Math Functions >> adds two numbers',
    'Math Functions >> divides two numbers',
  ]);
};

// Another command that marks a test as flaky.
async function flakyMarker() {
  const activeEditor = window.activeTextEditor;

  if (!activeEditor) {
    window.showInformationMessage("No active editor found.");
    return;
  }

  const document = activeEditor.document;
  const filename = document.fileName;

  // Check if the file is a test file
  if (!/\.(test\.js|test\.ts|test\.jsx|test\.tsx)$/.test(filename)) {
    window.showInformationMessage('No test file found.');
    return;
  }

  const flakyTests = await getFlakyTestsForFile(filename);

  if (flakyTests.length === 0) {
    window.showInformationMessage('No flaky tests found.');
    return;
  }

  const selectedTest = await window.showQuickPick(flakyTests, {
    placeHolder: 'Select a flaky test to mark',
  });

  if (!selectedTest) {
    return;
  }

  const [suiteName, testName] = selectedTest.split('>>').map((s) => s.trim());

  // Mark the test as flaky
  const text = document.getText();
  const testRegex = new RegExp(`describe\\(['"\`].*?${suiteName}.*?['"\`],.*?\\{[\\s\\S]*?test\\(['"\`]${testName}['"\`],`, 'g');
  let match;
  const ranges: Range[] = [];

  while ((match = testRegex.exec(text))) {
    const testStartIndex = match.index + match[0].lastIndexOf(`test('`);
    const testStartPos = document.positionAt(testStartIndex);
    const testLine = testStartPos.line;

    // Ensure the line before the test exists
    if (testLine > 0) {
      const range = new Range(new Position(testLine - 1, 0), new Position(testLine - 1, 0));
      ranges.push(range);
    }
  }

  if (ranges.length === 0) {
    window.showInformationMessage('Test not found in the file.');
    return;
  }

  const flakyDecorationType: TextEditorDecorationType = window.createTextEditorDecorationType({
    isWholeLine: true,
    after: {
      contentText: ' [Flaky]',
      color: 'red',
      margin: '0 0 0 1em'
    }
  });

  activeEditor.setDecorations(flakyDecorationType, ranges);
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("vscode-todo.run", () => {
      TodoPanel.render(context.extensionUri);
    }),
    commands.registerCommand("vscode-todo.flakyMarker", flakyMarker)
  );
}

export function deactivate() {}