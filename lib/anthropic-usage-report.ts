/**
 * Fetch Anthropic usage and cost reports (admin key required).
 * Used by /api/anthropic/usage and /api/settings/status so status can get data without self-fetch.
 */

function getAnthropicAdminKey(): string {
  const envKey = process.env.ANTHROPIC_ADMIN_KEY;
  if (envKey && envKey.trim().startsWith("sk-ant-admin")) {
    return envKey.trim();
  }
  throw new Error("ANTHROPIC_ADMIN_KEY environment variable is required");
}

export interface AnthropicUsageResult {
  success: true;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cachedInputTokens: number;
    cacheCreationTokens: number;
    totalTokens: number;
    byModel: Record<
      string,
      {
        inputTokens: number;
        outputTokens: number;
        cachedInputTokens: number;
        cacheCreationTokens: number;
        totalTokens: number;
      }
    >;
  };
  costs: {
    totalCost: number;
    tokenCosts: number;
    webSearchCosts: number;
    codeExecutionCosts: number;
    byModel: Record<
      string,
      {
        totalCost: number;
        tokenCosts: number;
        webSearchCosts: number;
        codeExecutionCosts: number;
      }
    >;
  } | null;
  period: {
    startingAt: string;
    endingAt: string;
    daysBack: number;
  };
  cacheHitRate: number;
}

async function fetchUsageReport(
  adminKey: string,
  startingAt: string,
  endingAt: string,
  bucketWidth: "1d" | "1h" | "1m" = "1d"
) {
  const limit = bucketWidth === "1d" ? "31" : bucketWidth === "1h" ? "168" : "10080";
  const params = new URLSearchParams({
    starting_at: startingAt,
    ending_at: endingAt,
    bucket_width: bucketWidth,
    limit,
  });
  const response = await fetch(
    `https://api.anthropic.com/v1/organizations/usage_report/messages?${params}`,
    {
      method: "GET",
      headers: {
        "x-api-key": adminKey,
        "anthropic-version": "2023-06-01",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API Error: ${response.status} ${response.statusText} - ${text}`);
  }
  return response.json();
}

async function fetchCostReport(adminKey: string, startingAt: string, endingAt: string) {
  const params = new URLSearchParams({ starting_at: startingAt, ending_at: endingAt });
  const response = await fetch(
    `https://api.anthropic.com/v1/organizations/cost_report?${params}`,
    {
      method: "GET",
      headers: {
        "x-api-key": adminKey,
        "anthropic-version": "2023-06-01",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API Error: ${response.status} ${response.statusText} - ${text}`);
  }
  return response.json();
}

/**
 * Fetch usage and cost from Anthropic. Returns result or throws.
 */
export async function fetchAnthropicUsageAndCost(
  daysBack: number = 7,
  bucketWidth: "1d" | "1h" | "1m" = "1d"
): Promise<AnthropicUsageResult> {
  const adminKey = getAnthropicAdminKey();
  const endingAt = new Date();
  const startingAt = new Date();
  startingAt.setDate(startingAt.getDate() - daysBack);
  const startingAtISO = startingAt.toISOString();
  const endingAtISO = endingAt.toISOString();

  const [usageData, costData] = await Promise.all([
    fetchUsageReport(adminKey, startingAtISO, endingAtISO, bucketWidth),
    fetchCostReport(adminKey, startingAtISO, endingAtISO).catch(() => null),
  ]);

  const usage = {
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    cacheCreationTokens: 0,
    totalTokens: 0,
    byModel: {} as AnthropicUsageResult["usage"]["byModel"],
  };

  const dataBuckets = usageData?.data || [];
  if (Array.isArray(dataBuckets)) {
    for (const bucket of dataBuckets) {
      const results = bucket.results || [];
      for (const result of results) {
        const uncachedInputTokens = Number(result.uncached_input_tokens || 0);
        const cachedInputTokens = Number(result.cache_read_input_tokens || 0);
        const cacheCreationTokens = Number(result.cache_creation || 0);
        const outputTokens = Number(result.output_tokens || 0);
        const totalInputTokens = uncachedInputTokens + cachedInputTokens;
        const bucketModel = result.model || null;

        usage.inputTokens += totalInputTokens;
        usage.outputTokens += outputTokens;
        usage.cachedInputTokens += cachedInputTokens;
        usage.cacheCreationTokens += cacheCreationTokens;

        if (bucketModel && bucketModel !== "null" && bucketModel !== "") {
          if (!usage.byModel[bucketModel]) {
            usage.byModel[bucketModel] = {
              inputTokens: 0,
              outputTokens: 0,
              cachedInputTokens: 0,
              cacheCreationTokens: 0,
              totalTokens: 0,
            };
          }
          usage.byModel[bucketModel].inputTokens += totalInputTokens;
          usage.byModel[bucketModel].outputTokens += outputTokens;
          usage.byModel[bucketModel].cachedInputTokens += cachedInputTokens;
          usage.byModel[bucketModel].cacheCreationTokens += cacheCreationTokens;
        }
      }
    }
  }

  usage.totalTokens = usage.inputTokens + usage.outputTokens;
  for (const model in usage.byModel) {
    usage.byModel[model].totalTokens =
      usage.byModel[model].inputTokens + usage.byModel[model].outputTokens;
  }

  let costs: AnthropicUsageResult["costs"] = null;
  if (costData?.data && Array.isArray(costData.data)) {
    costs = {
      totalCost: 0,
      tokenCosts: 0,
      webSearchCosts: 0,
      codeExecutionCosts: 0,
      byModel: {},
    };
    for (const bucket of costData.data) {
      if (!bucket.results || !Array.isArray(bucket.results)) continue;
      for (const result of bucket.results) {
        const amount = parseFloat(result.amount || "0") / 100;
        const costType = result.cost_type ?? null;
        const model = result.model || null;

        costs.totalCost += amount;
        if (costType == null || costType === "") {
          costs.tokenCosts += amount;
        } else if (typeof costType === "string") {
          const lower = costType.toLowerCase();
          if (lower.includes("web_search") || lower.includes("websearch")) {
            costs.webSearchCosts += amount;
          } else if (lower.includes("code_execution") || lower.includes("codeexecution")) {
            costs.codeExecutionCosts += amount;
          } else {
            costs.tokenCosts += amount;
          }
        } else {
          costs.tokenCosts += amount;
        }

        if (model) {
          if (!costs.byModel[model]) {
            costs.byModel[model] = {
              totalCost: 0,
              tokenCosts: 0,
              webSearchCosts: 0,
              codeExecutionCosts: 0,
            };
          }
          costs.byModel[model].totalCost += amount;
          if (costType == null || costType === "") {
            costs.byModel[model].tokenCosts += amount;
          } else if (typeof costType === "string") {
            const lower = costType.toLowerCase();
            if (lower.includes("web_search") || lower.includes("websearch")) {
              costs.byModel[model].webSearchCosts += amount;
            } else if (lower.includes("code_execution") || lower.includes("codeexecution")) {
              costs.byModel[model].codeExecutionCosts += amount;
            } else {
              costs.byModel[model].tokenCosts += amount;
            }
          } else {
            costs.byModel[model].tokenCosts += amount;
          }
        }
      }
    }
    costs.totalCost = Math.round(costs.totalCost * 100) / 100;
    costs.tokenCosts = Math.round(costs.tokenCosts * 100) / 100;
    costs.webSearchCosts = Math.round(costs.webSearchCosts * 100) / 100;
    costs.codeExecutionCosts = Math.round(costs.codeExecutionCosts * 100) / 100;
    for (const m in costs.byModel) {
      costs.byModel[m].totalCost = Math.round(costs.byModel[m].totalCost * 100) / 100;
      costs.byModel[m].tokenCosts = Math.round(costs.byModel[m].tokenCosts * 100) / 100;
      costs.byModel[m].webSearchCosts = Math.round(costs.byModel[m].webSearchCosts * 100) / 100;
      costs.byModel[m].codeExecutionCosts = Math.round(costs.byModel[m].codeExecutionCosts * 100) / 100;
    }
  }

  const cacheHitRate =
    usage.inputTokens > 0
      ? (usage.cachedInputTokens / (usage.inputTokens + usage.cachedInputTokens)) * 100
      : 0;

  return {
    success: true,
    period: { startingAt: startingAtISO, endingAt: endingAtISO, daysBack },
    usage,
    costs,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
  };
}
