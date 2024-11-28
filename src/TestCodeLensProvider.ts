import { CancellationToken, CodeLens, Range, TextDocument, window } from 'vscode';

export class TestCodeLensProvider {
    provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] {
        const codeLenses: CodeLens[] = [];

        const regex =  /it\(['"`](.*?)['"`],/g;
        const text = document.getText();
        let match;

        while((match = regex.exec(text)) !== null) {
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