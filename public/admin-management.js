/* ====================================================
   ADMIN MANAGEMENT SYSTEM (Updated for Granular Control)
   Main Admin holds exclusive control over all tab permissions.
   ==================================================== */

import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// Granular Permissions based on "image_dc1b86.jpg" requirements
export const PERMISSIONS = {
  PAYMENT_TAB: 'payment_tab',
  TICKET_TAB: 'ticket_tab',
  CUSTOMER_TAB: 'customer_tab',
  AUDIT_TAB: 'audit_tab',
  DRAW_OPERATOR: 'draw_operator',
  SUPPORT: 'support'
};

// ============================================
// MAIN ADMIN FUNCTIONS (Granular Granting)
// ============================================

export async function createAdminAccount(email, password, adminName, grantedPermissions = []) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const adminId = userCredential.user.uid;

    await addDoc(collection(db, "admins"), {
      uid: adminId,
      email: email,
      name: adminName,
      // Array of permissions: e.g., ['payment_tab', 'ticket_tab']
      permissions: grantedPermissions, 
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'system'
    });

    return adminId;
  } catch (error) {
    throw error;
  }
}

// Main Admin can update specific tab access for sub-admins
export async function updateAdminAccess(adminId, newPermissionsArray) {
  try {
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, {
      permissions: newPermissionsArray,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================
// PERMISSION CHECKER (Used in UI)
// ============================================

/**
 * Checks if the current admin has access to a specific tab
 * @param {Array} adminPermissions - The array stored in the admin's Firestore record
 * @param {string} requiredPermission - The PERMISSIONS constant
 */
export function hasPermission(adminPermissions, requiredPermission) {
  // Main Admin (super-user) always has access
  if (adminPermissions?.includes('is_main_admin')) return true;
  
  // Check for specific granular access
  return adminPermissions?.includes(requiredPermission) || false;
}

// ============================================
// ADMIN LOGIN SYSTEM
// ============================================

export async function adminLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const adminId = userCredential.user.uid;

    const q = query(collection(db, "admins"), where("uid", "==", adminId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error("Admin record not found");
    const adminData = snapshot.docs[0].data();

    if (!adminData.isActive) throw new Error("Account deactivated");

    return { id: snapshot.docs[0].id, ...adminData };
  } catch (error) {
    throw error;
  }
}

// ============================================
// ACTIVITY LOGGING
// ============================================

export async function logAdminActivity(adminId, adminName, action, details) {
  try {
    await addDoc(collection(db, "admin_activity_logs"), {
      adminId,
      adminName,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Log failed", error);
  }
}

// ============================================
// GLOBAL EXPORT
// ============================================

window.adminManagement = {
  createAdminAccount,
  updateAdminAccess,
  hasPermission,
  adminLogin,
  logAdminActivity,
  PERMISSIONS
};
