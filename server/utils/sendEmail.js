import transporter from "../config/email.js";

const sendResetEmail = async (to, token) => {
  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your password",
    html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes</p>
        `,
  });
};

export default sendResetEmail;
