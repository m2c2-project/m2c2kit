import ts, { factory, SyntaxKind } from "typescript";
import { Constants } from "./constants";
import path from "path";
import { getFileHash } from "./getFileHash";
import { getCanvasKitWasmPath } from "./getCanvasKitWasmPath";

export function addHashesM2c2Transformer() {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const getRootVariableDeclaration = (
        node: ts.Node,
        rootVariableDeclaration: ts.VariableDeclaration | undefined = undefined
      ): ts.VariableDeclaration | undefined => {
        if (ts.isVariableDeclaration(node)) {
          rootVariableDeclaration = node;
        }
        if (!node.parent) {
          return rootVariableDeclaration;
        }
        return getRootVariableDeclaration(node.parent, rootVariableDeclaration);
      };

      const getTypeReferenceOfVariableDeclaration = (
        node: ts.VariableDeclaration
      ): ts.TypeReferenceNode | undefined => {
        const children = node.getChildren();
        return children.find((child) =>
          ts.isTypeReferenceNode(child)
        ) as ts.TypeReferenceNode;
      };

      const getIdentifierNameOfTypeReference = (
        node: ts.TypeReferenceNode
      ): string => {
        return (node.typeName as ts.Identifier).text;
      };

      const rootVariableDeclarationIsGameOptions = (node: ts.Node): boolean => {
        const root = getRootVariableDeclaration(node);
        if (root) {
          const typeReference = getTypeReferenceOfVariableDeclaration(root);
          if (typeReference) {
            const identifierName =
              getIdentifierNameOfTypeReference(typeReference);
            return identifierName === "GameOptions";
          }
        }
        return false;
      };

      const getParentPropertyAssignment = (
        node: ts.Node | undefined
      ): ts.PropertyAssignment | undefined => {
        if (!node) {
          return undefined;
        }

        if (!node.parent) {
          return undefined;
        }

        if (ts.isPropertyAssignment(node.parent)) {
          return node.parent;
        }

        return getParentPropertyAssignment(node.parent);
      };

      const stringLiteralIsAssignedToFontUrls = (
        node: ts.StringLiteral
      ): boolean => {
        return (
          (getParentPropertyAssignment(node)?.name as ts.Identifier)?.text ===
          "fontUrls"
        );
      };

      const nodeIsStringLiteralAssignedToFontUrl = (node: ts.Node): boolean => {
        return (
          ts.isStringLiteral(node) &&
          stringLiteralIsAssignedToFontUrls(node) &&
          rootVariableDeclarationIsGameOptions(node)
        );
      };

      const stringLiteralIsAssignedToImageUrl = (
        node: ts.StringLiteral
      ): boolean => {
        return (
          (getParentPropertyAssignment(node)?.name as ts.Identifier)?.text ===
            "url" &&
          (
            getParentPropertyAssignment(getParentPropertyAssignment(node))
              ?.name as ts.Identifier
          )?.text === "images"
        );
      };

      const nodeIsStringLiteralAssignedToImageUrl = (
        node: ts.Node
      ): boolean => {
        return (
          ts.isStringLiteral(node) &&
          stringLiteralIsAssignedToImageUrl(node) &&
          rootVariableDeclarationIsGameOptions(node)
        );
      };

      function nodeIsSessionNewExpression(node: ts.Node): boolean {
        if (node.kind === SyntaxKind.NewExpression) {
          const identifiers = node
            .getChildren()
            .filter((c) => c.kind === SyntaxKind.Identifier);
          if (identifiers.length > 0) {
            const identifier = identifiers[0] as ts.Identifier;
            return identifier.text === "Session";
          }
        }
        return false;
      }

      const addHashToUrl = (url: string, rootDir = "") => {
        const ext = path.extname(url);
        const hash = getFileHash(path.join(rootDir, url));
        if (ext) {
          url = url.replace(ext, `.${hash}${ext}`);
        } else {
          url = url + `.${hash}`;
        }
        return url;
      };

      const visitor = (node: ts.Node): ts.Node => {
        if (
          nodeIsStringLiteralAssignedToFontUrl(node) ||
          nodeIsStringLiteralAssignedToImageUrl(node)
        ) {
          let url = (node as ts.StringLiteral).text;
          url = addHashToUrl(url, "src");
          return ts.factory.createStringLiteral(url);
        }

        if (nodeIsSessionNewExpression(node)) {
          const newExpression = node as ts.NewExpression;
          if (newExpression.arguments && newExpression.arguments.length > 0) {
            const objectLiteral = newExpression
              .arguments[0] as ts.ObjectLiteralExpression;

            const canvasKitPath = getCanvasKitWasmPath();
            let canvasKitUrl = Constants.DEFAULT_CANVASKITWASM_URL;
            if (canvasKitPath) {
              const hash = getFileHash(canvasKitPath);
              const ext = path.extname(canvasKitUrl);
              if (ext) {
                canvasKitUrl = canvasKitUrl.replace(ext, `.${hash}${ext}`);
              } else {
                canvasKitUrl = canvasKitUrl + `.${hash}`;
              }
            }

            /**
             * if canvasKitWasmUrl property already exists,
             * don't modify this node
             */
            const props = objectLiteral.properties.map((p) =>
              p.name?.getText()
            );
            if (props.includes("canvasKitWasmUrl")) {
              return node;
            }

            return factory.createNewExpression(
              factory.createIdentifier("Session"),
              undefined,
              [
                factory.createObjectLiteralExpression(
                  [
                    ...objectLiteral.properties,
                    factory.createPropertyAssignment(
                      factory.createIdentifier("canvasKitWasmUrl"),
                      factory.createStringLiteral(canvasKitUrl)
                    ),
                  ],
                  true
                ),
              ]
            );
          }

          return factory.createNewExpression(
            node as ts.NewExpression,
            undefined,
            undefined
          );
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor);
    };
  };
}
