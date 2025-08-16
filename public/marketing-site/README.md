# Onboard Hero - Marketing Website Technical Plan

This document outlines the technical plan for the "Onboard Hero" marketing website.

## 1. Project Structure

The project will be organized within the `marketing-site` directory. This ensures a clean separation from the main application.

```
marketing-site/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   │   ├── screenshot-1.png
│   │   └── screenshot-2.png
│   └── videos/
│       └── demo.mp4
├── index.html
└── README.md
```

*   **`assets/`**: Contains all the static assets for the website.
    *   **`css/`**: For stylesheets.
    *   **`js/`**: For JavaScript files.
    *   **`images/`**: For screenshots and other images.
    *   **`videos/`**: For the application demo video.
*   **`index.html`**: The main HTML file for the single-page website.
*   **`README.md`**: This file, containing the technical plan.

## 2. Technical Plan

### 2.1. High-Level Overview & Architecture

The website will be a static, single-page site built with HTML, CSS, and modern JavaScript. A static site generator (like Hugo or Eleventy) could be used to streamline development and templating, but for simplicity and to ensure a unique result, we'll start with vanilla HTML, CSS and JS. This approach guarantees optimal performance, security, and ease of deployment on any static hosting provider (e.g., Netlify, Vercel, AWS S3).

The site will not have a traditional backend. The "contact us" form will submit to a third-party form handling service (like Netlify Forms, Formspree, or a custom serverless function) to process submissions and send email notifications.

### 2.2. Layout and Design Concept (Unique & Non-Standard)

Instead of a typical top-to-bottom scroll, the website will feature a **horizontal scrolling** or **story-driven parallax** experience. Each section will transition into the next with engaging animations and interactive elements.

*   **Visual Theme:** A clean, futuristic aesthetic with a dark mode by default. We will use a limited color palette (e.g., dark blues, purples, and a bright accent color for CTAs) and custom iconography.
*   **Typography:** We will use a combination of a modern sans-serif for headings and a highly legible serif for body copy to create a sophisticated feel.
*   **Interactivity:** Scroll-triggered animations will be used to reveal content and highlight key features. Subtle hover effects and micro-interactions will provide a polished, high-class user experience.

### 2.3. Website Sections

1.  **Hero Section:**
    *   A bold, full-screen section with the "Onboard Hero" logo and a compelling headline.
    *   A subtle, animated background that draws the user in.
    *   A clear CTA: "See How It Works" that smoothly scrolls the user to the Features section.

2.  **Features Section:**
    *   This section will use a card-based layout or an interactive timeline to showcase the key features of Onboard Hero.
    *   Each feature will have a concise description and a custom icon.
    *   The features will animate into view as the user scrolls.

3.  **Advantages Section:**
    *   A comparison section that highlights what makes "Onboard Hero" superior to competitors.
    *   This will be presented visually, perhaps as a "before and after" or a side-by-side comparison, rather than a boring checklist.

4.  **Video & Screenshots Section:**
    *   A dedicated section to showcase a professionally produced video of the app in action.
    *   A gallery of high-resolution screenshots with captions.
    *   The video will be embedded to play inline, and screenshots can be viewed in a lightbox/modal.

5.  **Call to Action (CTA) / Contact Section:**
    *   The final section will be a clear and unmissable call to action.
    *   This will contain the "contact us to set up a demo" form.

### 2.4. "Contact Us" Form

The contact form will be simple and designed to minimize friction.

*   **Fields:**
    *   Full Name (required)
    *   Work Email (required)
    *   Company Name
    *   Message (optional)
*   **Functionality:**
    *   Client-side validation will be implemented with JavaScript to provide immediate feedback.
    *   On submission, the form data will be sent via an AJAX request to a serverless function (e.g., using Netlify Functions or a similar service).
    *   The serverless function will sanitize the input and then use an email service (like SendGrid or AWS SES) to send a notification to our sales team.
    *   The user will see a success message directly on the page without a full-page reload.