import { TextEditorDecorationType, window, ProgressLocation, Range, Position } from "vscode";

let flakyDecorationType: TextEditorDecorationType | undefined;

const getFlakyTestsForFile = async (path: string): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  return ["adds two numbers", "divides two numbers"];
};

export async function flakyMarker() {
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

export const onDeactivate = () => {
    if (flakyDecorationType) {
        flakyDecorationType.dispose();
    }
};