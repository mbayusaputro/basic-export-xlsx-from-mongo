/* eslint-disable */
import { Buffer } from 'buffer';

const superscriptMap: { [key: string]: string } = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻'
};

export function latexToText(latex: string): string {
  let result = latex;
  result = result.replace(/\\text\{([^}]+)\}/g, '$1');
  result = result.replace(/\\times/g, '×');
  result = result.replace(/\\left\(/g, '').replace(/\\right\)/g, '');
  result = result.replace(/\\([A-Za-z]+)\^{(-?\d+)}/g, (_, p1, p2) => {
    return (
      p1 +
      p2
        .split('')
        .map((char: any) => superscriptMap[char])
        .join('')
    );
  });
  result = result.replace(/\\frac\{([^\}]+)\}\{([^\}]+)\}/g, '($1 / $2)');
  return result;
}

const convertSubscript = (str: string): string => {
  // Subscript conversion
  str = str.replace(/_([0-9a-z])/g, (_, digit) => {
    let unicodeValue;
    if (/[0-9]/.test(digit)) {
      unicodeValue = 0x2080 + parseInt(digit); // Subscript numbers
    } else if (/[a-z]/.test(digit)) {
      unicodeValue = 0x2090 + (digit.charCodeAt(0) - 'a'.charCodeAt(0)); // Subscript letters
    } else {
      return _;
    }
    const utf8Bytes =
      Buffer.from(String.fromCharCode(unicodeValue), 'utf8') // Convert to UTF-8 bytes
        .toString('hex') // Convert to hex
        .match(/.{1,2}/g) // Split into byte pairs
        ?.map(byte => `\\x${byte.toUpperCase()}`) // Format as \xHH
        .join('') || ''; // Join bytes back

    return utf8Bytes;
  });
  return str;
};

export const decodeUnicodeEscapeSequences = (
  str: string,
): string => {
  str = convertSubscript(str);
  // Formula
  str = str.replace(/\$\$(.*?)\$\$/g, (_, value) => {
    value = value.replace(/<br>/g, '');
    value = value.replace(/\\\\\\\\/g, '\\');
    value = value.replace(/\\\\/g, '\\');
    return latexToText(value); // Modify the value (e.g., uppercase)
  });
  // Decode Unicode escape sequences (\uXXXX)
  str = str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  // Convert \xHH sequences into raw bytes
  const bytes = str.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  // Convert the string into a Uint8Array
  const byteArray = Array.from(bytes, c => c.charCodeAt(0));
  // Use TextDecoder to properly interpret UTF-8 encoded bytes
  const txt = new TextDecoder('utf-8').decode(new Uint8Array(byteArray));
  // Remove all remaining backslashes
  return txt.replace(/\\\\/g, '\\');
};

export function markdownToPlainText(markdown: string) {
  // Remove headers
  let plainText = markdown.replace(/^#+\s*(.*)/gm, "$1");

  // Remove bold and italic (asterisks and underscores)
  plainText = plainText.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold
  plainText = plainText.replace(/\*(.*?)\*/g, "$1"); // Italic
  plainText = plainText.replace(/__(.*?)__/g, "$1"); // Bold (underscore)
  plainText = plainText.replace(/_(.*?)_/g, "$1"); // Italic (underscore)

  // Remove inline code
  plainText = plainText.replace(/`(.*?)`/g, "$1");

  // Remove links but keep the text
  plainText = plainText.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

  // Remove images but keep the alt text
  plainText = plainText.replace(/!\[([^\]]+)\]\([^\)]+\)/g, "$1");

  // Remove blockquotes
  plainText = plainText.replace(/^>\s?/gm, "");

  // Remove unordered list markers
  plainText = plainText.replace(/^\s*[-\*+]\s+/gm, "");

  // Remove ordered list markers
  plainText = plainText.replace(/^\s*\d+\.\s+/gm, "");

  // Remove horizontal rules
  plainText = plainText.replace(/^\s*(\*\s?){3,}|(-\s?){3,}|(_\s?){3,}$/gm, "");

  // Remove strikethrough
  plainText = plainText.replace(/~~(.*?)~~/g, "$1");

  // Remove tables (keep cell content)
  plainText = plainText.replace(/\|/g, "");
  plainText = plainText.replace(/\-+/g, "");

  // Remove all <br /> tags
  plainText = plainText.replace(/<br\s*\/?>/gi, "");

  // Replace multiple spaces with a single space
  plainText = plainText.replace(/\s+/g, " ");

  // Trim unnecessary whitespace
  plainText = plainText.trim();

  return plainText;
}