import {
  z,
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodNumber,
  ZodObject,
  ZodString,
} from 'zod';

const makeIndent = (indent: number) =>
  Array.from({ length: indent })
    .map(() => '  ')
    .join('');

const makePath = (path?: string, key?: string) => {
  return (path ? [path, key] : [key])
    .filter((item) => item)
    .join('.')
    .replace(/\.\[/g, '[')
    .replace(/\$\{d\}/g, '$');
};

const doArray = (
  schema: ZodArray<any, any>,
  key?: string,
  path?: string,
  indentLevel?: number
) => {
  const currentIndent = indentLevel ?? 0;
  const newPath = makePath(path, key);
  return `{
${makeIndent(currentIndent + 1)}"L": [
${makeIndent(currentIndent + 2)}#foreach($elem in $input.path('$.${newPath}'))
${makeIndent(currentIndent + 2)}${makeTemplateRecursive(
    schema.element,
    `[$foreach.index]`,
    newPath,
    currentIndent + 2
  )}
${makeIndent(currentIndent + 2)}#if($foreach.hasNext),#end
${makeIndent(currentIndent + 2)}#end
${makeIndent(currentIndent + 1)}]
${makeIndent(currentIndent)}}`;
};

const doOther = (
  type: string,
  key?: string,
  path?: string,
  indentLevel?: number
) => {
  const currentIndent = indentLevel ?? 0;
  const newPath = makePath(path, key);
  return `{
${makeIndent(1 + currentIndent)}"${type}": "$input.path('$.${newPath}')"
${makeIndent(currentIndent)}}`;
};

const doObject = (
  schema: ZodObject<any, any, any, any, any>,
  key?: string,
  path?: string,
  indentLevel?: number
) => {
  const currentIndent = indentLevel ?? 0;
  const newPath = makePath(path, key);
  const entries = Object.entries<z.ZodTypeAny>(schema.shape)
    .map(([key, value]) => {
      const escapedKey = key.replace(/\$/g, '${d}');
      return `
${makeIndent(currentIndent + 2)}"${escapedKey}" : ${makeTemplateRecursive(
        value,
        escapedKey,
        newPath,
        currentIndent + 2
      )}`;
    })
    .join();

  return key
    ? `{
${makeIndent(currentIndent + 1)}"M": {${entries}
${makeIndent(currentIndent + 1)}}
${makeIndent(currentIndent)}}`
    : `{ ${entries}
${makeIndent(currentIndent)}}`;
};

const makeTemplateRecursive = <T extends z.ZodTypeAny>(
  schema: T,
  key?: string,
  path?: string,
  indentLevel?: number
): string => {
  if (schema instanceof ZodObject) {
    return doObject(schema, key, path, indentLevel);
  }

  if (schema instanceof ZodArray) {
    return doArray(schema, key, path, indentLevel);
  }

  if (schema instanceof ZodNumber) {
    return doOther('N', key, path, indentLevel);
  }

  if (schema instanceof ZodString) {
    return doOther('S', key, path, indentLevel);
  }

  if (schema instanceof ZodBoolean) {
    return doOther('BOOL', key, path, indentLevel);
  }

  if (schema instanceof ZodDate) {
    const dateObject = z.object({
      $type: z.string(),
      value: z.string(),
    });
    return doObject(dateObject, key, path, indentLevel);
  }
};

export const makeMappingTemplate = <T extends z.ZodTypeAny>(
  schema: T,
  tableName: string,
  additional?: string
): string => {
  const add = additional ? `\n${makeIndent(1)}${additional}` : ``;
  return `{${add}\n#set ( $d = "$")\n
${makeIndent(1)}"Item": ${makeTemplateRecursive(
    schema,
    undefined,
    undefined,
    1
  )},
${makeIndent(1)}"TableName": "${tableName}"
}`;
};
