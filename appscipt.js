const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

function initialSetup() {
    const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    scriptProp.setProperty('key', activeSpreadsheet.getId());
}

function uploadToDrive(e) {
  try {
    // Validate required parameters
    if (!e.parameter.data || !e.parameter.mimeType || !e.parameter.fileName) {
      throw new Error("Missing required parameters.");
    }

    const fileName = e.parameter.fileName;
    const mimeType = e.parameter.mimeType;
    const folderId = '1lCyDJeatg4VgecTK5xE3jgAd7fpuYZHg';
    const folder = DriveApp.getFolderById(folderId);

    // Remove existing files with the same name in the folder
    const existingFiles = folder.getFilesByName(fileName);
    while (existingFiles.hasNext()) {
      const file = existingFiles.next();
      file.setTrashed(true); // move to trash (safe delete)
    }

    // Create new blob and upload
    const blob = Utilities.newBlob(
      Utilities.base64Decode(e.parameter.data),
      mimeType,
      fileName
    );

    const file = folder.createFile(blob);
    file.setDescription(`Uploaded via Google Apps Script on ${new Date()}`);

    return ContentService.createTextOutput(JSON.stringify({
      status: true,
      fileName: fileName,
      fileId: file.getId(),
      url: file.getUrl(),
      mimeType: mimeType,
      size: blob.getBytes().length,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Upload error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateProject(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
      const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
      const sheet = doc.getSheetByName(sheetName);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      const title = e.parameters.title[0];
      const email = e.parameters.Email[0];
      
      // Find the row to update
      let rowToUpdate = -1;
      for (let i = 1; i < data.length; i++) {
          if (data[i][headers.indexOf('Project Title')] == title && 
              data[i][headers.indexOf('Email')] == email) {
              rowToUpdate = i + 1; // +1 because sheet rows are 1-indexed
              break;
          }
      }
      
      if (rowToUpdate === -1) {
          return ContentService.createTextOutput(JSON.stringify({ 
              result: 'error', 
              error: 'Project not found or not authorized to update' 
          })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Prepare the updated row
      const updatedRow = headers.map(header => {
          if (header === 'Timestamp') return data[rowToUpdate-1][headers.indexOf('Timestamp')];
          if (header === 'id') return id;
          return e.parameters[header] ? e.parameters[header][0] : '';
      });
      
      // Update the row
      sheet.getRange(rowToUpdate, 1, 1, headers.length).setValues([updatedRow]);
      
      return ContentService.createTextOutput(JSON.stringify({ 
          result: 'success',
          row: rowToUpdate
      })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({ 
          result: 'error', 
          error: error.message 
      })).setMimeType(ContentService.MimeType.JSON);
  } finally {
      lock.releaseLock();
  }
}

function sendUpdate(e) {
  try {
    const email = e.parameter.Email;

    if (!email) {
      throw new Error("Missing 'Email' parameter.");
    }

    MailApp.sendEmail({
      to: email,
      subject: "Update from the System",
      body: "Vishal dhaan da pooleeee"
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: true,
      message: `Email sent to ${email}`
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  const action = e.parameter.action ? e.parameter.action[0] : null;

  if (action === 'updateProject') {
    return updateProject(e);
  }
  if (action === 'deleteProject') {
    return deleteProject(e);
  }

  if (e.parameter.action === 'uploadFileToDrive') {
      return uploadToDrive(e);
    }
  
  if (e.parameter.action === 'sendUpdate')
  {
    return sendUpdate(e);
  }

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    // Get all parameters from the form
    const formData = e.parameters;
    const newRow = headers.map(header => {
  if (header === 'Timestamp') {
    return new Date(); // Set current timestamp here
  }
  return formData[header] ? formData[header][0] : "";
});



    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService.createTextOutput(JSON.stringify({ 
      result: 'success',
      row: nextRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: 'error', 
      error: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function onFormSubmit(e) {
  sendNotifications(); // Call your main logic after submission
}


function sendNotifications() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const emailIndex = headers.indexOf("Email");
  const titleIndex = headers.indexOf("Project Title");
  const deadlineIndex = headers.indexOf("Deadline");
  const notifiedIndex = headers.indexOf("Notified");
  const lastNotifiedIndex = headers.indexOf("Last Notified");

  if (
    emailIndex === -1 || titleIndex === -1 ||
    deadlineIndex === -1 || notifiedIndex === -1 || lastNotifiedIndex === -1
  ) {
    Logger.log("Required column(s) missing.");
    return;
  }

  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[emailIndex];
    const projectTitle = row[titleIndex];
    let deadline = row[deadlineIndex];
    let lastNotified = row[lastNotifiedIndex];
    const notified = row[notifiedIndex];

    if (!email || !projectTitle || !deadline) continue;

    if (!(deadline instanceof Date)) deadline = new Date(deadline);
    if (lastNotified && !(lastNotified instanceof Date)) lastNotified = new Date(lastNotified);

    const diffDays = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));
    const isSameDay = deadline.toDateString() === now.toDateString();

    Logger.log(`Processing "${projectTitle}" for ${email}. Days left: ${diffDays}`);

    if (isSameDay && notified !== "Final Reminder Sent") {
      MailApp.sendEmail({
        to: email,
        subject: `Final Reminder: Deadline Today for "${projectTitle}"`,
        body: `Hey!\n\nThis is your final reminder. Your project "${projectTitle}" is due today (${deadline.toDateString()}).\n\nGood luck!`
      });
      sheet.getRange(i + 1, notifiedIndex + 1).setValue("Final Reminder Sent");
      sheet.getRange(i + 1, lastNotifiedIndex + 1).setValue(now);
      continue;
    }

    if (now > deadline && notified !== "Deadline Missed") {
      MailApp.sendEmail({
        to: email,
        subject: `Deadline Missed: "${projectTitle}"`,
        body: `Hey!\n\nThe deadline for your project "${projectTitle}" on ${deadline.toDateString()} has passed.\nPlease contact your coordinator if needed.`
      });
      sheet.getRange(i + 1, notifiedIndex + 1).setValue("Deadline Missed");
      sheet.getRange(i + 1, lastNotifiedIndex + 1).setValue(now);
      continue;
    }

    if (now < deadline) {
      const shouldNotify = !lastNotified || ((now - lastNotified) / (1000 * 60 * 60 * 24)) >= 2;
      if (shouldNotify) {
        MailApp.sendEmail({
          to: email,
          subject: `Reminder: "${projectTitle}" Deadline in ${diffDays} day(s)`,
          body: `Hey!\n\nThis is a reminder that your project "${projectTitle}" is due on ${deadline.toDateString()}.\nMake sure everything is on track.`
        });
        sheet.getRange(i + 1, notifiedIndex + 1).setValue("Reminder Sent");
        sheet.getRange(i + 1, lastNotifiedIndex + 1).setValue(now);
      }
    }
  }
}

function getProjectById(e) {
  try {
      const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
      const sheet = doc.getSheetByName(sheetName);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      const title = e.parameter.title;
      const email = e.parameter.email;
      
      // Find the project by ID and email (for security)
      const projectRow = data.find(row => 
          row[headers.indexOf('Project Title')] == title && 
          row[headers.indexOf('Email')] == email
      );
      
      if (!projectRow) {
          return ContentService.createTextOutput(JSON.stringify({ 
              result: 'error', 
              error: 'Project not found' 
          })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Convert to object with headers as keys
      const project = {};
      headers.forEach((header, index) => {
          project[header] = projectRow[index] || "";
      });
      
      return ContentService.createTextOutput(JSON.stringify({ 
          result: 'success', 
          data: project 
      })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({ 
          result: 'error', 
          error: error.message 
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteProject(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const title = e.parameter.title;
    const email = e.parameter.email;

    // Find all rows that match the criteria
    let rowsToDelete = [];
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][headers.indexOf('Project Title')] == title && 
          data[i][headers.indexOf('Email')] == email) {
        rowsToDelete.push(i + 1); // +1 because sheet rows are 1-indexed
      }
    }

    if (rowsToDelete.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ 
        result: 'error', 
        error: 'Project not found or not authorized to delete' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Delete rows from bottom to top to maintain correct indices
    rowsToDelete.sort((a, b) => b - a); // Sort in descending order
    rowsToDelete.forEach(row => {
      sheet.deleteRow(row);
    });

    return ContentService.createTextOutput(JSON.stringify({ 
      result: 'success',
      deletedCount: rowsToDelete.length
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: 'error', 
      error: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {

  const action = e.parameter.action;
    
  if (action === 'getProjectById') {
      return getProjectById(e);
  }
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: 'Sheet not found!' }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) { // Only header present, no data
        return ContentService.createTextOutput(JSON.stringify({ result: 'success', data: [] }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const records = data.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || "";
        });
        return obj;
    });

    return ContentService.createTextOutput(JSON.stringify({ result: 'success', data: records }))
        .setMimeType(ContentService.MimeType.JSON);
}