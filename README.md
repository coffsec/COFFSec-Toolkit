<div align="center">

# COFFSec Toolkit

**A curated collection of practical cybersecurity tools and resources for security professionals.**

[![Live Toolkit](https://img.shields.io/badge/Live-Toolkit-0A66C2?style=for-the-badge&logo=googlechrome&logoColor=white)](https://toolkit.coffsec.com)
[![COFFSec](https://img.shields.io/badge/COFFSec-Official-111111?style=for-the-badge&logo=github&logoColor=white)](https://coffsec.com)
[![License](https://img.shields.io/badge/License-TBD-8A2BE2?style=for-the-badge)](#license)
[![Made for Security Professionals](https://img.shields.io/badge/Made%20for-Security%20Professionals-red?style=for-the-badge)](#who-its-for)

**Explore the toolkit at [toolkit.coffsec.com](https://toolkit.coffsec.com)**

</div>

---

## Overview

**COFFSec Toolkit** is COFFSec's online collection of practical cybersecurity tools, references, and utilities, built to support security professionals across offensive security, defensive security, and security research workflows.

The project is guided by a single principle:

> **Make useful security knowledge and tooling accessible, practical, and easy to apply.**

Whether you are a penetration tester, red teamer, security engineer, SOC analyst, developer, or researcher, the toolkit is designed to help you move quickly from intent to action.

---

## Table of Contents

- [Tool Categories](#tool-categories)
  - [Cryptography and Encryption](#cryptography-and-encryption)
  - [Hashing](#hashing)
  - [Encoding and Decoding](#encoding-and-decoding)
  - [Formatters and Beautifiers](#formatters-and-beautifiers)
  - [Developer Utilities](#developer-utilities)
  - [Editors and Generators](#editors-and-generators)
  - [Network and Reconnaissance](#network-and-reconnaissance)
- [Use Cases](#use-cases)
- [Getting Started](#getting-started)
- [Who It's For](#who-its-for)
- [Design Principles](#design-principles)
- [Responsible Use](#responsible-use)
- [Contributing](#contributing)
- [Contact](#contact)

---

## Tool Categories

The toolkit is organized into categories so that you can locate the right tool quickly.

### Cryptography and Encryption

Tools for key generation, encryption, and cryptographic testing.

| Tool | Description |
|---|---|
| **[AES](https://toolkit.coffsec.com/aes)** | Encrypt and decrypt data using the Advanced Encryption Standard for symmetric cryptography. |
| **[RSA](https://toolkit.coffsec.com/rsa)** | Generate RSA key pairs and perform asymmetric encryption and decryption. |
| **[ECC](https://toolkit.coffsec.com/ecc)** | Perform Elliptic Curve Cryptography for modern, efficient public key operations. |
| **[Bcrypt](https://toolkit.coffsec.com/bcrypt)** | Generate and verify bcrypt password hashes. |
| **[XOR](https://toolkit.coffsec.com/xor)** | Apply bitwise XOR operations to text or binary data. Intended for analysis and training, not for data protection. |
| **[Caesar Cipher](https://toolkit.coffsec.com/caesar)** | Encode and decode text using a classical substitution shift cipher. Intended for education and demonstration. |
| **[IPv4 Obfuscation](https://toolkit.coffsec.com/ipv4fuscation)** | Convert IPv4 addresses to decimal, hexadecimal, or octal representations for testing and payload analysis. |

<details>
<summary>Screenshots</summary>

<img width="486" height="407" alt="AES tool" src="https://github.com/user-attachments/assets/8448842d-b68c-410e-995d-ae0cf2de26a9" />
<img width="467" height="434" alt="RSA tool" src="https://github.com/user-attachments/assets/5827ad54-31fb-4392-a3d2-e341e903ca56" />
<img width="468" height="436" alt="ECC tool" src="https://github.com/user-attachments/assets/5e4d07b4-6049-4c61-9cba-2aa817ce9d69" />
<img width="629" height="310" alt="Bcrypt tool" src="https://github.com/user-attachments/assets/5901cdeb-a085-4c70-aa44-f13ef1b25586" />
<img width="638" height="365" alt="XOR tool" src="https://github.com/user-attachments/assets/aa22169c-539a-4abf-ad1f-a2fb6053fb97" />
<img width="617" height="377" alt="Caesar Cipher tool" src="https://github.com/user-attachments/assets/faae559c-c9a9-4e02-be36-61246e0f2d30" />
<img width="615" height="359" alt="IPv4 Obfuscation tool" src="https://github.com/user-attachments/assets/d68057e7-19cd-4555-a6c2-eac9d3a83649" />

</details>

### Hashing

Generate one-way cryptographic hashes for integrity verification. Algorithm selection should match your security requirements.

| Tool | Description |
|---|---|
| **[MD5](https://toolkit.coffsec.com/md5)** | Generate 128-bit MD5 digests. Suitable for non-security-critical integrity checks and legacy compatibility. |
| **[SHA-1](https://toolkit.coffsec.com/sha1)** | Generate 160-bit SHA-1 digests. Considered legacy; avoid where collision resistance is required. |
| **[SHA-256](https://toolkit.coffsec.com/sha256)** | Generate 256-bit SHA-256 digests. The standard choice for most modern applications. |
| **[SHA-384](https://toolkit.coffsec.com/sha384)** | Generate 384-bit SHA-384 digests. |
| **[SHA-512](https://toolkit.coffsec.com/sha512)** | Generate 512-bit SHA-512 digests. |

<details>
<summary>Screenshots</summary>

<img width="506" height="356" alt="MD5 tool" src="https://github.com/user-attachments/assets/623effa4-e399-4423-ba03-f27bbc1c4f1f" />
<img width="491" height="353" alt="SHA-1 tool" src="https://github.com/user-attachments/assets/ad945241-3122-4655-86f9-e097261f93e4" />
<img width="488" height="351" alt="SHA-256 tool" src="https://github.com/user-attachments/assets/fa09887c-fbb3-4171-bfbb-f2d9e8d6e60c" />
<img width="483" height="359" alt="SHA-384 tool" src="https://github.com/user-attachments/assets/0cfb0c82-4568-4774-acea-9f2f07278dad" />
<img width="488" height="357" alt="SHA-512 tool" src="https://github.com/user-attachments/assets/4c9c05aa-ec85-4e84-9014-d73786b4a88c" />

</details>

### Encoding and Decoding

Convert data between common formats and representations.

| Tool | Description |
|---|---|
| **[Base64](https://toolkit.coffsec.com/base64)** | Encode text or files to Base64 and decode them back to their original form. |
| **[Hex](https://toolkit.coffsec.com/hex)** | Convert text to hexadecimal and vice versa. |
| **[ASCII](https://toolkit.coffsec.com/ascii)** | Translate strings into their corresponding ASCII numerical values. |
| **[URL Encode/Decode](https://toolkit.coffsec.com/url)** | Encode special characters for use in URLs or decode them back to readable text. |

<details>
<summary>Screenshots</summary>

<img width="665" height="348" alt="Base64 tool" src="https://github.com/user-attachments/assets/c9344ab3-596d-4778-a44d-89553b8890f6" />
<img width="635" height="332" alt="Hex tool" src="https://github.com/user-attachments/assets/e3ea913e-33ed-43b3-9774-168681aae52f" />
<img width="629" height="338" alt="ASCII tool" src="https://github.com/user-attachments/assets/7f798ab3-6dd2-4e7f-8382-6d08b0deab2c" />
<img width="623" height="329" alt="URL encode/decode tool" src="https://github.com/user-attachments/assets/d3997c1a-b343-4bf5-a3df-33a9eac639d9" />

</details>

### Formatters and Beautifiers

Reformat minified or unstructured code into a readable, consistent layout.

| Tool | Description |
|---|---|
| **[JSON Beautify](https://toolkit.coffsec.com/json-beautify)** | Format, indent, and validate JSON data. |
| **[JS Beautify](https://toolkit.coffsec.com/js-beautify)** | Unminify and format JavaScript source code. |
| **[SQL Beautify](https://toolkit.coffsec.com/sql-beautify)** | Reformat SQL queries into a clean, structured layout. |

<details>
<summary>Screenshots</summary>

<img width="649" height="416" alt="JSON Beautify tool" src="https://github.com/user-attachments/assets/7313a2cb-3cef-40e8-bbe6-4899a476b600" />
<img width="652" height="393" alt="JS Beautify tool" src="https://github.com/user-attachments/assets/ca377ced-1833-4317-bbd8-a00aeefb10dc" />
<img width="631" height="408" alt="SQL Beautify tool" src="https://github.com/user-attachments/assets/d63f1a0a-774e-4729-9df3-d5b6d2494a02" />

</details>

### Developer Utilities

Utilities for day-to-day development, debugging, and analysis.

| Tool | Description |
|---|---|
| **[JWT Decoder](https://jwt.coffsec.com)** | Decode, verify, and inspect JSON Web Tokens. |
| **[Regex Tester](https://toolkit.coffsec.com/regex)** | Write, test, and debug regular expressions in real time against sample input. |
| **[Diff Checker](https://toolkit.coffsec.com/diff)** | Compare two blocks of text or code to identify additions, deletions, and modifications. |
| **[cURL Converter](https://toolkit.coffsec.com/curl-converter)** | Convert raw cURL commands into usable code for Python, Node.js, Go, PHP, and other languages. |
| **[JSON to CSV](https://toolkit.coffsec.com/json-to-csv)** | Convert JSON arrays and objects into tabular CSV format. |

<details>
<summary>Screenshots</summary>

<img width="632" height="377" alt="JWT Decoder" src="https://github.com/user-attachments/assets/362ee8b3-3b75-44d6-849b-880240dc3e3f" />
<img width="616" height="415" alt="Regex Tester" src="https://github.com/user-attachments/assets/b2109092-99c3-4cac-8c2c-5d91712d56b2" />
<img width="620" height="406" alt="Diff Checker" src="https://github.com/user-attachments/assets/f2a47a5a-b59f-491a-a922-613646a45703" />
<img width="617" height="421" alt="cURL Converter" src="https://github.com/user-attachments/assets/c72ea175-afb7-45a7-988d-9029357e1540" />
<img width="638" height="384" alt="JSON to CSV" src="https://github.com/user-attachments/assets/317e0b78-ec26-4ce7-940c-1e275eb90ada" />

</details>

### Editors and Generators

In-browser authoring and generation tools.

| Tool | Description |
|---|---|
| **[Password Generator](https://toolkit.coffsec.com/password-generator)** | Generate secure, customizable, and random passwords. |
| **[QR Code Generator](https://toolkit.coffsec.com/qr)** | Generate scannable QR codes from text, links, or contact details. |
| **[Markdown Editor](https://toolkit.coffsec.com/markdown)** | Write Markdown with a live rich-text preview. |
| **[HTML Editor](https://toolkit.coffsec.com/html-editor)** | Write and test HTML, CSS, and JavaScript with instant visual output. |
| **[SVG Editor](https://toolkit.coffsec.com/svg-editor)** | Preview, edit, and refine raw Scalable Vector Graphics code. |

<details>
<summary>Screenshots</summary>

<img width="458" height="414" alt="Password Generator" src="https://github.com/user-attachments/assets/c1044db3-1d5d-4167-bb08-e0e58cf9b6f1" />
<img width="487" height="403" alt="QR Code Generator" src="https://github.com/user-attachments/assets/b4059316-3688-4768-b812-93ca840d8800" />
<img width="721" height="410" alt="Markdown Editor" src="https://github.com/user-attachments/assets/94bfae65-2a7a-40e5-94e1-b4a02dd9af15" />
<img width="707" height="419" alt="HTML Editor" src="https://github.com/user-attachments/assets/348d7b87-53ab-4b37-a595-b79dfb74c4e6" />
<img width="708" height="410" alt="SVG Editor" src="https://github.com/user-attachments/assets/98d2f086-46b7-4db1-a4f4-a6b11a7378c6" />

</details>

### Network and Reconnaissance

Tools for network calculations, subnetting, and web reconnaissance.

| Tool | Description |
|---|---|
| **[CIDR Calculator](https://toolkit.coffsec.com/cidr)** | Calculate network ranges, subnet masks, broadcast addresses, and usable host counts from CIDR notation. |
| **[Favicon Finder](https://toolkit.coffsec.com/favicon)** | Discover and extract favicons from target domains for reconnaissance, branding analysis, and asset enumeration. |

<details>
<summary>Screenshots</summary>

<img width="630" height="386" alt="CIDR Calculator" src="https://github.com/user-attachments/assets/2c315f08-3d13-44f1-9205-7755554e4277" />
<img width="659" height="317" alt="Favicon Finder" src="https://github.com/user-attachments/assets/37ba9fa3-e04d-4c31-b01d-5faecfd6f94f" />

</details>

---

## Use Cases

The toolkit supports a range of professional security and development workflows, including:

- **Offensive security engagements**, with practical tooling for penetration testing and adversary simulation.
- **Red team operations**, with utilities that support authorized security assessments.
- **Web and application security**, with tools for inspecting and understanding common attack surfaces.
- **Detection and response**, with resources that build a clearer understanding of attacker behavior.
- **Security research**, with curated references drawn from COFFSec research and field experience.
- **Learning and certification preparation**, with material for structured study and hands-on practice.

> The toolkit is under continuous development. New tools, references, and categories are added over time.

---

## Getting Started

No installation is required. The toolkit runs entirely in the browser.

1. Visit **[toolkit.coffsec.com](https://toolkit.coffsec.com)**.
2. Browse the available tools and categories.
3. Select the tool relevant to your task.
4. Apply it within an authorized and responsible security context.

---

## Who It's For

| Audience | How the Toolkit Helps |
|---|---|
| **Penetration Testers** | Access practical tooling and references during assessments. |
| **Red Teamers** | Explore resources for adversary simulation and offensive tradecraft. |
| **Security Engineers** | Find utilities for hardening, validation, and research. |
| **SOC and Detection Teams** | Develop a stronger understanding of offensive techniques and attacker behavior. |
| **Developers** | Understand how security issues surface in real applications and systems. |
| **Students and Researchers** | Access curated material for structured learning and experimentation. |

---

## Design Principles

- **Practical first:** prioritize tools and resources that are genuinely useful in security work.
- **Accessible:** keep the experience simple, fast, and easy to navigate.
- **Research-driven:** reflect COFFSec's offensive security and research background.
- **Community-oriented:** share knowledge that helps security professionals improve.
- **Responsible use:** promote ethical, authorized, and lawful security testing.

---

## Responsible Use

The resources in this toolkit are intended for **lawful, authorized, and ethical security purposes only**.

You are responsible for ensuring that you have explicit permission before testing, scanning, probing, or interacting with any system, application, network, or service that you do not own or are not authorized to assess.

COFFSec does not condone or support unauthorized access, malicious activity, or any use of these resources for illegal purposes.

---

## Contributing

Contributions, suggestions, and feedback are welcome.

To suggest a tool, resource, category, or improvement:

1. Open an issue describing the suggestion.
2. Explain how it benefits security professionals.
3. Include relevant links, context, and screenshots where useful.
4. Submit a pull request if you would like to contribute directly.

Any suggested resource must be lawful to share, responsibly disclosed where applicable, and consistent with ethical security practice.

---

## Contact

- **Website:** [coffsec.com](https://coffsec.com)
- **Toolkit:** [toolkit.coffsec.com](https://toolkit.coffsec.com)
- **Research and Insights:** [coffsec.medium.com](https://coffsec.medium.com)
- **LinkedIn:** [COFFSec](https://www.linkedin.com/company/coffsec)
- **Email:** [contact@coffsec.com](mailto:contact@coffsec.com)

---

<div align="center">

**Built by [COFFSec](https://coffsec.com)**

*Advancing practical cybersecurity through research, tooling, and real-world expertise.*

If this toolkit is useful to you, consider starring the repository.

</div>
