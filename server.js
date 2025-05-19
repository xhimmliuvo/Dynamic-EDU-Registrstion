const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const pdf = require("html-pdf");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "form.html"));
});

// Handle form submit
app.post("/submit", async (req, res) => {
  const formData = req.body;

  const html = `
    <h1>Form Submission</h1>
    <p><strong>Name:</strong> ${formData.name}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    <p><strong>Message:</strong> ${formData.message}</p>
  `;

  const pdfPath = path.join(__dirname, "form.pdf");

  pdf.create(html).toFile(pdfPath, async (err) => {
    if (err) return res.status(500).send("PDF generation error");

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: "dynamicedu1@gmail.com",
        pass: "6BGUHPE98cZpzaIM",
      },
    });

    const mailOptions = {
      from: '"Form App" <your_brevo_email@example.com>',
      to: "recipient@example.com",
      subject: "New Form PDF",
      text: "See attached PDF",
      attachments: [{ filename: "form.pdf", path: pdfPath }],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.send("Form submitted and PDF emailed!");
    } catch (emailErr) {
      res.status(500).send("Failed to send email");
    } finally {
      fs.unlinkSync(pdfPath);
    }
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
