/* ====================================================
   ADMIN MANAGEMENT SYSTEM
   Main Admin creates & manages sub-admins
   ==================================================== */

import { db, auth } from './firebase-config.js';
import { 
  collection, 
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Permission levels
const PERMISSION_LEVELS = {
  MAIN_ADMIN: 'main_admin',
  TICKET_MANAGER: 'ticket_manager',
  PAYMENT_VERIFIER: 'payment_verifier',
  CUSTOMER_SUPPORT: 'customer_support',
  DRAW_OPERATOR: 'draw_operator'
};

// ============================================
// MAIN ADMIN FUNCTIONS
// ============================================

export async function createAdminAccount(email, password, adminName, permissionLevel) {
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const adminId = userCredential.user.uid;

    // Store admin in Firestore
    const adminRef = await addDoc(collection(db, "admins"), {
      uid: adminId,
      email: email,
      name: adminName,
      permissionLevel: permissionLevel,
      createdAt: serverTimestamp(),
      isActive: true,
      lastLogin: null,
      createdBy: getCurrentMainAdmin() // Track who created this admin
    });

    console.log("✅ Admin account created:", email);
    return adminRef.id;

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    throw error;
  }
}

export async function getAllAdmins() {
  try {
    const snapshot = await getDocs(collection(db, "admins"));
    const admins = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log("✅ Loaded admins:", admins.length);
    return admins;
  } catch (error) {
    console.error("❌ Error loading admins:", error);
    return [];
  }
}

export async function updateAdminPermissions(adminId, newPermissionLevel) {
  try {
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, {
      permissionLevel: newPermissionLevel,
      updatedAt: serverTimestamp()
    });

    console.log("✅ Admin permissions updated");
    return true;
  } catch (error) {
    console.error("❌ Error updating admin:", error);
    return false;
  }
}

export async function deactivateAdmin(adminId) {
  try {
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, {
      isActive: false,
      deactivatedAt: serverTimestamp()
    });

    console.log("✅ Admin deactivated");
    return true;
  } catch (error) {
    console.error("❌ Error deactivating admin:", error);
    return false;
  }
}

export async function deleteAdminAccount(adminId) {
  try {
    await deleteDoc(doc(db, "admins", adminId));
    console.log("✅ Admin account deleted");
    return true;
  } catch (error) {
    console.error("❌ Error deleting admin:", error);
    return false;
  }
}

export async function recordAdminLogin(adminId) {
  try {
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, {
      lastLogin: serverTimestamp()
    });
  } catch (error) {
    console.error("❌ Error recording login:", error);
  }
}

// ============================================
// ADMIN LOGIN SYSTEM
// ============================================

export async function adminLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const adminId = userCredential.user.uid;

    // Get admin details
    const q = query(collection(db, "admins"), where("uid", "==", adminId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("Admin account not found");
    }

    const adminData = snapshot.docs[0].data();

    // Check if admin is active
    if (!adminData.isActive) {
      throw new Error("This admin account has been deactivated");
    }

    // Record login
    recordAdminLogin(snapshot.docs[0].id);

    console.log("✅ Admin logged in:", email);
    return {
      id: snapshot.docs[0].id,
      ...adminData
    };

  } catch (error) {
    console.error("❌ Admin login error:", error.message);
    throw error;
  }
}

// ============================================
// PERMISSION CHECKER
// ============================================

export function hasPermission(adminPermissionLevel, requiredPermission) {
  const permissions = {
    main_admin: ['main_admin', 'ticket_manager', 'payment_verifier', 'customer_support', 'draw_operator'],
    ticket_manager: ['ticket_manager', 'payment_verifier'],
    payment_verifier: ['payment_verifier'],
    customer_support: ['customer_support'],
    draw_operator: ['draw_operator']
  };

  return permissions[adminPermissionLevel]?.includes(requiredPermission) || false;
}

// ============================================
// ADMIN ACTIVITY LOGGING
// ============================================

export async function logAdminActivity(adminId, adminName, action, details) {
  try {
    await addDoc(collection(db, "admin_activity_logs"), {
      adminId: adminId,
      adminName: adminName,
      action: action,
      details: details,
      timestamp: serverTimestamp()
    });

    console.log("✅ Activity logged:", action);
  } catch (error) {
    console.error("❌ Error logging activity:", error);
  }
}

export async function getAdminActivityLogs(adminId = null) {
  try {
    let q;
    if (adminId) {
      q = query(collection(db, "admin_activity_logs"), where("adminId", "==", adminId));
    } else {
      q = query(collection(db, "admin_activity_logs"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("❌ Error loading logs:", error);
    return [];
  }
}

// ============================================
// EXPORT TO GLOBAL
// ============================================

window.adminManagement = {
  createAdminAccount,
  getAllAdmins,
  updateAdminPermissions,
  deactivateAdmin,
  deleteAdminAccount,
  recordAdminLogin,
  adminLogin,
  hasPermission,
  logAdminActivity,
  getAdminActivityLogs,
  PERMISSION_LEVELS
};

function getCurrentMainAdmin() {
  return localStorage.getItem('mainAdminId') || 'system';
}

console.log("🚀 Admin Management System loaded!");
