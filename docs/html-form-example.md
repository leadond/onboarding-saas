# HTML Form Example for Client Intake

This document provides an example HTML form that can be used with the HTML Form feature in the intake form step.

## Basic HTML Form Example

```html
<div class="client-intake-form">
  <h2>Project Information</h2>
  
  <div class="form-group">
    <label for="client_name">Full Name *</label>
    <input type="text" id="client_name" name="client_name" required>
  </div>
  
  <div class="form-group">
    <label for="client_email">Email Address *</label>
    <input type="email" id="client_email" name="client_email" required>
  </div>
  
  <div class="form-group">
    <label for="client_phone">Phone Number</label>
    <input type="tel" id="client_phone" name="client_phone">
  </div>
  
  <div class="form-group">
    <label for="company_name">Company Name</label>
    <input type="text" id="company_name" name="company_name">
  </div>
  
  <h3>Project Details</h3>
  
  <div class="form-group">
    <label for="project_type">Project Type *</label>
    <select id="project_type" name="project_type" required>
      <option value="">Select a project type</option>
      <option value="website">Website</option>
      <option value="web_application">Web Application</option>
      <option value="mobile_app">Mobile Application</option>
      <option value="ecommerce">E-commerce Platform</option>
      <option value="other">Other</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="project_description">Project Description *</label>
    <textarea id="project_description" name="project_description" rows="5" required placeholder="Please describe your project in detail..."></textarea>
  </div>
  
  <div class="form-group">
    <label for="budget_range">Budget Range</label>
    <select id="budget_range" name="budget_range">
      <option value="">Select budget range</option>
      <option value="under_5k">Under $5,000</option>
      <option value="5k_10k">$5,000 - $10,000</option>
      <option value="10k_25k">$10,000 - $25,000</option>
      <option value="25k_50k">$25,000 - $50,000</option>
      <option value="over_50k">Over $50,000</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="timeline">Project Timeline</label>
    <input type="text" id="timeline" name="timeline" placeholder="e.g., 3 months, by end of year, etc.">
  </div>
  
  <h3>Additional Information</h3>
  
  <div class="form-group">
    <label for="features">Key Features Needed</label>
    <textarea id="features" name="features" rows="3" placeholder="List the key features you need in your project..."></textarea>
  </div>
  
  <div class="form-group">
    <label for="reference_sites">Reference Websites (if any)</label>
    <input type="text" id="reference_sites" name="reference_sites" placeholder="List websites you like or want to reference">
  </div>
  
  <div class="form-group">
    <label for="additional_notes">Additional Notes</label>
    <textarea id="additional_notes" name="additional_notes" rows="3" placeholder="Any other information you'd like to share..."></textarea>
  </div>
</div>
```

## CSS Styling Example

```css
.client-intake-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.client-intake-form h2 {
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.client-intake-form h3 {
  color: #555;
  margin-top: 30px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Required field indicator */
.form-group label::after {
  content: " *";
  color: #e74c3c;
  display: none;
}

.form-group label[required]::after,
.form-group input[required] + label::after,
.form-group select[required] + label::after,
.form-group textarea[required] + label::after {
  display: inline;
}
```

## Field Mappings Example

When setting up your HTML form in the intake step, you can provide field mappings to standardize the data:

```json
{
  "client_name": "name",
  "client_email": "email",
  "client_phone": "phone",
  "company_name": "company",
  "project_type": "projectType",
  "project_description": "description",
  "budget_range": "budget",
  "timeline": "timeline",
  "features": "features",
  "reference_sites": "references",
  "additional_notes": "notes"
}
```

## Usage Instructions

1. Copy the HTML form code above and paste it into the "HTML Content" field when creating an intake form step
2. Optionally, add the CSS code to the "CSS Content" field for styling
3. Configure field mappings if you want to standardize the field names
4. Customize the submit button text if desired
5. Save and publish your kit

The form will be rendered to clients going through the onboarding process, and their responses will be captured and stored in the system.