import { GridMemory } from "..";
import { ActivityKeyValueData } from "@m2c2kit/core";
import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";
import { data } from "./data";
import {
  jsPyCompareSummaries,
  validateJsAgainstSchema,
} from "@m2c2kit/test-helpers";
import { pythonCode } from "./python-code";

describe("Grid Memory scoring tests", () => {
  let pyodide: PyodideInterface;
  beforeAll(async () => {
    pyodide = await loadPyodide();
    await pyodide.loadPackage(["numpy", "pandas", "scipy"]);
    pyodide.runPython(pythonCode);
    // increase timeout since loading pyodide and packages can take a while
  }, 30000);

  it("generates same results in JavaScript and Python", () => {
    for (const trials of data) {
      pyodide.globals.set("trials", trials);

      const pyResult = pyodide.runPython(`
      from pyodide.ffi import jsnull
      python_data = trials.to_py()
      df = pd.DataFrame(python_data).map(lambda v: None if v is jsnull else v)

      df["metric_error_distance_hausdorff"] = df.apply(lambda row: score_hausdorff(row), axis=1)
      df["metric_error_distance_mean"] = df.apply(lambda row: score_mean_error(row), axis=1)
      df["metric_error_distance_sum"] = df.apply(lambda row: score_sum_error(row), axis=1)
      summarize(df, 4).to_dict()
    `);
      const pySummary = pyResult.toJs({ dict_converter: Object.fromEntries });

      const assessment = new GridMemory();
      const jsSummary = assessment.calculateScores(
        trials as ActivityKeyValueData[],
        {
          numberOfTrials: 4,
          numberOfDots: 3,
        },
      )[0];

      jsPyCompareSummaries({
        jsSummary,
        pySummary,
        ignoreKeys: [
          "activity_begin_iso8601_timestamp",
          // python code has some issues with incomplete trials
          // affecting the sums, so we ignore those for now
          "metric_error_distance_hausdorff_sum",
          "metric_error_distance_mean_sum",
          "metric_error_distance_sum_sum",
        ],
        coercePythonBooleanToNumber: true,
        verbose: true,
        precision: 4,
      });

      // need dummy timestamp so that the schema validation doesn't fail
      jsSummary["activity_begin_iso8601_timestamp"] = new Date().toISOString();
      validateJsAgainstSchema({
        jsSummary,
        schema: assessment.options.scoringSchema,
      });

      pyResult.destroy();
      pyodide.globals.delete("trials");
    }
  });
});
