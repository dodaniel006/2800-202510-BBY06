import FormData from "form-data";
import Mailgun from "mailgun.js";
import fs from 'node:fs';
import path from "path";
import ejs from "ejs"; 
import "dotenv/config";

const __dirname = import.meta.dirname;

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});


async function sendEmail(recipientEmail, recipientName, subject, contents) {
  const templatePath = path.join(__dirname, 'views', 'mail.ejs');
  const templateFile = await fs.promises.readFile(templatePath, 'utf-8', (err, data) => {
    if (err) {
      console.errror(err);
      return;
    }
    console.log(data);
  });

  const templateData = {
    recipientName: recipientName,
    subject: subject,
    contents: contents,
  };

  // Render the EJS template with the data
  const html = ejs.render(templateFile, templateData);

  try {
    const emailResult = await mg.messages.create("sandboxac2c816c700d453b99ac833e8d0fe06a.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxac2c816c700d453b99ac833e8d0fe06a.mailgun.org>",
      to: [recipientEmail],
      subject: subject,
      html: html
    });
    console.log(emailResult);
  } catch (error) {
    console.log(error);

  }


}export default sendEmail;


async function sendBareEmail(email, subject, text, html) {

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

export { sendBareEmail };

