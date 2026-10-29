export interface SampleAsset {
  filename: string;
  blob: Blob;
}

/**
 * Creates warm book-toned SVG diagram cards for the sample article figures
 */
function createSvgBlob(title: string, subtitle: string, accentColor = '#b45309'): Blob {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#231f1c" />
        <stop offset="100%" stop-color="#2c2724" />
      </linearGradient>
      <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.22" />
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.05" />
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bgGrad)" rx="14" />
    <rect x="25" y="25" width="750" height="400" fill="none" stroke="#443d37" stroke-width="1.5" stroke-dasharray="5,5" rx="10" />
    
    <!-- Title Card -->
    <rect x="45" y="45" width="710" height="58" fill="url(#boxGrad)" stroke="${accentColor}" stroke-width="1.5" rx="8" />
    <text x="65" y="80" fill="#f5f0e6" font-family="-apple-system, sans-serif" font-weight="700" font-size="19">${title}</text>
    
    <!-- Visual Blocks -->
    <rect x="65" y="135" width="190" height="110" fill="#1b1816" stroke="#443d37" stroke-width="1.5" rx="8" />
    <text x="160" y="185" fill="#e7ded3" font-family="-apple-system, sans-serif" font-weight="600" font-size="14" text-anchor="middle">Client Layer</text>
    <text x="160" y="210" fill="#a89f91" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Edge CDN &amp; Caching</text>
    
    <!-- Arrow 1 -->
    <path d="M 270 190 L 320 190" stroke="${accentColor}" stroke-width="2.5" fill="none" />
    <circle cx="320" cy="190" r="4" fill="${accentColor}" />
    
    <rect x="330" y="135" width="190" height="110" fill="#1b1816" stroke="${accentColor}" stroke-width="2" rx="8" />
    <text x="425" y="185" fill="#f59e0b" font-family="-apple-system, sans-serif" font-weight="700" font-size="14" text-anchor="middle">Application Tier</text>
    <text x="425" y="210" fill="#e7ded3" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Stateless Workers</text>
    
    <!-- Arrow 2 -->
    <path d="M 535 190 L 585 190" stroke="${accentColor}" stroke-width="2.5" fill="none" />
    <circle cx="585" cy="190" r="4" fill="${accentColor}" />
    
    <rect x="595" y="135" width="160" height="110" fill="#1b1816" stroke="#443d37" stroke-width="1.5" rx="8" />
    <text x="675" y="185" fill="#d97706" font-family="-apple-system, sans-serif" font-weight="600" font-size="14" text-anchor="middle">Data Store</text>
    <text x="675" y="210" fill="#a89f91" font-family="-apple-system, sans-serif" font-size="12" text-anchor="middle">Replicated Storage</text>

    <!-- Bottom Caption Box -->
    <rect x="45" y="275" width="710" height="120" fill="#1b1816" stroke="#38322c" stroke-width="1.5" rx="8" />
    <text x="75" y="325" fill="#f5f0e6" font-family="-apple-system, sans-serif" font-weight="600" font-size="14.5">${subtitle}</text>
    <text x="75" y="355" fill="#a89f91" font-family="-apple-system, sans-serif" font-size="12.5">Predictable Latency · Zero-Downtime Rollouts · Clean System Boundaries</text>
  </svg>`;

  return new Blob([svg], { type: 'image/svg+xml' });
}

export function getSampleAssets(): Record<string, Blob> {
  return {
    '01-system-architecture.png': createSvgBlob(
      'System Architecture: Edge Caching & Stateless Core',
      'Tiered architecture isolating presentation, caching, and stateful storage',
      '#b45309'
    ),
    '02-latency-distribution.png': createSvgBlob(
      'Latency Distribution: P95 and P99 Comparison',
      'Response time percentiles under high concurrency before and after optimization',
      '#c2410c'
    ),
    '03-delivery-pipeline.png': createSvgBlob(
      'Continuous Delivery Pipeline with Automated Canary',
      'Automated staging, health assertion gates, and zero-downtime traffic switching',
      '#92400e'
    ),
  };
}

export const SAMPLE_MARKDOWN = `# Building Fast, Resilient Web Services: A Pragmatic Engineering Guide
## Core principles for designing maintainable systems that scale smoothly without unnecessary complexity

*What it takes to build dependable software architectures that team members can confidently operate and evolve.*

![System Architecture](assets/01-system-architecture.png)
*Figure 1. Layered architecture separating edge caching, stateless worker nodes, and persistent data storage.*

---

Every engineering organization eventually confronts the same tension: how do you keep software architectures simple and understandable while still meeting demanding availability and performance goals?

Early on in a project, velocity is high because the entire system fits into a single engineer's head. Over time, features accumulate, traffic scales by orders of magnitude, and failure modes shift from straightforward bugs into subtle distributed-systems bottlenecks.

The secret to building resilient services is not adding more infrastructure layers or adopting the latest trending database. It is establishing clear boundaries, isolating state, and measuring what actually breaks under load.

---

## Caching Strategy Comparison

Caching is often introduced as a quick fix for slow database queries, but an unstructured cache can introduce cache stampedes, stale data, and unpredictable memory growth.

Here is how three common caching strategies compare under synthetic stress testing (100,000 requests/sec):

| Cache Strategy | Throughput (QPS) | P99 Latency | Hit Ratio | Operational Complexity |
|:---|:---:|:---:|:---:|:---:|
| In-Memory LRU (Local) | 48,200 | 1.8 ms | 82.4% | Minimal (Zero Network) |
| Distributed Cache (Redis) | 18,500 | 8.4 ms | 94.1% | Moderate (Cluster Ops) |
| Edge CDN Tier (Cloudflare) | 86,000 | 12.0 ms | 96.8% | Low (Configuration) |

![Latency Percentiles](assets/02-latency-distribution.png)
*Figure 2. Response latency distribution under heavy traffic before and after introducing hierarchical caching.*

### Key Takeaway on Cache Boundaries
Notice how local in-memory caching achieves the lowest latency, while edge caching handles the highest raw request volume. Combining edge caching for public assets with a distributed store for session tokens delivers the ideal balance of throughput and freshness.

---

## Writing Idempotent Request Handlers

When network failures occur, clients will inevitably retry. Unless operations are idempotent, retried requests produce duplicate charges, ghost records, or corrupt data.

Here is a clean pattern for handling retries safely using unique client tokens:

\`\`\`typescript
async function processOrder(request: OrderRequest): Promise<OrderResult> {
  const { idempotencyKey, payload, userId } = request;

  // 1. Check if this request was already processed
  const existing = await cache.get(\`idemp:\${idempotencyKey}\`);
  if (existing) {
    return JSON.parse(existing);
  }

  // 2. Execute business logic within a transactional boundary
  const result = await db.transaction(async (tx) => {
    return await orderService.create(tx, userId, payload);
  });

  // 3. Cache the completed response with a 24-hour expiration
  await cache.set(\`idemp:\${idempotencyKey}\`, JSON.stringify(result), 'EX', 86400);
  return result;
}
\`\`\`

---

## Reliable Production Delivery

Shipping code should be a routine, low-stress operation rather than an all-hands crisis.

![Continuous Delivery Pipeline](assets/03-delivery-pipeline.png)
*Figure 3. Automated staging pipeline with canary deployment and automated rollback triggers.*

Three operational rules make deployments non-events:

1. **Decouple database schema migrations from application code:** Never deploy a breaking column rename in the same step that reads it. Expand first, migrate callers, and contract last.
2. **Automate smoke tests against real staging dependencies:** Synthetic mocks often hide configuration mismatches that only surface in production.
3. **Establish non-negotiable bake periods:** Allow new code to soak under baseline traffic for at least 15 minutes before tearing down old instances.

> "A resilient system is not one that never experiences failures—it is one where failures remain isolated, visible, and straightforward to recover from."
`;
