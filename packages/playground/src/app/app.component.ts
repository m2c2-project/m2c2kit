import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  ChangeDetectorRef,
  Renderer2,
  AfterViewInit,
} from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { first, BehaviorSubject } from "rxjs";
import { MonacoEditorService } from "./monaco-editor-service.service";
import * as monacoEditor from "monaco-editor";
import { Project, ScriptTarget, ModuleResolutionKind, ts } from "ts-morph";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild("jsEditorContainer", { static: true })
  _jsEditorContainer!: ElementRef;
  @ViewChild("htmlEditorContainer", { static: true })
  _htmlEditorContainer!: ElementRef;

  jsEditor: monacoEditor.editor.IStandaloneCodeEditor | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  htmlEditor: any | undefined;

  title = "m2c2kit-playground";

  jsEditorOptions = { theme: "vs-light", language: "typescript" };
  htmlEditorOptions = { theme: "vs-light", language: "html" };

  code = "";
  html = "";
  htmlData?: SafeHtml;

  m2c2corelib = "";
  m2c2addonslib = "";
  canvaskitLib = "";

  codeEditorVisible = true;
  runButtonIcon = "arrow_right";
  compilationMessage = "";
  loading$ = new BehaviorSubject<boolean>(true);

  selectedAssessment: { name: string; url: string } | undefined;
  assessments: Array<{ name: string; url: string }> = [
    {
      name: "Grid Memory",
      url: "./assets/m2c2-examples/grid-memory/grid-memory-playground.ts",
    },
    {
      name: "Symbol Search",
      url: "./assets/m2c2-examples/symbol-search/symbol-search-playground.ts",
    },
    {
      name: "Color Dots",
      url: "./assets/m2c2-examples/color-dots/color-dots-playground.ts",
    },
  ];

  selectedTheme = { name: "Light", monacoName: "vs" };
  themes: Array<{ name: string; monacoName: string }> = [
    {
      name: "Light",
      monacoName: "vs",
    },
    {
      name: "Dark",
      monacoName: "vs-dark",
    },
  ];

  constructor(
    private monacoEditorService: MonacoEditorService,
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    const loader = this.renderer.selectRootElement("#loader");
    this.renderer.setStyle(loader, "display", "none");
  }

  onSelectAssessment(): void {
    if (!this.selectedAssessment) {
      return;
    }
    fetch(this.selectedAssessment.url).then((response) => {
      response.text().then((source) => {
        this.jsEditor?.setValue(source);
      });
    });
  }

  onSelectTheme(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.jsEditor._themeService.setTheme(this.selectedTheme.monacoName);
  }

  ngOnInit(): void {
    this.monacoEditorService.load(),
      (this.htmlData = this.sanitizer.bypassSecurityTrustHtml(this.html));
    this.initMonaco();
  }

  private initMonaco(): void {
    if (!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
        this.initMonaco();
      });
      return;
    }

    Promise.all([
      fetch("./assets/template.html"),
      fetch("./assets/m2c2kit/core/index.d.ts"),
      fetch("./assets/m2c2kit/addons/index.d.ts"),
      fetch("./assets/canvaskit-wasm/index.d.ts"),
    ])
      .then(
        ([
          templateResponse,
          coreLibResponse,
          addonsLibResponse,
          canvaskitLibResponse,
        ]) => {
          if (
            ![
              templateResponse.ok,
              coreLibResponse.ok,
              addonsLibResponse.ok,
              canvaskitLibResponse.ok,
            ].every((ok) => ok)
          ) {
            console.log("%cfatal error loading assets", "color: red");
          }

          Promise.all([
            templateResponse.text(),
            coreLibResponse.text(),
            addonsLibResponse.text(),
            canvaskitLibResponse.text(),
          ])
            .then(
              ([
                templateHtml,
                m2c2kitCoreLib,
                m2c2kitAddonsLib,
                canvaskitLib,
              ]) => {
                this.m2c2corelib = m2c2kitCoreLib;
                this.m2c2addonslib = m2c2kitAddonsLib;
                this.canvaskitLib = canvaskitLib;
                this.html = templateHtml;

                // see https://stackoverflow.com/a/43080286
                // compiler options
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                  {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    target: monaco.languages.typescript.ScriptTarget.ES2019,
                    allowNonTsExtensions: true,
                    moduleResolution:
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    module: monaco.languages.typescript.ModuleKind.ES2019,
                    noEmit: true,
                    // typeRoots: ["node_modules/@types"]
                  }
                );

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
                  m2c2kitCoreLib,
                  "file:///node_modules/@m2c2kit/core/index.d.ts"
                );

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
                  m2c2kitAddonsLib,
                  "file:///node_modules/@m2c2kit/addons/index.d.ts"
                );

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const model = window.monaco.editor.createModel(
                  "",
                  "typescript",
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  window.monaco.Uri.parse("file:///assessment.ts")
                );
                monacoEditor.editor.setModelLanguage(model, "typescript");

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.jsEditor = window.monaco.editor.create(
                  this._jsEditorContainer.nativeElement,
                  { model, theme: this.selectedTheme.monacoName }
                );

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.htmlEditor = window.monaco.editor.create(
                  this._htmlEditorContainer.nativeElement,
                  {
                    value: this.html,
                    language: "html",
                    theme: this.selectedTheme.monacoName,
                  }
                );
                this.loading$.next(false);
                this.changeDetectorRef.detectChanges();
              }
            )
            .catch((err) => {
              console.log("%cfatal error loading assets: " + err, "color: red");
            });
        }
      )
      .catch((err) => {
        console.log("%cfatal error loading assets: " + err, "color: red");
      });
  }

  combineCodeHtml(): SafeHtml | undefined {
    return this.htmlData;
  }

  async onRunClick(): Promise<void> {
    this.runButtonIcon = "restart_alt";

    const project = new Project({
      compilerOptions: {
        target: ScriptTarget.ES2019,
        moduleResolution: ModuleResolutionKind.NodeJs,
      },
      useInMemoryFileSystem: true,
    });

    const compileFunction = async () => {
      const libFile1 = project.createSourceFile(
        "./node_modules/@m2c2kit/core/index.d.ts",
        this.m2c2corelib
      );
      await libFile1.save();
      const libFile2 = project.createSourceFile(
        "./node_modules/@m2c2kit/addons/index.d.ts",
        this.m2c2addonslib
      );
      await libFile2.save();
      const libFile3 = project.createSourceFile(
        "./node_modules/canvaskit-wasm/index.d.ts",
        this.canvaskitLib
      );
      await libFile3.save();

      const sourceFile = project.createSourceFile(
        "src/assessment.ts",
        this.jsEditor?.getValue()
      );
      await sourceFile.save();

      const diagnostics = project.getPreEmitDiagnostics();
      const tsCompileErrors = diagnostics.length > 0;

      if (tsCompileErrors) {
        // some colors are hard to see on white background, so we won't use this formatting method
        // console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

        console.log("%cTypeScript compilation errors", "color: red");
        for (const diagnostic of diagnostics) {
          // const c = diagnostic.compilerObject;
          if (
            diagnostic.compilerObject.file &&
            diagnostic.compilerObject.start
          ) {
            const { line, character } = ts.getLineAndCharacterOfPosition(
              diagnostic.compilerObject.file,
              diagnostic.compilerObject.start
            );
            const message = ts.flattenDiagnosticMessageText(
              diagnostic.compilerObject.messageText,
              "\n"
            );
            console.log(
              `${diagnostic.compilerObject.file.fileName} (line ${
                line + 1
              }, column ${character + 1}): TS${
                diagnostic.compilerObject.code
              }: ${message}`
            );
          } else {
            console.log(
              ts.flattenDiagnosticMessageText(
                diagnostic.compilerObject.messageText,
                "\n"
              )
            );
          }
        }

        this.compilationMessage = "⚠ compilation error";
        this.runButtonIcon = "arrow_right";
        this.changeDetectorRef.detectChanges();
        return;
      }

      const result = project.emitToMemory();

      this.htmlData = this.sanitizer.bypassSecurityTrustHtml(
        this.html
          .replace(
            "</body>",
            '<script type="module">' +
              result.getFiles()[0].text +
              "</script> " +
              "</body>"
          )
          /**
           * We don't compile the m2c2kit libraries in the browser.
           * They are static resources. Update the module imports to point
           * to this code.
           */
          .replace(`"@m2c2kit/core"`, `"./assets/m2c2kit/core/index.js"`)
          .replace(`"@m2c2kit/addons"`, `"./assets/m2c2kit/addons/index.js"`)
      );
      this.runButtonIcon = "arrow_right";
      this.compilationMessage = "";
      this.changeDetectorRef.detectChanges();
    };

    /**
     * the compilation will block, but we want to change the "run" icon to
     * let the user know the compilation is in progress. So, delay a bit
     * to let Angular's change detection pick up and render the icon change
     * before the long-running compilation begins
     * TODO: move compilation to a WebWorker
     */
    setTimeout(compileFunction, 25);
  }
}
