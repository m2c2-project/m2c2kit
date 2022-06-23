import ts from "typescript";
import path from "path";
import { getFileHash } from "./getFileHash";

export function m2c2CacheBusting() {
  console.log("m2c2CacheBusting()");
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

      const addHashToUrl = (url: string) => {
        const ext = path.extname(url);
        const hash = getFileHash(url);
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
          url = addHashToUrl(url);
          return ts.factory.createStringLiteral(url);
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor);
    };
  };
}
