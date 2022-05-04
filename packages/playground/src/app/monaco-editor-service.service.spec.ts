import { TestBed } from "@angular/core/testing";

import { MonacoEditorServiceService } from "./monaco-editor-service.service";

describe("MonacoEditorServiceService", () => {
  let service: MonacoEditorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonacoEditorServiceService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
