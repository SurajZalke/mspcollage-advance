import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

export const sendPasswordResetCode = functions.https.onCall(async (data: any, context: any) => {
  const email = data.email;

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required.');
  }

  try {
    const actionCodeSettings = {
      url: 'https://mspcollage.firebaseapp.com/login',
      handleCodeInApp: true,
    };

    const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
      },
    });

    const mailOptions = {
      from: 'your-app-name@gmail.com',
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new functions.https.HttpsError('internal', 'Unable to send password reset email.');
  }
});
export const generateQuestions = functions.https.onCall(async (data: any, context: any) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { topic, numQuestions } = data;

  // Validate input
  if (!topic || typeof topic !== 'string' || numQuestions <= 0 || typeof numQuestions !== 'number') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid topic or number of questions provided.'
    );
  }

  try {
    // Call an external AI service (e.g., OpenAI API)
    // Replace with your actual AI API call
    const aiResponse = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${functions.config().openai.key}`,
      },
      body: JSON.stringify({
        prompt: `Generate ${numQuestions} multiple-choice questions about ${topic}. Each question should have 4 options (A, B, C, D) and indicate the correct answer. Format as JSON.`, 
        max_tokens: 1000,
        n: 1,
        stop: null,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error('AI API Error:', errorData);
      throw new functions.https.HttpsError('internal', 'Failed to get response from AI service.', errorData);
    }

    const aiData = await aiResponse.json();
    const questions = JSON.parse(aiData.choices[0].text);

    // Basic validation of the AI-generated questions structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new functions.https.HttpsError('internal', 'AI service did not return questions in the expected format.');
    }

    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new functions.https.HttpsError('internal', 'Unable to generate questions.', error);
  }
});