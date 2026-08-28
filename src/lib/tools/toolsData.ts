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
  {
    slug: 'json-to-yaml',
    name: 'JSON to YAML Converter',
    tagline: 'Convert JSON into clean, readable YAML.',
    metaDescription:
      'Convert JSON to YAML online for free. Transform JSON data into clean, readable YAML instantly in your browser. Fast, private, and easy to use.',
    categoryId: 'json',
    keywords: ['json to yaml', 'json to yaml converter', 'convert json to yaml', 'json yaml online', 'yaml from json'],
    h1: 'JSON to YAML Converter',
    intro: [
      'Paste JSON below and convert it straight to YAML — objects, nested structures, arrays, strings, numbers, booleans, and null are all preserved correctly, using a proper YAML serializer rather than a naive line-by-line rewrite. Click "Sample" to see a realistic example first.',
      'Conversion happens entirely in your browser: nothing you paste is ever uploaded, and there\'s no external conversion API involved anywhere in the process.',
    ],
    details: [
      {
        heading: 'What is JSON to YAML conversion?',
        paragraphs: [
          "JSON and YAML are both text formats for representing the same kind of data — objects, arrays, strings, numbers, booleans, and null — just with different syntax. Converting JSON to YAML takes a parsed JSON document and re-serializes it using YAML's indentation-based syntax instead of JSON's braces and brackets, without changing the underlying data in any way.",
        ],
      },
      {
        heading: 'How to convert JSON to YAML',
        paragraphs: [
          '1. Paste your JSON into the input box above, or click "Sample" to try it with example data. 2. Click "Convert to YAML." 3. Copy the result or download it as a .yaml file — the output on the right is ready to use as soon as conversion finishes.',
        ],
      },
      {
        heading: 'JSON vs. YAML — and when to use each',
        paragraphs: [
          "JSON is compact, has no ambiguity about whitespace, and is the native format for almost every web API and JavaScript codebase — it's the right choice when machines are reading and writing the data. YAML trades some of that compactness for readability: no quotes around most keys, no trailing commas to get wrong, and support for comments, which JSON doesn't have at all. That makes YAML the more common choice for files a human edits directly and rarely round-trips through code — Kubernetes manifests, CI/CD pipeline definitions (GitHub Actions, GitLab CI), Docker Compose files, and application config are all typically written in YAML even when the underlying tooling could just as easily accept JSON.",
        ],
      },
      {
        heading: 'Privacy: everything stays in your browser',
        paragraphs: [
          "Parsing and conversion both run locally using your browser's own JavaScript engine, offloaded to a background thread so the page stays responsive even on larger documents. Your JSON is never sent to a server, logged, or stored — closing the tab leaves nothing behind.",
        ],
      },
    ],
    faqs: [
      {
        question: 'What is JSON to YAML conversion?',
        answer:
          "It's the process of taking a JSON document and re-writing it in YAML syntax — same data, same structure, different (more human-readable) formatting.",
      },
      {
        question: 'How do I convert JSON to YAML?',
        answer: 'Paste your JSON into the input box on this page and click "Convert to YAML." The result appears immediately on the right.',
      },
      {
        question: 'Is my JSON uploaded to a server?',
        answer:
          "No. Conversion runs entirely in your browser, in a background thread. Nothing you paste is ever sent over the network.",
      },
      {
        question: 'What is the difference between JSON and YAML?',
        answer:
          "They represent the same kinds of data — objects, arrays, strings, numbers, booleans, null — but JSON uses braces, brackets, and quoted keys, while YAML uses indentation and mostly unquoted keys, and additionally supports comments. Any valid JSON document converts losslessly to an equivalent YAML document.",
      },
      {
        question: 'Can I download the converted YAML?',
        answer: 'Yes — use the Download button to save the result as a .yaml file, or Copy to put it directly on your clipboard.',
      },
      {
        question: 'Does this converter support nested JSON?',
        answer:
          'Yes. Deeply nested objects and arrays are converted with correct, consistent indentation at every level — there is no nesting-depth limit beyond what your browser can hold in memory.',
      },
      {
        question: 'Can I convert JSON arrays to YAML?',
        answer:
          'Yes, including arrays of objects and arrays nested inside other arrays or objects — each becomes a properly indented YAML sequence.',
      },
    ],
    popular: false,
    addedAt: '2026-08-30',
    workbench: 'json-to-yaml',
  },
  {
    slug: 'base64-encoder-decoder',
    name: 'Base64 Encoder & Decoder',
    tagline: 'Encode text to Base64 or decode Base64 back to text, with full Unicode support.',
    metaDescription:
      'Encode and decode Base64 online for free. Convert text to Base64 or Base64 back to text instantly in your browser. Fast, private, and easy to use.',
    categoryId: 'encoding',
    keywords: ['base64 encoder', 'base64 decoder', 'base64 encode online', 'base64 decode online', 'text to base64', 'base64 to text'],
    h1: 'Base64 Encoder & Decoder',
    intro: [
      'Encode text to Base64, or decode Base64 back to readable text — both directions run entirely in your browser. Unicode is handled correctly in both directions, so Hindi, emoji, Chinese, Japanese, and accented characters all round-trip exactly, unlike a bare browser btoa()/atob() call, which breaks on anything outside plain ASCII.',
      'Click "Sample" to load a realistic example, or paste your own text or Base64 and switch between Encode and Decode at any time.',
    ],
    details: [
      {
        heading: 'What is Base64?',
        paragraphs: [
          "Base64 is a way of representing arbitrary binary data — or text — using only 64 printable ASCII characters (A–Z, a–z, 0–9, +, /, with = used for padding). Encoding converts your original text into that safe, transportable form; decoding reverses the process, turning Base64 back into the exact original text. Nothing about the underlying data changes — only how it's represented as characters.",
        ],
      },
      {
        heading: 'How to encode and decode',
        paragraphs: [
          'To encode: paste or type your text into the input box, then click "Encode." To decode: switch to "Decode," paste Base64 text into the input box, and click "Decode." In both cases the result appears immediately on the right, ready to copy or download — there\'s no separate submit step and nothing leaves your browser.',
        ],
      },
      {
        heading: 'Where Base64 is used — and what it is not',
        paragraphs: [
          "Base64 shows up anywhere binary or special-character data needs to safely travel through a system that only handles plain text: embedding small images directly in CSS or HTML as data URLs, attaching files to emails (MIME), sending binary data inside JSON or XML, encoding the header and payload of a JWT, and building HTTP Basic Authentication credentials.",
          'Base64 is an encoding, not encryption — it does not protect data. Anyone can decode Base64 back to the original text instantly, with no key or password required, using this tool or any of dozens of others. Base64 is not encryption and should not be used to protect sensitive data; use real encryption (e.g. AES) if confidentiality actually matters.',
        ],
      },
      {
        heading: 'Privacy: everything stays in your browser',
        paragraphs: [
          'Encoding and decoding both run locally using your browser\'s built-in JavaScript engine — nothing you type or paste is ever uploaded to a server, logged, or stored. That makes it a reasonable choice for encoding developer text you\'d rather keep off a third-party server, even though (as above) Base64 itself provides no confidentiality on its own.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is Base64?',
        answer:
          'Base64 is a text-safe way to represent binary data or text using 64 printable ASCII characters. It\'s used to safely embed or transmit data through systems designed for plain text.',
      },
      {
        question: 'Is Base64 encryption?',
        answer:
          'No. Base64 is an encoding, not encryption — it provides no security or confidentiality. Anyone can decode it instantly with no key or password. Do not use Base64 to protect sensitive data; use real encryption if confidentiality matters.',
      },
      {
        question: 'How do I encode text to Base64?',
        answer: 'Paste or type your text into the input box, make sure "Encode" is selected, and click it. The Base64 result appears immediately on the right.',
      },
      {
        question: 'How do I decode Base64?',
        answer: 'Switch to "Decode," paste your Base64 text into the input box, and click "Decode." The original text appears on the right.',
      },
      {
        question: 'Does this Base64 tool support Unicode?',
        answer:
          'Yes. Text is converted to and from UTF-8 bytes before Base64 encoding, so Hindi, emoji, Chinese, Japanese, accented characters, and any other Unicode text round-trip exactly — unlike a plain browser btoa()/atob() call, which throws an error on anything outside basic ASCII.',
      },
      {
        question: 'Is my input uploaded to a server?',
        answer: 'No. Encoding and decoding both run entirely in your browser. Nothing you type or paste is ever sent over the network.',
      },
      {
        question: 'Can I decode Base64 back to text?',
        answer: 'Yes — switch to "Decode," paste the Base64, and click "Decode" to get the original text back exactly as it was encoded.',
      },
      {
        question: 'What characters are valid in Base64?',
        answer:
          'Standard Base64 uses A–Z, a–z, 0–9, plus "+" and "/", with "=" used only for padding at the end. Any other character means the text isn\'t valid Base64 — this tool will tell you exactly which character is the problem.',
      },
    ],
    popular: false,
    addedAt: '2026-08-31',
    workbench: 'base64',
  },
  {
    slug: 'url-encoder-decoder',
    name: 'URL Encoder & Decoder',
    tagline: 'Encode text for safe use inside a URL, or decode percent-encoded text back to normal.',
    metaDescription:
      'Encode and decode URLs online for free. Safely encode URL components and decode percent-encoded text instantly in your browser. Fast, private, and easy to use.',
    categoryId: 'encoding',
    keywords: ['url encoder', 'url decoder', 'url encode online', 'url decode online', 'percent encoding', 'encodeuricomponent'],
    h1: 'URL Encoder & Decoder',
    intro: [
      'Encode text so it\'s safe to use inside a URL — as a query parameter value, a path segment, or any user-provided text — or decode percent-encoded text back to normal. Both directions run entirely in your browser and handle Unicode correctly.',
      'This tool uses component-style encoding (the same rules as JavaScript\'s encodeURIComponent), which is the right choice for encoding a single value that will sit inside a URL, as opposed to encoding an entire URI. Click "Sample" to see the difference in action.',
    ],
    details: [
      {
        heading: 'What is URL encoding and decoding?',
        paragraphs: [
          'URL encoding (also called percent-encoding) replaces characters that aren\'t safe to use directly inside a URL with a "%" followed by two hexadecimal digits representing that character\'s byte value — a space becomes %20, an "&" becomes %26, and so on. Decoding reverses the process, turning percent-encoded text back into the original characters.',
        ],
      },
      {
        heading: 'Why URLs need encoding, and what characters need it',
        paragraphs: [
          'URLs use certain characters structurally — & separates query parameters, = joins a key to its value, ? starts the query string, # starts a fragment, / separates path segments. If a value you want to put inside a URL contains one of those characters, or a space, or non-ASCII text, it has to be encoded first — otherwise the URL would be parsed incorrectly (or simply broken). Letters, digits, and a small set of punctuation (- _ . ! ~ * \' ( )) are left unencoded because they\'re already safe; almost everything else, including all Unicode text, gets percent-encoded.',
        ],
      },
      {
        heading: 'encodeURIComponent vs. encodeURI — and why "+" and "%20" can differ',
        paragraphs: [
          'JavaScript actually has two different encoding functions, and mixing them up is a common source of bugs. encodeURI() is for encoding a whole, already-structured URI — it deliberately leaves :, /, ?, &, and # alone, since those are meaningful delimiters in a full URL. encodeURIComponent() — what this tool uses — is for encoding a single component that will be inserted into a URL, so it encodes those same characters too, since inside a component they\'re just literal text, not delimiters.',
          'You may also see spaces represented as "+" instead of "%20" — that\'s a separate, older convention specific to application/x-www-form-urlencoded (traditional HTML form submissions), not part of encodeURIComponent or the URL spec itself. This tool follows the standard encodeURIComponent behavior throughout: spaces become %20, and a literal "+" in your input is itself encoded to %2B rather than being left alone or treated as a space.',
        ],
      },
      {
        heading: 'Privacy — and this is encoding, not security',
        paragraphs: [
          'Encoding and decoding both run locally using your browser\'s built-in JavaScript engine — nothing you type or paste is ever uploaded to a server. And just like Base64, URL encoding is not encryption: it provides no confidentiality. Anyone can decode percent-encoded text instantly with no key required, so don\'t rely on it to protect sensitive information — use real encryption if confidentiality actually matters.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is URL encoding?',
        answer:
          'URL encoding (percent-encoding) replaces characters that aren\'t safe inside a URL with a "%" followed by two hex digits representing that character\'s byte value, so the resulting text can be safely used as a URL component.',
      },
      {
        question: 'What is URL decoding?',
        answer: 'URL decoding reverses percent-encoding, turning %-encoded text back into the original characters exactly as they were before encoding.',
      },
      {
        question: 'How do I encode a URL?',
        answer: 'Paste or type your text into the input box, make sure "Encode" is selected, and click it. The encoded result appears immediately on the right.',
      },
      {
        question: 'How do I decode a URL?',
        answer: 'Switch to "Decode," paste the percent-encoded text into the input box, and click "Decode." The original text appears on the right.',
      },
      {
        question: 'What is the difference between encodeURI and encodeURIComponent?',
        answer:
          'encodeURI() encodes a whole URI and leaves structural characters like :, /, ?, &, and # alone, since they\'re meaningful delimiters in a full URL. encodeURIComponent() — used by this tool — encodes those characters too, because it\'s meant for a single value being inserted into a URL, where they\'re just literal text rather than delimiters.',
      },
      {
        question: 'Why does a space become %20?',
        answer: 'A space isn\'t a valid character inside a URL, so it\'s percent-encoded to its byte value in hex — 0x20 — giving %20. That\'s the standard encodeURIComponent (and URL spec) behavior this tool follows.',
      },
      {
        question: 'Why is + sometimes used for spaces?',
        answer:
          'That convention comes from application/x-www-form-urlencoded (traditional HTML form submissions), not from encodeURIComponent or the general URL spec. This tool always encodes spaces as %20, and encodes a literal "+" in your input to %2B rather than leaving it as-is.',
      },
      {
        question: 'Does URL encoding protect sensitive information?',
        answer:
          'No. URL encoding is not encryption and provides no confidentiality — anyone can decode it instantly with no key required. Never use it to protect sensitive data; use real encryption if confidentiality matters.',
      },
      {
        question: 'Does this tool support Unicode?',
        answer: 'Yes. Hindi, emoji, Chinese, Japanese, accented characters, and any other Unicode text are encoded and decoded correctly and round-trip exactly.',
      },
      {
        question: 'Is my URL uploaded to a server?',
        answer: 'No. Encoding and decoding both run entirely in your browser. Nothing you type or paste is ever sent over the network.',
      },
    ],
    popular: false,
    addedAt: '2026-09-01',
    workbench: 'url',
  },
]

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return tools.find((tool) => tool.slug === slug)
}

export function getCategoryById(id: string): ToolCategory | undefined {
  return categories.find((category) => category.id === id)
}
