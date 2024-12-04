import { useState, useEffect } from "react";
import { vscode } from "./utilities/vscode";
import { QuarantinedTest } from '../../src/types.ts';
import FlakyTestList from "./components/FlakyTestList.tsx";

const App: React.FC = () => {
  const [flakyTests, setFlakyTests] = useState<QuarantinedTest[]>([]);

  useEffect(() => {

    // Retreive flaky tests from webview
    const tests = (window as any).flakyTests as QuarantinedTest[];
    setFlakyTests(tests);

    // Notify the extension that webview is ready
    vscode.postMessage({command: 'ready'});

  }, [])


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flaky Tests</h1>
      <FlakyTestList flakyTests={flakyTests} />
    </div>
  );
};

export default App;