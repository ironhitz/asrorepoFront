import { db } from "./firebase.js";
import { collection, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";

export const PLUGIN_PRICES_COLLECTION = "plugin_prices";
export const LICENSES_COLLECTION = "licenses";

export async function getPluginPrice(pluginId) {
  try {
    const priceRef = doc(db, PLUGIN_PRICES_COLLECTION, pluginId);
    const priceSnap = await getDoc(priceRef);
    
    if (!priceSnap.exists()) {
      return { price: 0, isFree: true };
    }
    
    const data = priceSnap.data();
    return { price: data.price || 0, isFree: data.price === 0 };
  } catch (error) {
    return { price: 0, isFree: true, error: error.message };
  }
}

export async function setPluginPrice(pluginId, price, ownerId) {
  try {
    const priceRef = doc(db, PLUGIN_PRICES_COLLECTION, pluginId);
    await updateDoc(priceRef, {
      price: price,
      ownerId: ownerId,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function checkPluginAccess(userId, pluginId) {
  try {
    const licensesRef = collection(db, LICENSES_COLLECTION);
    const q = query(licensesRef, where("userId", "==", userId), where("pluginId", "==", pluginId));
    const licensesSnap = await getDocs(q);
    
    if (licensesSnap.empty) {
      const pluginPrice = await getPluginPrice(pluginId);
      if (pluginPrice.isFree) {
        return { hasAccess: true, reason: "free" };
      }
      return { hasAccess: false, reason: "not_purchased" };
    }
    
    const license = licensesSnap.docs[0].data();
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return { hasAccess: false, reason: "expired" };
    }
    
    return { hasAccess: true, reason: "purchased" };
  } catch (error) {
    return { hasAccess: false, error: error.message };
  }
}

export async function purchasePlugin(userId, pluginId, paymentMethod = "mock") {
  try {
    const pluginPrice = await getPluginPrice(pluginId);
    
    if (pluginPrice.isFree) {
      return { success: true, message: "Plugin is free" };
    }

    if (paymentMethod === "mock") {
      const mockPaymentSuccess = true;
      
      if (!mockPaymentSuccess) {
        throw new Error("Payment failed");
      }
    } else if (paymentMethod === "stripe") {
      // TODO: Integrate with Stripe
      throw new Error("Stripe not configured");
    } else {
      throw new Error("Unknown payment method");
    }

    const licensesRef = collection(db, LICENSES_COLLECTION);
    const newLicense = {
      userId,
      pluginId,
      purchasedAt: new Date(),
      paymentMethod,
      status: "active"
    };

    const q = query(licensesRef, where("userId", "==", userId), where("pluginId", "==", pluginId));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      return { success: true, message: "License already exists" };
    }

    // In real implementation, use addDoc here
    // await addDoc(licensesRef, newLicense);
    
    return { success: true, message: "Purchase successful" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getUserLicenses(userId) {
  try {
    const licensesRef = collection(db, LICENSES_COLLECTION);
    const q = query(licensesRef, where("userId", "==", userId));
    const licensesSnap = await getDocs(q);
    
    return licensesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    return [];
  }
}

export function generateLicenseKey(userId, pluginId) {
  const timestamp = Date.now().toString(36);
  const hash = Buffer.from(`${userId}-${pluginId}-${timestamp}`).toString("base64");
  return `ASRO-${pluginId.substring(0, 4).toUpperCase()}-${hash.substring(0, 12).toUpperCase()}`;
}

export function validateLicenseKey(licenseKey, userId, pluginId) {
  if (!licenseKey || !licenseKey.startsWith("ASRO-")) {
    return false;
  }
  
  const parts = licenseKey.split("-");
  if (parts.length < 3) {
    return false;
  }
  
  return true;
}