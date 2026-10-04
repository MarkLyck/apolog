import { defineRule } from "@oxlint/plugins";
import type { ESTree, SourceCode } from "@oxlint/plugins";

type Parameter = ESTree.ParamPattern;
type ParameterOwner =
  | ESTree.ArrowFunctionExpression
  | ESTree.Function
  | ESTree.TSCallSignatureDeclaration
  | ESTree.TSConstructSignatureDeclaration
  | ESTree.TSConstructorType
  | ESTree.TSFunctionType
  | ESTree.TSMethodSignature;

function parameterAnnotation(parameter: Parameter): ESTree.TSTypeAnnotation | null | undefined {
  if (parameter.type === "TSParameterProperty") {
    return parameterAnnotation(parameter.parameter);
  }
  if (parameter.type === "RestElement") {
    return parameter.typeAnnotation ?? parameterAnnotation(parameter.argument);
  }
  if (parameter.type === "AssignmentPattern") {
    return parameter.typeAnnotation ?? parameter.left.typeAnnotation;
  }
  return parameter.typeAnnotation;
}

function parameterName(parameter: Parameter, sourceText: string): string {
  if (parameter.type === "TSParameterProperty") {
    return parameterName(parameter.parameter, sourceText);
  }
  if (parameter.type === "AssignmentPattern") {
    return parameterName(parameter.left, sourceText);
  }
  if (parameter.type === "RestElement") {
    return parameterName(parameter.argument, sourceText);
  }
  return parameter.type === "Identifier"
    ? parameter.name
    : sourceText.replace(/\s*:\s*unknown\s*$/u, "");
}

function isEffectSchema(identifier: ESTree.IdentifierReference, sourceCode: SourceCode): boolean {
  let scope = sourceCode.getScope(identifier);
  while (true) {
    const binding = scope.set.get(identifier.name);
    if (binding) {
      return binding.defs.some((definition) => {
        const declaration = definition.parent;
        if (definition.type !== "ImportBinding" || declaration?.type !== "ImportDeclaration") {
          return false;
        }
        const specifier = definition.node;
        return (
          (declaration.source.value === "effect" &&
            specifier.type === "ImportSpecifier" &&
            specifier.imported.type === "Identifier" &&
            specifier.imported.name === "Schema") ||
          (declaration.source.value === "effect/Schema" &&
            specifier.type === "ImportNamespaceSpecifier")
        );
      });
    }
    if (!scope.upper) return false;
    scope = scope.upper;
  }
}

function isDecodedParameter(node: ParameterOwner, name: string, sourceCode: SourceCode): boolean {
  const binding = sourceCode.getDeclaredVariables(node).find((variable) =>
    variable.defs.some((definition) => definition.type === "Parameter" && definition.name.name === name)
  );
  if (!binding || binding.references.length === 0) return false;
  return binding.references.every((reference) => {
    if (!reference.isReadOnly()) return false;
    const identifier = reference.identifier;
    const invocation = identifier.parent;
    if (invocation?.type !== "CallExpression" || invocation.arguments[0] !== identifier) return false;
    const decoder = invocation.callee;
    if (decoder.type !== "CallExpression") return false;
    const method = decoder.callee;
    if (
      method.type !== "MemberExpression" || method.computed ||
      method.object.type !== "Identifier" || method.property.type !== "Identifier" ||
      !["decodeUnknownResult", "decodeUnknownSync", "decodeUnknownEffect"].includes(method.property.name) ||
      !isEffectSchema(method.object, sourceCode)
    ) return false;
    let owner: ESTree.Node | null = invocation.parent;
    while (owner) {
      if (
        owner.type === "ArrowFunctionExpression" || owner.type === "FunctionDeclaration" ||
        owner.type === "FunctionExpression"
      ) return owner === node;
      owner = owner.parent;
    }
    return false;
  });
}

export const noUnknownParametersRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow explicitly unknown function parameters except `cause` and inputs used only by an Effect Schema decoder in that function.",
    },
    messages: {
      unknownParameter:
        "Parameter `{{parameter}}` leaves input unparsed. Accept a named domain type; run the expected schema or parser at the I/O boundary before calling this function.",
    },
  },
  createOnce(context) {
    const checkParameters = (node: ParameterOwner) => {
      for (const parameter of node.params) {
        const annotation = parameterAnnotation(parameter);
        if (annotation?.typeAnnotation.type !== "TSUnknownKeyword") continue;
        const name = parameterName(parameter, context.sourceCode.getText(parameter));
        if (name === "cause") continue;
        if (isDecodedParameter(node, name, context.sourceCode)) continue;
        context.report({
          node: annotation.typeAnnotation,
          messageId: "unknownParameter",
          data: { parameter: name },
        });
      }
    };

    return {
      ArrowFunctionExpression: checkParameters,
      FunctionDeclaration: checkParameters,
      FunctionExpression: checkParameters,
      TSCallSignatureDeclaration: checkParameters,
      TSConstructSignatureDeclaration: checkParameters,
      TSConstructorType: checkParameters,
      TSDeclareFunction: checkParameters,
      TSEmptyBodyFunctionExpression: checkParameters,
      TSFunctionType: checkParameters,
      TSMethodSignature: checkParameters,
    };
  },
});
