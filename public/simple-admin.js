import { db } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export async function simpleAdminLogin(email, password) {
  try {
    // Query Firestore for admin with matching email
    const q = query(collection(db, "admins"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("Admin account not found");
    }

    const adminData = snapshot.docs[0].data();
    const adminId = snapshot.docs[0].id;

    // Simple password check (in production, use hashed passwords)
    if (adminData.password !== password) {
      throw new Error("Incorrect password");
    }

    if (!adminData.isActive) {
      throw new Error("Admin account is inactive");
    }

    console.log("✅ Admin logged in:", email);
    return { id: adminId, ...adminData };

  } catch (error) {
    console.error("❌ Login error:", error.message);
    throw error;
  }
}

window.simpleAdminLogin = simpleAdminLogin;
