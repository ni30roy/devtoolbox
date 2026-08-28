import type { ToolCategory, ToolMeta } from './types'

export const categories: ToolCategory[] = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Format, validate, minify, and otherwise wrangle JSON data.',
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Utilities for cleaning up and transforming plain text.',
  },
  {
    id: 'encoding',
    name: 'Encoding',
    description: 'Encode and decode common web data formats.',
  },
  {
    id: 'formatting',
    name: 'Formatting',
    description: 'Beautify and lint code and markup.',
  },
  {
    id: 'converters',
    name: 'Converters',
    description: 'Convert data between common formats.',
  },
]

export const tools: ToolMeta[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    tagline: 'Beautify messy or minified JSON into readable, indented text.',
    metaDescription:
      'Free online JSON formatter and beautifier. Paste minified or messy JSON and get clean, indented output instantly. Runs entirely in your browser — nothing is uploaded.',
    categoryId: 'json',
    keywords: ['json formatter', 'json beautifier', 'format json', 'pretty print json', 'indent json'],
    h1: 'JSON Formatter & Beautifier',
    intro: [
      'Paste or drop in any JSON payload and this tool will reformat it with consistent indentation, making deeply nested objects and arrays actually readable. It handles minified API responses, log dumps, and hand-edited config files equally well.',
      "Everything runs locally in your browser using the engine built into JavaScript itself — your JSON is never uploaded to a server, logged, or stored anywhere. That matters if you're pasting in production data, auth tokens, or anything else you'd rather keep private.",
    ],
    details: [
      {
        heading: 'Why formatting JSON matters',
        paragraphs: [
          "APIs and databases usually return JSON with no whitespace at all, which is great for network transfer and terrible for a human trying to read it. Formatting adds line breaks and indentation back in so you can see the document's structure at a glance — which array holds which objects, where a nested value actually lives, and where a trailing comma or missing bracket broke the whole thing.",
        ],
      },
      {
        heading: 'Choosing an indent size',
        paragraphs: [
          'Two spaces is the most common default in JSON tooling and keeps deeply nested documents from running off the side of the screen. Four spaces reads a little more clearly for shallow documents, and tabs let each viewer render the indentation width they personally prefer. Switch between them with the indent selector above — reformatting is instant, so feel free to try a few.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is my JSON data uploaded anywhere?',
        answer:
          'No. Formatting happens entirely in your browser using JavaScript\'s built-in JSON parser, running in a background thread. No network request is made — your data never leaves your device.',
      },
      {
        question: 'Can it fix invalid JSON automatically?',
        answer:
          "It won't silently guess at a fix, since that can hide real bugs, but it will point you straight at the problem: the exact line and column where parsing failed, plus a snippet of the surrounding text so you can see what's wrong.",
      },
      {
        question: 'Will it handle large JSON files?',
        answer:
          'Yes. Formatting runs in a Web Worker on a separate thread, so the page stays responsive while it works, even on multi-megabyte files. Extremely large files (tens of megabytes or more) will still take a few seconds simply because of how much text there is to process — that\'s a browser memory limit, not a network wait.',
      },
      {
        question: 'What is the difference between this and the JSON Validator?',
        answer:
          "They share the same underlying engine. The formatter is optimized for turning valid JSON into readable output; the validator is optimized for checking whether JSON is valid at all and explaining exactly why when it isn't. You can format, validate, or minify from any of the three pages — the buttons are all here.",
      },
    ],
    popular: true,
    addedAt: '2026-08-18',
    workbench: 'json',
    jsonMode: 'format',
  },
  {
    slug: 'json-validator',
    name: 'JSON Validator',
    tagline: 'Check whether JSON is valid and get a precise error location.',
    metaDescription:
      'Validate JSON online for free. Paste your JSON to instantly check it\'s syntactically correct, with the exact line and column of any error. All processing happens locally in your browser.',
    categoryId: 'json',
    keywords: ['json validator', 'validate json', 'json syntax checker', 'json linter', 'check json'],
    h1: 'JSON Validator',
    intro: [
      "Paste in JSON and validate it against the JSON specification. If it's valid, you'll see a clear confirmation along with basic stats about the document. If it isn't, you'll get the exact line and column where parsing broke, plus a snippet of the surrounding text — no more scanning a wall of minified text character by character.",
      'Validation runs locally using the same JSON engine built into your browser, so nothing you paste is ever sent to a server.',
    ],
    details: [
      {
        heading: 'Common reasons JSON fails to validate',
        paragraphs: [
          "The most frequent culprits are trailing commas after the last item in an array or object (valid in JavaScript object literals, invalid in JSON), single quotes instead of double quotes around strings and keys, unquoted object keys, and comments — JSON has no comment syntax at all, unlike JSON5 or JSONC. Missing or mismatched brackets and braces are the other common source, especially in hand-edited config files.",
        ],
      },
      {
        heading: 'Reading the error location',
        paragraphs: [
          "When validation fails, the line and column point to where the parser first noticed something was wrong — which is usually right at or just after the actual mistake. If the error says \"unexpected end of input,\" look for an unclosed bracket, brace, or quote somewhere earlier in the document; the parser reached the end of your text while still expecting more.",
        ],
      },
    ],
    faqs: [
      {
        question: 'Does this check against a JSON Schema?',
        answer:
          "No — this checks that the text is syntactically valid JSON per the JSON specification (RFC 8259), not that it matches a particular shape or schema. Schema validation is a different problem; this tool focuses on catching syntax errors like trailing commas, unquoted keys, and mismatched brackets.",
      },
      {
        question: 'Why does it say my JSON is invalid when it looks fine?',
        answer:
          'A few things are valid in JavaScript but not in JSON: trailing commas, single-quoted strings, unquoted keys, and comments. If your JSON was copied from JavaScript source code rather than an API response, one of those is a likely cause — check the exact line and column shown in the error.',
      },
      {
        question: 'Is there a limit on how much JSON I can validate?',
        answer:
          "There's no hard-coded limit — validation runs in a Web Worker so the page won't freeze — but very large documents (tens of megabytes) will take longer simply because there's more text to scan, and are bound by your browser's available memory.",
      },
      {
        question: 'Can I validate JSON without an internet connection?',
        answer:
          'Once the page has loaded, yes. All validation logic runs locally in your browser with no server round trip, so it keeps working offline.',
      },
    ],
    popular: true,
    addedAt: '2026-08-21',
    workbench: 'json',
    jsonMode: 'validate',
  },
  {
    slug: 'json-minifier',
    name: 'JSON Minifier',
    tagline: 'Strip whitespace from JSON to shrink payload size.',
    metaDescription:
      'Minify JSON online for free — remove all unnecessary whitespace to reduce file size for storage or transfer. Runs locally in your browser; your JSON is never uploaded.',
    categoryId: 'json',
    keywords: ['json minifier', 'minify json', 'compress json', 'json compact', 'remove json whitespace'],
    h1: 'JSON Minifier',
    intro: [
      'Paste in formatted or messy JSON and this tool strips every unnecessary space, tab, and line break, collapsing it down to the smallest valid representation. The result is functionally identical JSON — just smaller, which matters when you\'re storing it, embedding it in a URL, or shipping it over the network.',
      "Minification happens entirely client-side, and the tool shows you exactly how many bytes you saved so you can see the impact before you use the output.",
    ],
    details: [
      {
        heading: 'When minifying JSON actually helps',
        paragraphs: [
          "Minified JSON is smaller to transmit and store, which is worth doing for payloads embedded in URLs, config values stored in environment variables or databases, or any response served over a slow connection. In practice, most production APIs already return minified JSON by default and rely on gzip/Brotli compression on top — compression typically shrinks whitespace-heavy JSON almost as much as manual minification does, so minifying mainly helps for cases where compression isn't in the picture.",
        ],
      },
      {
        heading: "It's not obfuscation",
        paragraphs: [
          "Minifying only removes whitespace — it doesn't rename keys, encrypt values, or hide the data in any way. Anyone with the minified output can read every key and value just as easily as in the formatted version; it's purely a size optimization, not a privacy or security measure.",
        ],
      },
    ],
    faqs: [
      {
        question: 'Does minifying change the data itself?',
        answer:
          'No. Minifying only removes insignificant whitespace between tokens — every key, value, array, and object stays exactly as it was. Parsing the minified output gives you back an identical data structure to parsing the original.',
      },
      {
        question: 'How much smaller will my JSON get?',
        answer:
          "It depends entirely on how much whitespace the original has. Deeply nested, heavily indented JSON can shrink by 30-50% or more; JSON that was already compact will barely change. The tool shows the exact before/after byte size so you can see the real savings for your data.",
      },
      {
        question: "Should I minify JSON I'm about to gzip or store compressed?",
        answer:
          "Usually not necessary — gzip and Brotli compress repeated whitespace extremely well, so a compressed formatted file and a compressed minified file often end up close in size. Minifying is most useful when compression isn't already happening, such as JSON embedded directly in a URL query string or an uncompressed database column.",
      },
      {
        question: 'Can I reformat minified JSON back to readable form?',
        answer:
          "Yes — minifying is fully reversible in terms of readability. Paste the minified output into the JSON Formatter and it will reindent it. No information is lost during minification, so you can always convert back and forth.",
      },
    ],
    popular: false,
    addedAt: '2026-08-25',
    workbench: 'json',
    jsonMode: 'minify',
  },
  {
    slug: 'json-beautifier',
    name: 'JSON Beautifier',
    tagline: 'Pretty-print messy or minified JSON with clean, configurable indentation.',
    metaDescription:
      'Beautify and format JSON online for free. Format messy JSON with proper indentation instantly in your browser. Fast, private, and easy to use.',
    categoryId: 'json',
    keywords: ['json beautifier', 'beautify json', 'json beautify online', 'pretty print json', 'format json online'],
    h1: 'JSON Beautifier',
    intro: [
      'Paste minified, compressed, or just messy JSON below and this beautifier reindents it into clean, readable text in an instant — no installs, no uploads, and no waiting on a server round trip. Click "Sample" above the input if you want to see it in action first.',
      "It works the same whether your JSON came from an API response, a log file, a browser DevTools network tab, or a teammate's chat message — anything valid gets reformatted with consistent spacing so you can actually read it.",
    ],
    details: [
      {
        heading: 'JSON beautifier vs. JSON formatter',
        paragraphs: [
          '"Beautify" and "format" describe the exact same operation on JSON: adding indentation and line breaks back into a document so its structure is easy to read. There is no technical difference between a "JSON beautifier" and a "JSON formatter" — they\'re just two common names people search for the same thing, and this page produces identical output to the JSON Formatter on this site. Use whichever page you found first; the indentation options and results are the same.',
        ],
      },
      {
        heading: 'How to beautify JSON in three steps',
        paragraphs: [
          '1. Paste your JSON into the input box above, drop a .json file onto it, or click "Sample" to try the tool with example data. 2. Pick an indent width — 2 spaces, 4 spaces, or tabs — from the selector in the toolbar. 3. Click "Format" and your beautified JSON appears on the right, ready to copy or download.',
        ],
      },
      {
        heading: 'Why properly formatted JSON is useful',
        paragraphs: [
          "Minified JSON is optimized for machines, not people — a single unbroken line of text hides exactly how deeply nested a value is, which array an object belongs to, and where a document actually ends. Beautifying it restores the visual structure, which makes debugging an API response, reviewing a config file, or explaining a payload to a teammate dramatically faster than scrolling through a wall of text.",
        ],
      },
    ],
    faqs: [
      {
        question: 'What is a JSON beautifier?',
        answer:
          'A JSON beautifier is a tool that takes JSON text — however it\'s currently formatted, including fully minified — and rewrites it with consistent indentation and line breaks so it\'s easy for a person to read.',
      },
      {
        question: 'How do I beautify JSON online?',
        answer:
          'Paste your JSON into the input box on this page, choose an indent width, and click "Format." The beautified result appears immediately on the right — entirely in your browser, with no page reload.',
      },
      {
        question: 'Is my JSON uploaded to a server?',
        answer:
          "No. Beautifying runs entirely in your browser using JavaScript's built-in JSON engine, in a background thread. Nothing you paste or upload is ever sent over the network.",
      },
      {
        question: 'What is the difference between JSON beautify and JSON minify?',
        answer:
          "They're opposites: beautifying adds whitespace and indentation to make JSON readable, while minifying strips all of it out to make the file as small as possible. Both produce the exact same data — only the whitespace differs — and you can switch between them on this page using the Format and Minify buttons.",
      },
      {
        question: 'Can I download formatted JSON?',
        answer:
          'Yes — after beautifying, use the Download button to save the result as a .json file, or Copy to put it directly on your clipboard.',
      },
    ],
    popular: false,
    addedAt: '2026-08-29',
    workbench: 'json',
    jsonMode: 'format',
  },
]

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return tools.find((tool) => tool.slug === slug)
}

export function getCategoryById(id: string): ToolCategory | undefined {
  return categories.find((category) => category.id === id)
}
