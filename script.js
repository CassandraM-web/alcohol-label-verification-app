function previewImage(event) {
  const container = document.getElementById("imagePreviewContainer");
  const file = event.target.files[0];

  if (!file) {
    container.innerHTML = "<p class='placeholder'>No image uploaded yet.</p>";
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    container.innerHTML = `<img src="${reader.result}" alt="Uploaded alcohol label preview" />`;
  };

  reader.readAsDataURL(file);
}

function analyzeLabel() {
  const text = document.getElementById("labelText").value.trim();
  const lowerText = text.toLowerCase();

  if (!text) {
    updateSummary("Please enter label text before analyzing.", "fail");
    document.getElementById("resultsTable").innerHTML =
      "<tr><td colspan='3'>No label text entered.</td></tr>";
    return;
  }

  const checks = [
    {
      requirement: "Brand Name",
      found:
        lowerText.includes("brand") ||
        lowerText.includes("distillery") ||
        lowerText.includes("brewery") ||
        lowerText.includes("winery"),
      notes: "Checks for brand or producer identity."
    },
    {
      requirement: "Class/Type Designation",
      found:
        lowerText.includes("bourbon") ||
        lowerText.includes("whiskey") ||
        lowerText.includes("vodka") ||
        lowerText.includes("rum") ||
        lowerText.includes("gin") ||
        lowerText.includes("beer") ||
        lowerText.includes("wine") ||
        lowerText.includes("tequila"),
      notes: "Checks for common alcohol class/type terms."
    },
    {
      requirement: "Alcohol Content",
      found:
        lowerText.includes("alc") ||
        lowerText.includes("abv") ||
        lowerText.includes("proof") ||
        lowerText.includes("%"),
      notes: "Checks for ABV, alcohol percentage, or proof."
    },
    {
      requirement: "Net Contents",
      found:
        lowerText.includes("ml") ||
        lowerText.includes("liter") ||
        lowerText.includes("litre") ||
        lowerText.includes("750") ||
        lowerText.includes("1 l"),
      notes: "Checks for bottle size or volume."
    },
    {
      requirement: "Bottler/Producer Information",
      found:
        lowerText.includes("bottled by") ||
        lowerText.includes("produced by") ||
        lowerText.includes("distilled by") ||
        lowerText.includes("brewed by") ||
        lowerText.includes("imported by"),
      notes: "Checks for responsible company language."
    },
    {
      requirement: "Government Health Warning",
      found:
        lowerText.includes("government warning") &&
        lowerText.includes("surgeon general") &&
        lowerText.includes("pregnancy") &&
        lowerText.includes("drive a car") &&
        lowerText.includes("health problems"),
      notes: "Checks for key parts of the required warning statement."
    },
    {
      requirement: "Government Warning Formatting",
      found: text.includes("GOVERNMENT WARNING:"),
      notes: "Checks whether GOVERNMENT WARNING appears in all caps."
    }
  ];

  renderResults(checks);
}

function renderResults(checks) {
  const foundCount = checks.filter((check) => check.found).length;
  const totalCount = checks.length;

  let finalStatus = "";
  let summaryClass = "";

  if (foundCount === totalCount) {
    finalStatus = "PASS: All core label elements were detected.";
    summaryClass = "pass";
  } else if (foundCount >= 4) {
    finalStatus =
      "NEEDS REVIEW: Some required elements were detected, but one or more items may be missing.";
    summaryClass = "review";
  } else {
    finalStatus =
      "LIKELY INCOMPLETE: Multiple required label elements appear to be missing.";
    summaryClass = "fail";
  }

  updateSummary(finalStatus, summaryClass);

  const tableRows = checks
    .map((check) => {
      const statusText = check.found ? "Found" : "Missing / Needs Review";
      const statusClass = check.found ? "status-found" : "status-missing";

      return `
        <tr>
          <td>${check.requirement}</td>
          <td class="${statusClass}">${statusText}</td>
          <td>${check.notes}</td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("resultsTable").innerHTML = tableRows;
}

function updateSummary(message, className) {
  const summary = document.getElementById("summary");
  summary.textContent = message;
  summary.className = `summary ${className}`;
}

function loadSample() {
  const sampleText = `Brand Name: OLD TOM DISTILLERY
Class/Type: Kentucky Straight Bourbon Whiskey
Alcohol Content: 45% Alc./Vol. (90 Proof)
Net Contents: 750 mL
Bottled by Old Tom Distillery, Louisville, KY
Country of Origin: United States

GOVERNMENT WARNING: According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.`;

  document.getElementById("labelText").value = sampleText;
}

function clearForm() {
  document.getElementById("labelText").value = "";
  updateSummary("Enter label text and select Analyze Label.", "neutral");
  document.getElementById("resultsTable").innerHTML =
    "<tr><td colspan='3'>No results yet.</td></tr>";
}