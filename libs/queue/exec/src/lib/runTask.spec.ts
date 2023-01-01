import { Task } from "@plural-town/queue-core";
import { runTask } from "./runTask";

class TestTask extends Task<TestTask> {
  public async execute(name: string) {
    return `Hello ${name}`;
  }
}

describe("runTask", () => {
  it("should work", async () => {
    const run = runTask(TestTask, ["Jay"]);
    const res = await run;
    expect(res).toEqual("Hello Jay");
  });
});
