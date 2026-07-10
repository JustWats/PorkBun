import type { Metadata } from "next";
import { ArticleLayout, Note } from "../components/ArticleLayout";

export const metadata: Metadata = {
  title: "Hunting Sliver Without Betting on Defaults",
  description:
    "A defender-first workflow for combining endpoint, network, DNS, and memory evidence when Sliver C2 is suspected.",
  alternates: { canonical: "/sliver-implants.html" },
};

const contents = [
  { href: "#premise", label: "The premise" },
  { href: "#lab", label: "Build evidence, not a demo" },
  { href: "#host", label: "Host-side evidence" },
  { href: "#network", label: "Network and DNS evidence" },
  { href: "#memory", label: "Memory and decryption" },
  { href: "#workflow", label: "Hunting workflow" },
  { href: "#pitfalls", label: "Claims to avoid" },
];

const references = [
  {
    href: "https://github.com/BishopFox/sliver",
    label: "Bishop Fox: Sliver repository",
    detail: "Authoritative source code, release history, and supported C2 overview.",
  },
  {
    href: "https://sliver.sh/docs/?name=Getting+Started",
    label: "Sliver documentation: Getting Started",
    detail: "Current implant modes and generation workflow.",
  },
  {
    href: "https://sliver.sh/docs/?name=HTTPS+C2",
    label: "Sliver documentation: HTTPS C2",
    detail: "Current HTTP and HTTPS behavior and proxy handling.",
  },
  {
    href: "https://github.com/BishopFox/sliver/wiki/Transport-Encryption/370b842e6176e411169b9626c0cb2fc8ae97597e",
    label: "Sliver wiki: Transport Encryption",
    detail: "Version-specific protocol and cryptographic design notes. Validate against the release under investigation.",
  },
];

export default function SliverImplants() {
  return (
    <ArticleLayout
      index="02"
      category="C2 analysis"
      title="Hunting Sliver without betting on defaults"
      dek="Sliver is open source, cross-platform, and intentionally configurable. Defenders can still find it, but the durable path is behavioral: connect the generated implant, the process that hosts it, and the channel it actually uses."
      revised="July 2026"
      readTime="13 minutes"
      contents={contents}
      references={references}
    >
      <section id="premise">
        <h2>The premise</h2>
        <p>
          Sliver supports multiple implant modes and C2 transports, including
          mTLS, WireGuard, HTTP(S), and DNS. Builds can also change across releases
          and operator profiles. This makes lists of default file extensions,
          strings, or packet shapes useful for initial triage but unreliable as a
          long-term detection strategy.
        </p>
        <p>
          The objective is not to recognize every possible Sliver binary. It is to
          construct an evidence chain that survives operator customization:
          <strong> execution → process behavior → communication → task-driven
          activity</strong>.
        </p>
        <table className="ioc-table">
          <thead><tr><th>Signal</th><th>Why it helps</th><th>Why it is insufficient</th></tr></thead>
          <tbody>
            <tr><td>Large Go executable</td><td>Can prioritize an unusual unsigned binary for inspection</td><td>Many legitimate applications are large Go binaries</td></tr>
            <tr><td>Go or Sliver strings</td><td>May expose package paths or build residue</td><td>Obfuscation and stripping can remove them; shared packages create noise</td></tr>
            <tr><td>Long or frequent DNS labels</td><td>Can expose data transfer over DNS</td><td>CDNs, telemetry, and security products also produce unusual DNS</td></tr>
            <tr><td>Default HTTP extensions</td><td>Can seed a retrospective hunt against a known profile</td><td>Operator-controlled and version-dependent</td></tr>
          </tbody>
        </table>
      </section>

      <section id="lab">
        <h2>Build evidence, not a demo</h2>
        <p>
          A useful lab reproduces the telemetry available in production. It should
          not begin with a YARA rule that already knows the answer. Generate more
          than one implant and vary the transport, mode, symbol treatment, and
          launch method. Then capture the same sources your analysts would receive
          during a real escalation.
        </p>
        <ul>
          <li><strong>Endpoint:</strong> process creation, image loads, network ownership, memory regions, file metadata, and authentication activity.</li>
          <li><strong>Network:</strong> DNS, TLS, HTTP metadata, flow records, and full packet capture where permitted.</li>
          <li><strong>Server-side:</strong> listener logs and build metadata for ground truth.</li>
          <li><strong>Time:</strong> synchronized clocks and a record of each operator action.</li>
        </ul>
        <Note>
          <p>
            Ground truth should be hidden from the detection logic until after the
            run. Otherwise the exercise measures whether the detector can recognize
            the scenario author’s labels.
          </p>
        </Note>
      </section>

      <section id="host">
        <h2>Host-side evidence</h2>
        <p>
          Begin with provenance. Where did the executable or injected region come
          from? Which process created it? Which user and integrity level executed
          it? Is the file signed, common in the environment, and consistent with
          the host’s role? A rare binary with a plausible Go toolchain fingerprint
          is only a lead until behavior gives it context.
        </p>
        <h3>Useful joins</h3>
        <ul>
          <li>A newly written or user-writable executable followed by an outbound connection.</li>
          <li>A process with no expected network role maintaining a long-lived or recurring external channel.</li>
          <li>Command interpreters, credential access, process injection, or remote-service activity temporally linked to that channel.</li>
          <li>Executable private memory or anomalous threads inside a process whose disk image does not explain them.</li>
          <li>Repeated implant behavior across Windows, Linux, or macOS hosts that shares infrastructure or task timing.</li>
        </ul>
        <p>
          String-based rules can still help triage unmodified builds. Write them
          around several independent implementation artifacts and test them against
          a large benign Go corpus. Do not make one repository path or project name
          the entire rule.
        </p>
      </section>

      <section id="network">
        <h2>Network and DNS evidence</h2>
        <h3>HTTP and HTTPS</h3>
        <p>
          The current Sliver documentation describes procedurally generated HTTP(S)
          behavior and proxy-aware connection attempts. Historical write-ups often
          emphasize extensions such as <code>.woff</code>, <code>.html</code>,
          <code>.php</code>, or <code>.png</code>. Those observations may identify a
          specific generation profile, but they should not be promoted to a
          universal protocol signature.
        </p>
        <p>For a suspected HTTP(S) channel, compare:</p>
        <ul>
          <li>the owning process and its expected network behavior;</li>
          <li>request sequencing, method changes, response sizes, and idle intervals;</li>
          <li>proxy versus direct connection attempts;</li>
          <li>domain age, hosting history, certificate relationships, and adjacent infrastructure;</li>
          <li>task execution on the host immediately after responses arrive.</li>
        </ul>
        <h3>DNS</h3>
        <p>
          DNS C2 places encoded data into queries and reconstructs messages over a
          transport that has no session in the TCP sense. Detection should focus on
          the behavior this creates: label length and character distribution,
          query volume, authoritative-domain concentration, record-type patterns,
          response behavior, and the process responsible for the lookups.
        </p>
        <pre><code>{`# Useful per-host, per-domain features for DNS triage
query_count
unique_leftmost_label_count
median_and_max_label_length
character_distribution
record_type_distribution
NXDOMAIN_ratio
bytes_estimated_in_queries_and_answers
time_between_queries`}</code></pre>
        <p>
          None of these features is malicious by itself. The high-value finding is
          a DNS pattern that is rare for the environment, owned by a suspicious
          process, and followed by task-consistent host activity.
        </p>
      </section>

      <section id="memory">
        <h2>Memory and decryption</h2>
        <p>
          Memory can provide the executable image, configuration material, runtime
          state, plaintext task data, or cryptographic material that is absent from
          disk. Capture it early. A terminated implant may remove the only artifact
          that can tie an encrypted channel to a specific process.
        </p>
        <p>
          Decrypting Sliver traffic is possible in some investigations, but it is a
          version-sensitive engineering task, not a universal recipe. The analyst
          must identify the Sliver release and transport implementation, retain the
          complete handshake and message stream, and obtain the corresponding
          runtime or server-side material. Protocol descriptions from an older wiki
          revision should be checked against the source code for the version under
          analysis.
        </p>
        <h3>What success looks like</h3>
        <ol>
          <li>The implant or memory image is linked to the captured flow.</li>
          <li>The protocol parser reproduces message boundaries from the capture.</li>
          <li>Recovered key material is tied to that process and session.</li>
          <li>Decrypted messages authenticate or parse correctly under the matching implementation.</li>
          <li>Decoded commands align with endpoint activity at the same timestamps.</li>
        </ol>
      </section>

      <section id="workflow">
        <h2>A hunting workflow that scales</h2>
        <ol>
          <li><strong>Start from a case-derived seed.</strong> A process, domain, file, alert, or memory match should define the first scope.</li>
          <li><strong>Inventory the host evidence.</strong> Build process ancestry, file provenance, user context, persistence, and network ownership.</li>
          <li><strong>Characterize the channel.</strong> Measure behavior before assigning a framework name.</li>
          <li><strong>Recover implementation evidence.</strong> Inspect the binary and memory for build, protocol, and configuration artifacts.</li>
          <li><strong>Test against benign peers.</strong> Compare to Go applications, DNS-heavy software, and management agents in the same environment.</li>
          <li><strong>Expand on stable joins.</strong> Pivot on infrastructure, signer, file lineage, and behavior that the case actually supports.</li>
        </ol>
      </section>

      <section id="pitfalls">
        <h2>Claims to avoid</h2>
        <ul>
          <li><strong>“The file is larger than 10 MB, therefore Sliver.”</strong> Size is triage metadata.</li>
          <li><strong>“The URI ends in .woff, therefore Sliver.”</strong> A mutable default is not attribution.</li>
          <li><strong>“The DNS label is long, therefore tunneling.”</strong> Quantify the full behavior and compare it to local baselines.</li>
          <li><strong>“We found a 32-byte value in memory, therefore it is the session key.”</strong> Demonstrate that it successfully explains authenticated protocol data.</li>
          <li><strong>“No public rule matched, therefore the implant is clean.”</strong> Absence of a static signature says little about a configurable build.</li>
        </ul>
        <p>
          Sliver is detectable. The durable detections are simply less dramatic
          than a magic byte pattern. They are joins between provenance, execution,
          runtime state, and communication.
        </p>
      </section>
    </ArticleLayout>
  );
}
