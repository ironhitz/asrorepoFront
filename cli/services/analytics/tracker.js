import { db } from "./firebase.js";
import { collection, addDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export const ANALYTICS_COLLECTION = "plugin_analytics";

const EVENT_TYPES = {
  PLUGIN_INSTALL: "plugin_install",
  PLUGIN_UNINSTALL: "plugin_uninstall",
  PLUGIN_UPDATE: "plugin_update",
  PLUGIN_EXECUTE: "plugin_execute",
  PLUGIN_VERIFY: "plugin_verify",
  PLUGIN_ERROR: "plugin_error",
  PLUGIN_PURCHASE: "plugin_purchase",
  API_CALL: "api_call",
  USER_LOGIN: "user_login",
  PROJECT_SCAN: "project_scan"
};

export async function trackEvent(eventType, data = {}, userId = "anonymous") {
  const event = {
    event: eventType,
    data,
    userId,
    timestamp: new Date(),
    metadata: {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server"
    }
  };

  console.log("[ANALYTICS]", JSON.stringify(event, null, 2));

  try {
    if (db) {
      await addDoc(collection(db, ANALYTICS_COLLECTION), event);
    }
  } catch (error) {
    console.error("[ANALYTICS ERROR]", error.message);
  }

  return event;
}

export async function trackPluginInstall(pluginName, userId, metadata = {}) {
  return trackEvent(EVENT_TYPES.PLUGIN_INSTALL, {
    pluginName,
    ...metadata
  }, userId);
}

export async function trackPluginUninstall(pluginName, userId, metadata = {}) {
  return trackEvent(EVENT_TYPES.PLUGIN_UNINSTALL, {
    pluginName,
    ...metadata
  }, userId);
}

export async function trackPluginUpdate(pluginName, fromVersion, toVersion, userId) {
  return trackEvent(EVENT_TYPES.PLUGIN_UPDATE, {
    pluginName,
    fromVersion,
    toVersion
  }, userId);
}

export async function trackPluginExecute(pluginName, duration, success, userId, metadata = {}) {
  return trackEvent(EVENT_TYPES.PLUGIN_EXECUTE, {
    pluginName,
    duration,
    success,
    ...metadata
  }, userId);
}

export async function trackPluginError(pluginName, error, userId) {
  return trackEvent(EVENT_TYPES.PLUGIN_ERROR, {
    pluginName,
    error: error.message || String(error),
    stack: error.stack
  }, userId);
}

export async function trackPluginPurchase(pluginName, price, userId) {
  return trackEvent(EVENT_TYPES.PLUGIN_PURCHASE, {
    pluginName,
    price
  }, userId);
}

export async function getUserAnalytics(userId, options = {}) {
  const { days = 7, limit: limitCount = 100 } = options;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const q = query(
      collection(db, ANALYTICS_COLLECTION),
      where("userId", "==", userId),
      where("timestamp", ">", startDate),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return [];
  }
}

export async function getPluginAnalytics(pluginName, options = {}) {
  const { days = 30, limit: limitCount = 100 } = options;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const q = query(
      collection(db, ANALYTICS_COLLECTION),
      where("data.pluginName", "==", pluginName),
      where("timestamp", ">", startDate),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Failed to fetch plugin analytics:", error);
    return [];
  }
}

export async function getPluginUsageStats(pluginName, days = 30) {
  const events = await getPluginAnalytics(pluginName, { days });
  
  const stats = {
    installs: events.filter(e => e.event === EVENT_TYPES.PLUGIN_INSTALL).length,
    uninstalls: events.filter(e => e.event === EVENT_TYPES.PLUGIN_UNINSTALL).length,
    updates: events.filter(e => e.event === EVENT_TYPES.PLUGIN_UPDATE).length,
    executions: events.filter(e => e.event === EVENT_TYPES.PLUGIN_EXECUTE).length,
    errors: events.filter(e => e.event === EVENT_TYPES.PLUGIN_ERROR).length,
    purchases: events.filter(e => e.event === EVENT_TYPES.PLUGIN_PURCHASE).length
  };
  
  return stats;
}

export function getAnalyticsSummary(events) {
  const summary = {
    total: events.length,
    byType: {},
    byPlugin: {},
    daily: {}
  };

  for (const event of events) {
    summary.byType[event.event] = (summary.byType[event.event] || 0) + 1;
    
    if (event.data?.pluginName) {
      summary.byPlugin[event.data.pluginName] = (summary.byPlugin[event.data.pluginName] || 0) + 1;
    }
    
    const day = event.timestamp?.toDate?.()?.toISOString().split("T")[0] || "unknown";
    summary.daily[day] = (summary.daily[day] || 0) + 1;
  }

  return summary;
}

export { EVENT_TYPES };