export interface SampleAsset {
  filename: string;
  blob: Blob;
}

/**
 * Creates sample SVG vector graphic blobs for the demo article figures
 */
function createSvgBlob(title: string, subtitle: string, accentColor = '#0f766e'): Blob {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" />
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.05" />
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bgGrad)" rx="16" />
    <rect x="30" y="30" width="740" height="390" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,6" rx="12" />
    
    <!-- Header Bar -->
    <rect x="50" y="50" width="700" height="60" fill="url(#boxGrad)" stroke="${accentColor}" stroke-width="1.5" rx="8" />
    <text x="70" y="86" fill="#f8fafc" font-family="-apple-system, sans-serif" font-weight="700" font-size="20">${title}</text>
    
    <!-- Schematic Diagram Visuals -->
    <rect x="70" y="140" width="180" height="110" fill="#1e293b" stroke="#475569" stroke-width="1.5" rx="8" />
    <text x="160" y="190" fill="#94a3b8" font-family="-apple-system, sans-serif" font-weight="600" font-size="14" text-anchor="middle">Tenant Ingestion</text>
    <text x="160" y="215" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">512-dim Embeddings</text>
    
    <!-- Arrow 1 -->
    <path d="M 260 195 L 310 195" stroke="${accentColor}" stroke-width="3" fill="none" marker-end="url(#arrow)" />
    <circle cx="310" cy="195" r="4" fill="${accentColor}" />
    
    <rect x="320" y="140" width="180" height="110" fill="#1e293b" stroke="${accentColor}" stroke-width="2" rx="8" />
    <text x="410" y="190" fill="#38bdf8" font-family="-apple-system, sans-serif" font-weight="700" font-size="14" text-anchor="middle">Distributed Cluster</text>
    <text x="410" y="215" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Hybrid Search Nodes</text>
    
    <!-- Arrow 2 -->
    <path d="M 510 195 L 560 195" stroke="${accentColor}" stroke-width="3" fill="none" />
    <circle cx="560" cy="195" r="4" fill="${accentColor}" />
    
    <rect x="570" y="140" width="160" height="110" fill="#1e293b" stroke="#475569" stroke-width="1.5" rx="8" />
    <text x="650" y="190" fill="#10b981" font-family="-apple-system, sans-serif" font-weight="600" font-size="14" text-anchor="middle">LLM Generation</text>
    <text x="650" y="215" fill="#64748b" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Zero Regressions</text>

    <!-- Metrics Card at Bottom -->
    <rect x="70" y="280" width="660" height="110" fill="#0f172a" stroke="#334155" stroke-width="1.5" rx="8" />
    <text x="100" y="325" fill="#f8fafc" font-family="-apple-system, sans-serif" font-weight="600" font-size="15">${subtitle}</text>
    <text x="100" y="355" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="13">High Throughput · Zero-Downtime Reindexing · Deterministic Chunks</text>
  </svg>`;

  return new Blob([svg], { type: 'image/svg+xml' });
}

export function getSampleAssets(): Record<string, Blob> {
  return {
    '01-architecture-migration.png': createSvgBlob(
      'Architecture: Azure AI Search to Distributed Milvus',
      'One shared distributed cluster per stamp with an owned ingestion pipeline',
      '#0f766e'
    ),
    '02-filtered-search-cliff.png': createSvgBlob(
      'Filtered Vector Search: Postgres Index Abandonment',
      'Planner switches from HNSW to brute-force bitmap scan between LIMIT 20 and 50',
      '#e11d48'
    ),
    '03-tuning-progression.png': createSvgBlob(
      'Node Tuning Progression: 270 QPS to 1,232 QPS',
      'Eight query nodes with anti-affinity, correct replicas, and 12-core CPU limits',
      '#2563eb'
    ),
  };
}

export const SAMPLE_MARKDOWN = `# The Migration Nobody Rolled Back
## Sixteen lessons from moving a multi-tenant enterprise RAG platform off a managed search service and onto self-hosted Milvus

*What it takes to replace the retrieval layer underneath a production RAG platform so that nobody notices.*

![System Architecture](assets/01-architecture-migration.png)
*Figure 1. One managed search instance per tenant, each with vendor-run indexing, versus one shared distributed cluster per stamp with an owned ingestion pipeline.*

---

Early one weekday morning a one-line change merged into a GitOps repository. A Helm value that had always named the managed search service now read \`milvus\`. The deployment tool noticed, the retrieval service rolled, and a few minutes later every retrieval-augmented generation request from every tenant on that deployment stamp was being answered out of a vector database we ran ourselves on Kubernetes.

A support engineer was watching a dashboard built around three verbs: **detect**, **react**, **escalate**. Nothing happened. That was the point.

Earlier in the year I had published a long article arguing that PostgreSQL's \`pgvector\` extension struggles at scale for architectural reasons rather than configuration ones. It was theory, built on other people's benchmarks. This is the story of what happened when we tested that theory against our own workload, picked a database, proved it would not hurt answer quality, migrated hundreds of tenants, and then had to live with the result.

---

## Benchmark Results: Scale Changes Everything

We tested candidate databases across 100K and 2.5M vector scales while sweeping \`top_k\` queries from 1 to 100. The results revealed dramatic behavioral shifts that smaller benchmarks completely masked:

| Vector Engine | 100K QPS | 2.5M QPS | P99 Latency | Scale Degradation |
|:---|:---:|:---:|:---:|:---:|
| PostgreSQL (pgvector) | 2,096 | 83 | 51.7 s | -96.0% (Planner Cliff) |
| Managed Cloud Search | 240 | 180 | 185 ms | -25.0% (Driver Limited) |
| Milvus Distributed (Self-Hosted) | 1,236 | 887 | 34 ms | -28.2% (Smooth Gradient) |

![Filtered Search Cliff](assets/02-filtered-search-cliff.png)
*Figure 2. Filtered vector search at 2.5M vectors as top_k increases. The planner abandons the HNSW index between LIMIT 20 and LIMIT 50.*

### The Planner Trapdoor
On PostgreSQL, filtered vector search looked phenomenal right up to the point where it did not:

\`\`\`sql
-- plainto_tsquery: every remaining term is required
SELECT plainto_tsquery('english', 'how do I reset a maintenance schedule');
-- 'reset' & 'mainten' & 'schedul'

-- websearch_to_tsquery with explicit OR: any matching term scores
SELECT websearch_to_tsquery('english', 'how OR do OR I OR reset OR a OR maintenance OR schedule');
-- 'reset' | 'mainten' | 'schedul'
\`\`\`

The query planner prices a 1,536-dimension cosine distance at the same \`cpu_operator_cost\` as an integer comparison, so above roughly \`top_k\` 42 it decides a brute-force bitmap scan over every tenant row is cheaper than the HNSW index.

---

## Tuning the Distributed Cluster

Reaching peak throughput took six key fixes, each to something that originally looked fine in staging:

1. **Anti-affinity rules:** Corrected component label matching so Query Nodes spread across independent worker nodes.
2. **In-memory replicas:** Configured explicit multi-replica distribution across eight query nodes.
3. **Memory guards:** Raised thresholds to 28 GiB to avoid premature eviction during high concurrent load.
4. **CPU limit scaling:** Raised limits from 8 to 12 cores, yielding an immediate 36% hybrid search throughput boost.

![Tuning Progression](assets/03-tuning-progression.png)
*Figure 3. The same eight nodes, from about 270 to about 1,232 QPS. Every step was configuration, not code.*

> "A distributed database is not distributed until you verify pod topology and replica distribution under real production traffic."

### Final Takeaways
The migration cut vector-store infrastructure cost by well over half while lowering average response latency by 35%. Most importantly, the rollback configuration remained in the GitOps repository—an option we never had to exercise.
`;
