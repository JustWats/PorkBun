import type { Metadata } from "next";
import { ArticleLayout, Note } from "../components/ArticleLayout";

export const metadata: Metadata = {
  title: "Detecting Cobalt Strike Beacon Beyond the Obvious Indicators",
  description:
    "A defender-first method for assessing suspected Cobalt Strike Beacon activity across payload, configuration, network, process, and memory evidence.",
  alternates: { canonical: "/cobaltstrike-guide.html" },
};

const contents = [
  { href: "#scope", label: "What the evidence must prove" },
  { href: "#identity", label: "Establishing Beacon identity" },
  { href: "#network", label: "Reading the network evidence" },
  { href: "#host", label: "Host and memory evidence" },
  { href: "#payload", label: "Payload triage without shortcuts" },
  { href: "#workflow", label: "A repeatable hunting workflow" },
  { href: "#judgment", label: "Writing the assessment" },
];

const references = [
  {
    href: "https://hstechdocs.helpsystems.com/manuals/cobaltstrike/current/userguide/content/topics/listener-infrastructure_beacon-payload.htm",
    label: "Cobalt Strike: Beacon Payload",
    detail: "Fortra’s current description of Beacon channels, behavior, and Malleable C2.",
  },
  {
    href: "https://hstechdocs.helpsystems.com/manuals/cobaltstrike/current/userguide/content/topics/listener-infrastructure_beacon-http-https.htm",
    label: "Cobalt Strike: HTTP and HTTPS Beacon",
    detail: "Official transport behavior and the role of Malleable C2 profiles.",
  },
  {
    href: "https://hstechdocs.helpsystems.com/manuals/cobaltstrike/current/userguide/content/topics/listener-infrastructure_payload-security-features.htm",
    label: "Cobalt Strike: Payload Security Features",
    detail: "Official overview of Beacon metadata and session-key protection.",
  },
  {
    href: "https://github.com/DidierStevens/DidierStevensSuite/blob/master/1768.py",
    label: "Didier Stevens Suite: 1768.py",
    detail: "A widely used parser for extracting Cobalt Strike configuration from supported samples and memory material.",
  },
];

export default function CobaltStrikeGuide() {
  return (
    <ArticleLayout
      index="01"
      category="C2 analysis"
      title="Detecting Cobalt Strike Beacon beyond the obvious indicators"
      dek="Beacon is configurable by design. That makes a single URI, user agent, certificate, or byte pattern a fragile basis for attribution. A stronger assessment explains how several independent artifacts converge on the same conclusion."
      revised="July 2026"
      readTime="12 minutes"
      contents={contents}
      references={references}
    >
      <section id="scope">
        <h2>What the evidence must prove</h2>
        <p>
          “Looks like Cobalt Strike” is not an analytical endpoint. The useful
          question is narrower: <strong>what observable behavior or recovered
          structure is difficult to explain without Beacon?</strong> That shift
          matters because many Beacon-adjacent indicators are shared with ordinary
          software, other command-and-control frameworks, and operator-created
          infrastructure.
        </p>
        <p>
          I use four evidence families. None is mandatory in every investigation,
          but confidence rises when they agree:
        </p>
        <table className="ioc-table">
          <thead>
            <tr><th>Evidence family</th><th>Useful observations</th><th>Common failure</th></tr>
          </thead>
          <tbody>
            <tr><td>Payload and configuration</td><td>Recovered Beacon settings, public key material, sleep values, configured hosts, process-injection choices</td><td>Treating a packer or generic loader as proof of Beacon</td></tr>
            <tr><td>Network</td><td>Timing, request and response shape, channel behavior, infrastructure history, and a profile-consistent sequence</td><td>Matching one URI, header, JA3 value, or certificate</td></tr>
            <tr><td>Host</td><td>Process lineage, injected memory, named pipes, loaded modules, token activity, and execution artifacts</td><td>Looking only for a Beacon process name</td></tr>
            <tr><td>Operational context</td><td>What happened before and after the suspected callback</td><td>Ignoring the intrusion chain that gives the signal meaning</td></tr>
          </tbody>
        </table>
        <Note>
          <p>
            Cobalt Strike’s own documentation states that Beacon’s network
            indicators are malleable. A hunt based on defaults can still produce
            leads, but defaults should be described as leads, not identity.
          </p>
        </Note>
      </section>

      <section id="identity">
        <h2>Establishing Beacon identity</h2>
        <p>
          The shortest path to high confidence is usually configuration recovery.
          A Beacon configuration can expose the values that produced the observed
          traffic: callback hosts, ports, sleep and jitter, HTTP verb and URI
          choices, headers, proxy behavior, and other build-specific settings.
          Recovering those values lets the analyst compare an artifact to telemetry
          instead of comparing telemetry to folklore.
        </p>
        <p>
          Configuration parsers such as <code>1768.py</code> are useful here, but
          parser output must be handled as derived evidence. Preserve the original
          bytes, record the hash, parser version, offsets, and any warnings. If the
          parser finds a candidate configuration in memory, verify that the values
          align with the process and network timeline.
        </p>
        <h3>A practical confidence ladder</h3>
        <ol>
          <li><strong>Low:</strong> a mutable or broadly shared network indicator.</li>
          <li><strong>Moderate:</strong> a coherent cluster of Beacon-like network and host behavior.</li>
          <li><strong>High:</strong> recovered configuration or memory structures that agree with telemetry.</li>
          <li><strong>Confirmed:</strong> the recovered artifact, configuration, execution chain, and callback sequence explain one another.</li>
        </ol>
      </section>

      <section id="network">
        <h2>Reading the network evidence</h2>
        <p>
          Beacon can communicate over HTTP, HTTPS, DNS, and peer-to-peer channels.
          For HTTP and HTTPS, the profile may reshape URIs, headers, parameters,
          metadata placement, and output encoding. The analyst should therefore
          work from the <em>sequence</em> and its relationship to the endpoint,
          not from a single packet feature.
        </p>
        <h3>Start with time</h3>
        <p>
          Plot the intervals between outbound connections. Repeated callbacks with
          a stable center and bounded variation may be consistent with sleep and
          jitter. It is not a Beacon-exclusive pattern. Update agents, monitoring
          software, and browser background activity can look similar. The value is
          in using timing to define a cluster for deeper comparison.
        </p>
        <pre><code>{`# Pseudocode for interval analysis
events = outbound_connections(host, destination)
intervals = difference(sort(events.timestamp))

report median(intervals)
report median_absolute_deviation(intervals)
plot intervals over the full incident window`}</code></pre>
        <h3>Then compare structure</h3>
        <ul>
          <li>Does the same process own the connections across the cluster?</li>
          <li>Do request sizes, response sizes, verbs, and content types form repeatable roles?</li>
          <li>Does the destination infrastructure predate the incident, or was it staged shortly before use?</li>
          <li>Do bursts of network activity line up with interactive actions on the host?</li>
          <li>If configuration was recovered, do its hosts, URIs, headers, and timing explain the capture?</li>
        </ul>
        <Note>
          <p>
            TLS fingerprints can be useful for pivoting through a dataset, but they
            identify a client or library profile, not an operator or payload by
            themselves. Treat them as clustering material.
          </p>
        </Note>
      </section>

      <section id="host">
        <h2>Host and memory evidence</h2>
        <p>
          Beacon frequently operates inside another process. That means the most
          valuable host question is not “where is beacon.exe?” but “which process
          contains code, memory, handles, or threads that its on-disk image does not
          explain?” Process ancestry, unsigned executable memory, anomalous thread
          starts, remote process access, named pipes, and token operations become
          more useful when read together.
        </p>
        <h3>Collection priorities</h3>
        <ol>
          <li>Preserve the suspicious process tree and command-line history.</li>
          <li>Collect the owning process’s network connections and DNS history.</li>
          <li>Acquire memory before terminating the process when policy and risk allow.</li>
          <li>Record executable-memory regions, thread start addresses, loaded modules, handles, and named pipes.</li>
          <li>Correlate the findings with authentication, service, task, and persistence artifacts.</li>
        </ol>
        <p>
          A memory signature can accelerate triage, but the region around the match
          is usually more informative than the match itself. Determine allocation
          type, protection, mapped image, nearby strings, referencing threads, and
          whether the bytes decode into a supported Beacon structure.
        </p>
      </section>

      <section id="payload">
        <h2>Payload triage without shortcuts</h2>
        <p>
          Encoded or wrapped payloads should be handled as a reversible chain. For
          each transformation, save the input, the operation, and the output hash.
          This prevents the analysis from becoming a series of unrepeatable tool
          clicks and makes it possible for another analyst to reproduce the result.
        </p>
        <ol>
          <li>Identify the container: script, PE, shellcode, archive, or memory region.</li>
          <li>Extract obvious encodings without executing the sample.</li>
          <li>Check decoded bytes for structure, not just strings.</li>
          <li>Separate packing or loader behavior from payload identity.</li>
          <li>Run Beacon-specific parsers only after preserving the raw artifact.</li>
        </ol>
        <p>
          A single-byte XOR sweep is acceptable as a quick test against a small
          blob, but it is not a general Cobalt Strike decoder. Binary-safe code also
          matters; converting bytes through text can destroy the artifact.
        </p>
        <pre><code>{`from pathlib import Path

blob = Path("candidate.bin").read_bytes()

for key in range(256):
    decoded = bytes(value ^ key for value in blob)
    if decoded.startswith(b"MZ"):
        Path(f"candidate-xor-{key:02x}.bin").write_bytes(decoded)
        print(f"PE-like output with key 0x{key:02x}")`}</code></pre>
      </section>

      <section id="workflow">
        <h2>A repeatable hunting workflow</h2>
        <ol>
          <li><strong>Define the seed.</strong> State whether it came from EDR, proxy, DNS, memory, a file, or external reporting.</li>
          <li><strong>Build the smallest coherent timeline.</strong> Include process creation, network connections, image loads, authentication, and persistence around the seed.</li>
          <li><strong>Recover structure.</strong> Extract configuration or memory evidence when available.</li>
          <li><strong>Test competing explanations.</strong> Ask what legitimate software or another framework would need to look the same.</li>
          <li><strong>Expand only on supported pivots.</strong> Use values recovered from the case, not an unlimited list of public defaults.</li>
          <li><strong>Write confidence and gaps.</strong> Separate what was observed, derived, inferred, and not collected.</li>
        </ol>
      </section>

      <section id="judgment">
        <h2>Writing the assessment</h2>
        <p>
          The final product should explain the join between artifacts. A useful
          conclusion sounds like this: a process with no legitimate network role
          contained an executable memory region from which a Beacon configuration
          was recovered; its configured host, URI behavior, and sleep interval
          matched the process’s outbound traffic during the incident window.
        </p>
        <p>
          That statement is stronger than a page of generic Cobalt Strike
          indicators because every clause is tied to the case. The hunt remains
          portable even when the next operator changes the profile.
        </p>
      </section>
    </ArticleLayout>
  );
}
