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
  m2c2sageresearchlib = "";
  m2c2surveylib = "";
  canvaskitlib = "";
  webgpulib = "";

  codeEditorVisible = true;
  runButtonIcon = "arrow_right";
  compilationMessage = "";
  loading$ = new BehaviorSubject<boolean>(true);

  selectedAssessment: { name: string; url: string } | undefined;
  assessments: Array<{ name: string; url: string }> = [
    {
      name: "Grid Memory",
      url: "./assets/src/grid-memory/index.ts",
    },
    {
      name: "Symbol Search",
      url: "./assets/src/symbol-search/index.ts",
    },
    {
      name: "Color Shapes",
      url: "./assets/src/color-shapes/index.ts",
    },
    {
      name: "Color Dots",
      url: "./assets/src/color-dots/index.ts",
    },
    {
      name: "CLI Starter (Stroop)",
      url: "./assets/src/cli-starter/index.ts",
    },
    {
      name: "Survey example",
      url: "./assets/survey-example/index.ts",
    },
    // {
    //   name: "tutorial-part01-01.ts",
    //   url: "./assets/tutorial/tutorial-part01-01.ts",
    // },
    // {
    //   name: "tutorial-part01-02.ts",
    //   url: "./assets/tutorial/tutorial-part01-02.ts",
    // },
    // {
    //   name: "tutorial-part01-03.ts",
    //   url: "./assets/tutorial/tutorial-part01-03.ts",
    // },
    // {
    //   name: "tutorial-part01-04.ts",
    //   url: "./assets/tutorial/tutorial-part01-04.ts",
    // },
    // {
    //   name: "tutorial-part01-05.ts",
    //   url: "./assets/tutorial/tutorial-part01-05.ts",
    // },
    // {
    //   name: "tutorial-part01-06.ts",
    //   url: "./assets/tutorial/tutorial-part01-06.ts",
    // },
    // {
    //   name: "tutorial-part01-07.ts",
    //   url: "./assets/tutorial/tutorial-part01-07.ts",
    // },
    // {
    //   name: "tutorial-part01-08.ts",
    //   url: "./assets/tutorial/tutorial-part01-08.ts",
    // },
    // {
    //   name: "tutorial-part02-01.ts",
    //   url: "./assets/tutorial/tutorial-part02-01.ts",
    // },
    // {
    //   name: "tutorial-part02-02.ts",
    //   url: "./assets/tutorial/tutorial-part02-02.ts",
    // },
    // {
    //   name: "tutorial-part02-03.ts",
    //   url: "./assets/tutorial/tutorial-part02-03.ts",
    // },
    // {
    //   name: "tutorial-part02-04.ts",
    //   url: "./assets/tutorial/tutorial-part02-04.ts",
    // },
    // {
    //   name: "tutorial-part02-05.ts",
    //   url: "./assets/tutorial/tutorial-part02-05.ts",
    // },
    // {
    //   name: "tutorial-part02-06.ts",
    //   url: "./assets/tutorial/tutorial-part02-06.ts",
    // },
    // {
    //   name: "tutorial-part02-07.ts",
    //   url: "./assets/tutorial/tutorial-part02-07.ts",
    // },
    // {
    //   name: "tutorial-part02-08.ts",
    //   url: "./assets/tutorial/tutorial-part02-08.ts",
    // },
    // {
    //   name: "tutorial-part02-09.ts",
    //   url: "./assets/tutorial/tutorial-part02-09.ts",
    // },
    // {
    //   name: "tutorial-part02-10.ts",
    //   url: "./assets/tutorial/tutorial-part02-10.ts",
    // },
    // {
    //   name: "tutorial-part03-01.ts",
    //   url: "./assets/tutorial/tutorial-part03-01.ts",
    // },
    // {
    //   name: "tutorial-part03-02.ts",
    //   url: "./assets/tutorial/tutorial-part03-02.ts",
    // },
    // {
    //   name: "tutorial-part03-03.ts",
    //   url: "./assets/tutorial/tutorial-part03-03.ts",
    // },
    // {
    //   name: "tutorial-part03-04.ts",
    //   url: "./assets/tutorial/tutorial-part03-04.ts",
    // },
    // {
    //   name: "tutorial-part03-05.ts",
    //   url: "./assets/tutorial/tutorial-part03-05.ts",
    // },
    // {
    //   name: "tutorial-part03-06.ts",
    //   url: "./assets/tutorial/tutorial-part03-06.ts",
    // },
    // {
    //   name: "tutorial-part03-07.ts",
    //   url: "./assets/tutorial/tutorial-part03-07.ts",
    // },
    // {
    //   name: "tutorial-part03-08.ts",
    //   url: "./assets/tutorial/tutorial-part03-08.ts",
    // },
    // {
    //   name: "tutorial-part04-01.ts",
    //   url: "./assets/tutorial/tutorial-part04-01.ts",
    // },
    // {
    //   name: "tutorial-part04-02.ts",
    //   url: "./assets/tutorial/tutorial-part04-02.ts",
    // },
    // {
    //   name: "tutorial-part04-03.ts",
    //   url: "./assets/tutorial/tutorial-part04-03.ts",
    // },
    // {
    //   name: "tutorial-part04-04.ts",
    //   url: "./assets/tutorial/tutorial-part04-04.ts",
    // },
    // {
    //   name: "tutorial-part04-05.ts",
    //   url: "./assets/tutorial/tutorial-part04-05.ts",
    // },
    // {
    //   name: "tutorial-part04-06.ts",
    //   url: "./assets/tutorial/tutorial-part04-06.ts",
    // },
    // {
    //   name: "tutorial-part04-07.ts",
    //   url: "./assets/tutorial/tutorial-part04-07.ts",
    // },
    // {
    //   name: "tutorial-part04-08.ts",
    //   url: "./assets/tutorial/tutorial-part04-08.ts",
    // },
    // {
    //   name: "tutorial-part04-09.ts",
    //   url: "./assets/tutorial/tutorial-part04-09.ts",
    // },
    // {
    //   name: "tutorial-part04-Survey.ts",
    //   url: "./assets/tutorial/tutorial-part04-Survey.ts",
    // },
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

  private async initMonaco(): Promise<void> {
    if (!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished
        .pipe(first())
        .subscribe(async () => {
          await this.initMonaco();
        });
      return;
    }

    const assetUrls = [
      "./assets/index.html",
      "./assets/m2c2kit/core/index.d.ts",
      "./assets/m2c2kit/addons/index.d.ts",
      "./assets/m2c2kit/sage-research/index.d.ts",
      "./assets/m2c2kit/survey/index.d.ts",
      "./assets/canvaskit-wasm/index.d.ts",
      "./assets/webgpu/types/index.d.ts",
    ];

    const fetchAssetUrl = (url: string): Promise<FetchedAsset> => {
      const showErrorMessageInIde = (): void => {
        this.compilationMessage = "⚠ IDE error. see console.";
        this.changeDetectorRef.detectChanges();
      };
      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            showErrorMessageInIde();
            throw new Error(
              `Fatal error loading asset from ${url}. Error: ${response.status}`
            );
          }
          return response
            .text()
            .then((s) => {
              return {
                url: url,
                assetAsString: s,
              };
            })
            .catch((err) => {
              showErrorMessageInIde();
              throw new Error(
                `Fatal error loading asset from ${url}. Error: ${err}`
              );
            });
        })
        .catch((err) => {
          showErrorMessageInIde();
          throw new Error(
            `Fatal error loading asset from ${url}. Error: ${err}`
          );
        });
    };

    async function fetchAssetsAsync(
      assetUrls: string[]
    ): Promise<FetchedAssets> {
      const fetchedAssetArray = await Promise.all(
        assetUrls.map((u) => fetchAssetUrl(u))
      );
      const fetchedAssets: FetchedAssets = {};
      fetchedAssetArray.forEach((fa) => {
        fetchedAssets[fa.url] = fa.assetAsString;
      });
      return fetchedAssets;
    }

    const fetchedAssets = await fetchAssetsAsync(assetUrls);
    this.m2c2corelib = fetchedAssets["./assets/m2c2kit/core/index.d.ts"];
    this.m2c2addonslib = fetchedAssets["./assets/m2c2kit/addons/index.d.ts"];
    this.m2c2sageresearchlib =
      fetchedAssets["./assets/m2c2kit/sage-research/index.d.ts"];
    this.m2c2surveylib = fetchedAssets["./assets/m2c2kit/survey/index.d.ts"];
    this.canvaskitlib = fetchedAssets["./assets/canvaskit-wasm/index.d.ts"];
    this.webgpulib = fetchedAssets["./assets/webgpu/types/index.d.ts"];
    this.html = fetchedAssets["./assets/index.html"];

    // see https://stackoverflow.com/a/43080286
    // compiler options
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
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
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
      this.m2c2corelib,
      "file:///node_modules/@m2c2kit/core/index.d.ts"
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
      this.m2c2addonslib,
      "file:///node_modules/@m2c2kit/addons/index.d.ts"
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
      this.m2c2sageresearchlib,
      "file:///node_modules/@m2c2kit/sage-research/index.d.ts"
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
      this.m2c2surveylib,
      "file:///node_modules/@m2c2kit/survey/index.d.ts"
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const model = window.monaco.editor.createModel(
      "",
      "typescript",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.monaco.Uri.parse("file:///index.ts")
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
        "./node_modules/@m2c2kit/sage-research/index.d.ts",
        this.m2c2sageresearchlib
      );
      await libFile3.save();
      const libFile4 = project.createSourceFile(
        "./node_modules/@m2c2kit/survey/index.d.ts",
        this.m2c2surveylib
      );
      await libFile4.save();

      const libFile5 = project.createSourceFile(
        "./node_modules/canvaskit-wasm/index.d.ts",
        this.canvaskitlib
      );
      await libFile5.save();

      const libFile6 = project.createSourceFile(
        "./node_modules/@webgpu/types/index.d.ts",
        this.webgpulib
      );
      await libFile6.save();

      const sourceFile = project.createSourceFile(
        "src/index.ts",
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
        this.htmlEditor
          .getValue()
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
          .replace(
            `"@m2c2kit/sage-research"`,
            `"./assets/m2c2kit/sage-research/index.js"`
          )
          .replace(`"@m2c2kit/survey"`, `"./assets/m2c2kit/survey/index.js"`)
      );
      // TODO: add an option to get the bundled html (index.html w/script)
      // and export it (as a zip?)
      // console.log(this.htmlData["changingThisBreaksApplicationSecurity"]);
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

interface FetchedAssets {
  [key: string]: string;
}

interface FetchedAsset {
  url: string;
  assetAsString: string;
}
