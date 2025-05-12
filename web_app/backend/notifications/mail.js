import FormData from "form-data";
import Mailgun from "mailgun.js";
import "dotenv/config";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

// Example
async function sendSimpleMessage() {
  try {
    const data = await mg.messages.create("sandboxac2c816c700d453b99ac833e8d0fe06a.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxac2c816c700d453b99ac833e8d0fe06a.mailgun.org>",
      to: ["Jacob Lebl <lebl.jacob@gmail.com>"],
      subject: "Hello Jacob Lebl",
      text: "Hello! This is a test email sent from Mailgun.",
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
// End Example

sendSimpleMessage();


async function sendEmail(email, subject, text, html) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "",
  });

   try {
    const data = await mg.messages.create("sandboxac2c816c700d453b99ac833e8d0fe06a.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxac2c816c700d453b99ac833e8d0fe06a.mailgun.org>",
      to: [email],
      subject: subject,
      text: text,
      html: html,
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}

export default sendEmail;