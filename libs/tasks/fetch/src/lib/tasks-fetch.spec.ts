import { tasksFetch } from "./tasks-fetch";

describe("tasksFetch", () => {
  it("should work", () => {
    expect(tasksFetch()).toEqual("tasks-fetch");
  });
});
