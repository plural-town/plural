import { runTask } from "./runTask";

describe("runTask", () => {
  it("should work", () => {
    expect(runTask()).toEqual("queue-exec");
  });
});
