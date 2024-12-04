import { FC } from "react";
import { QuarantinedTest } from "../../../src/types";
import { vscode } from "../utilities/vscode";

interface FlakyTestListProps {
    flakyTests: QuarantinedTest[];
}

const FlakyTestList: FC<FlakyTestListProps> = ({ flakyTests }) => {

    // Group flaky tests by file path

    const groupedTests = flakyTests.reduce((acc, test) => {
        if (!acc[test.path]) {
            acc[test.path] = [];
        }

        acc[test.path].push(test);

        return acc;
    }, {} as Record<string, QuarantinedTest[]>);


    const handleFileClick = (filePath : string) => {
        // Send a message to the extension to open the file
        vscode.postMessage({ command: 'openFile', filePath });
    };
    
    return (
        <ul className="space-y-4">
            {Object.entries(groupedTests).map(([filePath, tests]) => (
                <li key={filePath} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => handleFileClick(filePath)}>
                        <span className="font-semibold">{filePath}</span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full">{tests.length}</span>
                    </div>
                </li>
            )
        )}
        </ul>
    );
};

export default FlakyTestList;
