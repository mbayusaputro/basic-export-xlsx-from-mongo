function hexToUtf8(str: string) {
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
  return txt.replace(/\\/g, '');
}

function markdownToPlainText(markdown: string) {
  // Remove headers
  let plainText = markdown.replace(/^#+\s*(.*)/gm, '$1');

  // Remove bold and italic (asterisks and underscores)
  plainText = plainText.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
  plainText = plainText.replace(/\*(.*?)\*/g, '$1'); // Italic
  plainText = plainText.replace(/__(.*?)__/g, '$1'); // Bold (underscore)
  plainText = plainText.replace(/_(.*?)_/g, '$1'); // Italic (underscore)

  // Remove inline code
  plainText = plainText.replace(/`(.*?)`/g, '$1');

  // Remove links but keep the text
  plainText = plainText.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Remove images but keep the alt text
  plainText = plainText.replace(/!\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Remove blockquotes
  plainText = plainText.replace(/^>\s?/gm, '');

  // Remove unordered list markers
  plainText = plainText.replace(/^\s*[-\*+]\s+/gm, '');

  // Remove ordered list markers
  plainText = plainText.replace(/^\s*\d+\.\s+/gm, '');

  // Remove horizontal rules
  plainText = plainText.replace(/^\s*(\*\s?){3,}|(-\s?){3,}|(_\s?){3,}$/gm, '');

  // Remove strikethrough
  plainText = plainText.replace(/~~(.*?)~~/g, '$1');

  // Remove tables (keep cell content)
  plainText = plainText.replace(/\|/g, '');
  plainText = plainText.replace(/\-+/g, '');

  // Remove all <br /> tags
  plainText = plainText.replace(/<br\s*\/?>/gi, '');

  // Replace multiple spaces with a single space
  plainText = plainText.replace(/\s+/g, ' ');

  // Trim unnecessary whitespace
  plainText = plainText.trim();

  return plainText;
}

export { markdownToPlainText, hexToUtf8 }