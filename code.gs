function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Apartment Listing Generator')
      .setWidth(600)
      .setHeight(600);
}

function processForms(allData) {
  var output = "";
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PropertyURLs");
  var existingData = sheet.getRange("A:B").getValues();
  var propertyMap = {};

  // Create a map of existing properties for quick lookup
  existingData.forEach(function(row) {
    propertyMap[row[0]] = row[1];
  });

  allData.forEach(function(data) {
    var specialMonths = parseFloat(data.specialMonths);
    var priceAfterSpecials = (parseFloat(data.originalPrice) / parseInt(data.leaseLength)) * (parseInt(data.leaseLength) - specialMonths);
    priceAfterSpecials = priceAfterSpecials.toFixed(0);

    output += "<div style='font-size: 13px; font-family: sans-serif; margin-bottom: 10px;'>";

    // Check if the property name is in the sheet
    if (!propertyMap[data.propertyName] && data.propertyURL) {
      sheet.appendRow([data.propertyName, data.propertyURL]); // Add to sheet if not found
    }

    // Line 1: Property Name (hyperlinked if there's a URL)
    if (data.propertyURL) {
      output += "<strong><a href='" + data.propertyURL + "'>" + data.propertyName + "</a></strong><br>";
    } else {
      output += "<strong>" + data.propertyName + "</strong><br>";
    }

    // Start of bullet point list
    output += "<ul style='margin-top: 0;'>";

    // Line 2: Price After Specials (only include if specials apply)
    if (specialMonths > 0) {
      output += "<li>$" + priceAfterSpecials + " - " + data.leaseLength + " months after specials</li>";
    } else {
      output += "<li>$" + data.originalPrice + " - " + data.leaseLength + " months</li>";
    }

    // Line 3: Special Months (only include if specials apply)
    if (specialMonths > 0) {
      var specialText = specialMonths === 1 ? "month" : "months";  // Use singular or plural based on the value
      output += "<li>Special is " + specialMonths + " " + specialText + " free (Original Price: $" + parseFloat(data.originalPrice).toFixed(0) + ")</li>";
    }

    // Line 4: Sqft and Unit Number
    output += "<li>" + data.sqft + " sqft Unit #" + data.unitNumber + "</li>";

    // Line 5: Floorplan Name (whole line is hyperlinked)
    if (data.floorplanURL) {
      output += "<li><a href='" + data.floorplanURL + "'>" + data.floorplanName + " Floorplan</a></li>";
    } else {
      output += "<li>" + data.floorplanName + " Floorplan</li>";
    }

    // Line 6: Availability Date
    output += "<li>Available " + data.availabilityDate + "</li>";

    // Line 7: Extra Notes
    if (data.extraNotes) {
      output += "<li>Notes: " + data.extraNotes + "</li>";
    }

    // End of bullet point list
    output += "</ul>";
    output += "</div><hr>";
  });

  return output;
}

function getPropertyData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PropertyURLs");
  
  if (!sheet) {
    throw new Error('Sheet "PropertyURLs" not found');
  }
  
  var data = sheet.getRange("A:B").getValues();
  return data;
}

function getSuggestedURL(propertyName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PropertyURLs");
  var data = sheet.getRange("A:B").getValues(); // Column A: Property Name, Column B: URL

  // Find the URL corresponding to the property name
  for (var i = 0; i < data.length; i++) {
    if (data[i][0].toLowerCase() === propertyName.toLowerCase()) {
      return data[i][1]; // Return the URL
    }
  }
  return ''; // Return empty string if no match
}
