import * as admin from "firebase-admin";
 import * as nodemailer from "nodemailer";
 import { onCall, HttpsError } from "firebase-functions/v2/https";
 import { config } from "firebase-functions";

admin.initializeApp();

export const sendPasswordResetCode = onCall(async (data, context) => {
  const { email } = data.data;
  // Check if user exists
  const userSnap = await admin.firestore().collection("users").where("email", "==", email).get();
  if (userSnap.empty) {
    throw new HttpsError("not-found", "Email not found");
  }

  // Generate code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save code with expiry
  await admin.firestore().collection("passwordResetCodes").doc(email).set({
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  // Send code via email (configure your transporter)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config().smtp.user,
      pass: config().smtp.pass,
    },
  });

  await transporter.sendMail({
    from: config().smtp.user,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
  });

  return { success: true };
});

export const confirmPasswordReset = onCall(async (data, context) => {
  const { email, code, newPassword } = data.data; // <-- FIX: destructure from data.data
  const doc = await admin.firestore().collection("passwordResetCodes").doc(email).get();
  const dataDoc = doc.data();
  if (!doc.exists || !dataDoc) throw new HttpsError("not-found", "No code sent");

  if (dataDoc.code !== code) throw new HttpsError("invalid-argument", "Invalid code");
  if (Date.now() > dataDoc.expiresAt) throw new HttpsError("deadline-exceeded", "Code expired");

  // Update password in Firebase Auth
  const userRecord = await admin.auth().getUserByEmail(email);
  await admin.auth().updateUser(userRecord.uid, { password: newPassword });

  // Delete the code
  await admin.firestore().collection("passwordResetCodes").doc(email).delete();

  return { success: true };
});
