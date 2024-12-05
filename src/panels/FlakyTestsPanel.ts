import * as vscode from 'vscode';
import * as path from 'path';
import { getNonce } from '../utilities/getNonce';
import { getUri } from '../utilities/getUri';
import { QuarantinedTest } from '../types';

export class FlakyTestsPanel {
  public static currentPanel: FlakyTestsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, flakyTests: QuarantinedTest[]) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, flakyTests);

    // Set up the message listener
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        console.log("Received message in FlakyTestsPanel:", message);
        switch (message.command) {
          case 'openFile':
            await this.openFile(message.filePath);
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri, flakyTests: QuarantinedTest[]) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (FlakyTestsPanel.currentPanel) {
      FlakyTestsPanel.currentPanel._panel.reveal(column);
      FlakyTestsPanel.currentPanel.update(flakyTests);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'flakyTestsPanel',
        'Flaky Tests',
        column || vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(extensionUri, "out"), vscode.Uri.joinPath(extensionUri, "webview-ui/build")],
        }
      );

      FlakyTestsPanel.currentPanel = new FlakyTestsPanel(panel, extensionUri, flakyTests);
    }
  }

  private async openFile(filePath: string) {
    console.log("Attempting to open file:", filePath);
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    //   TODO : Uncomment when running extension in AFM root
    //   const fullPath = path.join(rootPath, 'jira', filePath);

    // TODO: Comment later. currently assuming Jira is opened as root.  
      const fullPath = path.join(rootPath, filePath);

      console.log("Full path:", fullPath);
      try {
        const document = await vscode.workspace.openTextDocument(fullPath);
        await vscode.window.showTextDocument(document);
      } catch (error) {
        console.error(`Failed to open file: ${fullPath}`, error);
        vscode.window.showErrorMessage(`Failed to open file: ${fullPath}\n${error}`);
      }
    } else {
      vscode.window.showErrorMessage('No workspace folder is open');
    }
  }

  public update(flakyTests: QuarantinedTest[]) {
    this._panel.webview.postMessage({ command: 'updateTests', tests: flakyTests });
  }
  
  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, flakyTests: QuarantinedTest[]): string {
    const webviewUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.js']);
    const stylesUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.css']);
    const nonce = getNonce();

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Flaky Tests</title>
        </head>
        <body>
          <div id="root"></div>
          <script nonce="${nonce}">
            window.flakyTests = ${JSON.stringify(flakyTests)};
          </script>
          <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
        </body>
      </html>
    `;
  }

  public dispose() {
    FlakyTestsPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}