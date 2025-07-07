import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

export const sendPasswordResetCode = functions.https.onCall(async (data, context) => {
  const { email } = data.data;
  // Check if user exists
  const userSnap = await admin.firestore().collection("users").where("email", "==", email).get();
  if (userSnap.empty) {
    throw new functions.https.HttpsError("not-found", "Email not found");
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
      user: functions.config().smtp.user,
      pass: functions.config().smtp.pass,
    },
  });

  await transporter.sendMail({
    from: functions.config().smtp.user,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
  });

  return { success: true };
});

export const confirmPasswordReset = functions.https.onCall(async (data, context) => {
  const { email, code, newPassword } = data.data; // <-- FIX: destructure from data.data
  const doc = await admin.firestore().collection("passwordResetCodes").doc(email).get();
  const dataDoc = doc.data();
  if (!doc.exists || !dataDoc) throw new functions.https.HttpsError("not-found", "No code sent");

  if (dataDoc.code !== code) throw new functions.https.HttpsError("invalid-argument", "Invalid code");
  if (Date.now() > dataDoc.expiresAt) throw new functions.https.HttpsError("deadline-exceeded", "Code expired");

  // Update password in Firebase Auth
  const userRecord = await admin.auth().getUserByEmail(email);
  await admin.auth().updateUser(userRecord.uid, { password: newPassword });

  // Delete the code
  await admin.firestore().collection("passwordResetCodes").doc(email).delete();

  return { success: true };
});
