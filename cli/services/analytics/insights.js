import { getUserAnalytics, getPluginUsageStats, getAnalyticsSummary, EVENT_TYPES } from "./tracker.js";

const AI_MODEL = process.env.AI_MODEL || "gemini-2.0-flash";

export async function generateInsights(userId, options = {}) {
  const { days = 7, includeRecommendations = true } = options;
  
  try {
    const events = await getUserAnalytics(userId, { days, limit: 500 });
    const summary = getAnalyticsSummary(events);
    
    const insights = {
      period: `${days} days`,
      totalEvents: summary.total,
      summary: summary,
      generatedAt: new Date().toISOString()
    };

    if (events.length > 0) {
      insights.patterns = analyzePatterns(events);
      insights.alerts = generateAlerts(events);
    }

    if (includeRecommendations && events.length > 0) {
      insights.recommendations = await generateRecommendations(userId, events);
    }

    return insights;
  } catch (error) {
    return { error: error.message, success: false };
  }
}

function analyzePatterns(events) {
  const patterns = [];
  
  const eventCounts = {};
  for (const event of events) {
    const hour = event.timestamp?.toDate?.()?.getHours() || -1;
    if (hour >= 0) {
      eventCounts[hour] = (eventCounts[hour] || 0) + 1;
    }
  }
  
  const peakHour = Object.entries(eventCounts).sort((a, b) => b[1] - a[1])[0];
  if (peakHour && parseInt(peakHour[1]) > 5) {
    patterns.push({
      type: "peak_usage",
      message: `Most active around ${peakHour[0]}:00`
    });
  }

  const errorEvents = events.filter(e => e.event === EVENT_TYPES.PLUGIN_ERROR);
  if (errorEvents.length > 3) {
    patterns.push({
      type: "high_errors",
      message: `${errorEvents.length} errors in the last ${events.length} events`,
      severity: "warning"
    });
  }

  const pluginVersions = {};
  for (const event of events) {
    if (event.event === EVENT_TYPES.PLUGIN_UPDATE) {
      const name = event.data?.pluginName;
      pluginVersions[name] = (pluginVersions[name] || 0) + 1;
    }
  }

  const frequentUpdates = Object.entries(pluginVersions).filter(([_, count]) => count > 2);
  if (frequentUpdates.length > 0) {
    patterns.push({
      type: "frequent_updates",
      message: `Frequent updates detected for: ${frequentUpdates.map(([name]) => name).join(", ")}`
    });
  }

  return patterns;
}

function generateAlerts(events) {
  const alerts = [];
  
  const errors = events.filter(e => e.event === EVENT_TYPES.PLUGIN_ERROR);
  if (errors.length > events.length * 0.1) {
    alerts.push({
      type: "high_error_rate",
      message: "Error rate exceeds 10%",
      severity: "critical"
    });
  }

  const recentUninstalls = events.filter(e => 
    e.event === EVENT_TYPES.PLUGIN_UNINSTALL && 
    new Date() - new Date(e.timestamp?.toDate()) < 24 * 60 * 60 * 1000
  );

  if (recentUninstalls.length >= 3) {
    alerts.push({
      type: "multiple_uninstalls",
      message: "Multiple plugins uninstalled in the last 24 hours",
      severity: "warning"
    });
  }

  const executeErrors = events.filter(e => 
    e.event === EVENT_TYPES.PLUGIN_EXECUTE && !e.data?.success
  );

  if (executeErrors.length > 5) {
    alerts.push({
      type: "execution_failures",
      message: `${executeErrors.length} failed plugin executions`,
      severity: "warning"
    });
  }

  return alerts;
}

async function generateRecommendations(userId, events) {
  const recommendations = [];
  
  const pluginsUsed = new Set();
  for (const event of events) {
    if (event.data?.pluginName) {
      pluginsUsed.add(event.data.pluginName);
    }
  }

  const executionEvents = events.filter(e => e.event === EVENT_TYPES.PLUGIN_EXECUTE);
  const avgDuration = executionEvents.reduce((sum, e) => sum + (e.data?.duration || 0), 0) / (executionEvents.length || 1);
  
  if (avgDuration > 5000) {
    recommendations.push({
      type: "performance",
      message: "Consider optimizing plugin execution time",
      action: "Review and optimize slow-running plugins"
    });
  }

  const unusedPlugins = Array.from(pluginsUsed).filter(name => {
    const recentUse = events.find(e => 
      e.data?.pluginName === name && 
      e.event === EVENT_TYPES.PLUGIN_EXECUTE &&
      new Date() - new Date(e.timestamp?.toDate()) < 7 * 24 * 60 * 60 * 1000
    );
    return !recentUse;
  });

  if (unusedPlugins.length > 3) {
    recommendations.push({
      type: "cleanup",
      message: `${unusedPlugins.length} plugins haven't been used recently`,
      action: "Consider uninstalling unused plugins"
    });
  }

  return recommendations;
}

export async function getPluginHealth(pluginName) {
  try {
    const stats = await getPluginUsageStats(pluginName, 30);
    
    const totalEvents = stats.installs + stats.executions + stats.errors;
    const errorRate = totalEvents > 0 ? stats.errors / totalEvents : 0;
    
    let health = "good";
    if (errorRate > 0.2) health = "critical";
    else if (errorRate > 0.1) health = "warning";
    
    return {
      pluginName,
      health,
      errorRate: (errorRate * 100).toFixed(2) + "%",
      stats,
      assessedAt: new Date().toISOString()
    };
  } catch (error) {
    return { pluginName, health: "unknown", error: error.message };
  }
}

export async function getUserEngagementScore(userId, days = 30) {
  try {
    const events = await getUserAnalytics(userId, { days, limit: 200 });
    
    const score = {
      totalEvents: events.length,
      uniquePlugins: new Set(events.filter(e => e.data?.pluginName).map(e => e.data.pluginName)).size,
      activeDays: new Set(events.map(e => e.timestamp?.toDate?.()?.toDateString())).size,
      errorRate: 0,
      engagement: "low"
    };

    const errors = events.filter(e => e.event === EVENT_TYPES.PLUGIN_ERROR).length;
    score.errorRate = events.length > 0 ? errors / events.length : 0;

    if (score.totalEvents > 50 && score.uniquePlugins > 5) {
      score.engagement = "high";
    } else if (score.totalEvents > 20 || score.uniquePlugins > 2) {
      score.engagement = "medium";
    }

    return score;
  } catch (error) {
    return { error: error.message };
  }
}

export async function getMarketplaceTrends(days = 30) {
  try {
    // In production, this would aggregate data across all users
    // For now, return mock trends
    return {
      period: `${days} days`,
      topPlugins: [
        { name: "security-scanner", installs: 156, growth: 12 },
        { name: "compliance-auditor", installs: 89, growth: 8 },
        { name: "dependency-monitor", installs: 234, growth: 15 }
      ],
      trends: {
        security: "+23%",
        compliance: "+18%",
        monitoring: "+31%"
      },
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    return { error: error.message };
  }
}