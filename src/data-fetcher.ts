import { ExtensionContext } from "vscode";
import { getFlakyTests } from "./api/get-flaky-tests";
import { FLAKY_TESTS_KEY } from "./constants";
import { FlakyTestMap } from "./types";

export async function setFlakyTestsOnInit(context: ExtensionContext) {
    const flakyTests = await getFlakyTests();
    const testMap: FlakyTestMap = flakyTests.reduce((map, res) => {
      const path = res.path;
      if (!map.has(path)) {
        map.set(path, []);
      }
      const test_path = formatTestPath(res.name);
      
      map.get(path)?.push({
        test_uuid: res.test_uuid,
        type: res.type,
        test_path,
      });
      return map;
    }, new Map());
  
    context.workspaceState.update(FLAKY_TESTS_KEY, testMap);
  }
  
  function formatTestPath(name: string): string[] {
    return name
      .split("»")
      .map((name) => name.replace("🔁", "").replace("(🧪ff-on)", "").trim());
  }