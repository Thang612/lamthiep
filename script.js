// Data containing image paths and coordinates for text/QR placement
const data = [{
    "name": "Blanca",
    // Using a placeholder image for demo purposes. In a real application, you would host your 'thiep.jpg'.
    "image": "./thiep.jpg",
    // Adjust these coordinates (X, Y) to precisely position the Name
    // X (first number): moves text left/right. Increase to move right.
    // Y (second number): moves text up/down. Increase to move down.
    "locationName": [360, 200], // Current values. Try adjusting, e.g., [150, 160]
    // Adjust these coordinates (X, Y) to precisely position the Date
    "locationDate": [360, 450], // Current values. Try adjusting, e.g., [270, 370]
    // Adjust these coordinates (X, Y) to precisely position the QR code
    "locationQR": [570, 150]   // Current values. Try adjusting, e.g., [400, 120]
}, 
{
    "name": "Fiato",
    // Using a placeholder image for demo purposes. In a real application, you would host your 'thiep.jpg'.
    "image": "./thiep.jpg",
    // Adjust these coordinates (X, Y) to precisely position the Name
    // X (first number): moves text left/right. Increase to move right.
    // Y (second number): moves text up/down. Increase to move down.
    "locationName": [360, 200], // Current values. Try adjusting, e.g., [150, 160]
    // Adjust these coordinates (X, Y) to precisely position the Date
    "locationDate": [360, 450], // Current values. Try adjusting, e.g., [270, 370]
    // Adjust these coordinates (X, Y) to precisely position the QR code
    "locationQR": [570, 150]   // Current values. Try adjusting, e.g., [400, 120]
}];

// Helper to load image as Image object
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Required for loading images from different origins onto canvas
        img.onload = () => resolve(img);
        img.onerror = (e) => {
            console.error("Error loading image:", src, e);
            reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
    });
}

/**
 * Main function to generate the invitation image on a canvas.
 * @param {string} name - The name to display on the invitation.
 * @param {string} date - The date/time to display on the invitation.
 * @param {string} qrUrl - The URL of the QR code image.
 * @returns {Promise<string>} A Promise that resolves with the data URL of the generated image.
 */
async function generateInvitation(name, date, qrUrl) {
    try {
        // Step 1: Load background image and QR image concurrently
        const [bgImg, qrImg] = await Promise.all([
            loadImage(data.image),
            loadImage(qrUrl)
        ]);

        // Create a new offscreen canvas for drawing
        const canvas = document.createElement('canvas');
        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        const ctx = canvas.getContext('2d');

        // Draw background image first
        ctx.drawImage(bgImg, 0, 0);

        // Step 2: Write name on the canvas
        // Customize font, size, and color as needed for your invitation design
        ctx.font = "bold 36px 'Oswald', sans-serif";
        ctx.fillStyle = "white"; // Dark gray color
        ctx.textAlign = "center";
        ctx.fillText(name, data.locationName[0], data.locationName[1]);

        // Step 3: Write date on the canvas
        // Customize font, size, and color for date
        ctx.font = "28px 'Oswald', sans-serif";
        ctx.fillStyle = "white"; // Slightly lighter gray
        ctx.textAlign = "center";
        ctx.fillText(date, data.locationDate[0], data.locationDate[1]);

        // Step 4: Draw QR image on the canvas
        // Adjust QR code size as necessary (e.g., 100x100 pixels)
        const qrSize = 100; // Larger QR code for better scanning
        ctx.drawImage(qrImg, data.locationQR[0], data.locationQR[1], qrSize, qrSize);

        // Return the data URL of the generated image
        return canvas.toDataURL("image/png");
    } catch (error) {
        console.error("Error generating invitation:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * Custom alert function to replace window.alert
 * @param {string} message - The message to display in the alert.
 */
function showAlert(message) {
    const modal = document.getElementById('custom-alert-modal');
    const msgElement = document.getElementById('custom-alert-message');
    const okButton = document.getElementById('custom-alert-ok-button');

    msgElement.textContent = message;
    modal.classList.remove('hidden');

    okButton.onclick = () => {
        modal.classList.add('hidden');
    };
}


/**
 * Handles the generation process when the button is clicked.
 * Fetches input values, generates QR, then generates the invitation image,
 * and finally displays it or handles errors.
 */
async function handleGenerate() {
    const nameInput = document.getElementById('name');
    const timeInput = document.getElementById('invitation-time');
    const eventInput = document.getElementById('event-name');
    const phoneInput = document.getElementById('phone');

    const name = nameInput.value.trim();
    const date = timeInput.value.trim();
    const eventName = eventInput.value.trim();
    const phoneNumber = phoneInput.value.trim();

    const resultImg = document.getElementById('result-img');
    const loadingMessage = document.getElementById('loading-message');
    const noImageMessage = document.getElementById('no-image-message');
    const downloadLink = document.getElementById('download-link');

    // Simple validation
    if (!name || !date || !eventName) {
        showAlert("Please fill in your Full Name, Invitation Time, and Event Name.");
        return;
    }

    // Show loading message and hide previous image/message
    loadingMessage.classList.remove('hidden');
    resultImg.style.display = 'none';
    noImageMessage.classList.add('hidden');
    downloadLink.classList.add('hidden');

    try {
        // Generate QR code value with all relevant details
        let qrValue = `Event: ${eventName}\nName: ${name}\nTime: ${date}`;
        if (phoneNumber) {
            qrValue += `\nPhone: ${phoneNumber}`;
        }

        // QR Code API URL - using a reliable public API
        // Ensure data is URL-encoded for safety
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`;

        // Generate the invitation image
        const invitationDataUrl = await generateInvitation(name, date, qrApiUrl);

        // Display the generated image
        resultImg.src = invitationDataUrl;
        resultImg.style.display = 'block'; // Show the image
        downloadLink.href = invitationDataUrl; // Set download link
        downloadLink.classList.remove('hidden'); // Show download button

    } catch (error) {
        console.error("Failed to generate invitation:", error);
        // Display an error message to the user
        noImageMessage.textContent = "Failed to generate invitation. Please try again.";
        noImageMessage.classList.remove('hidden');
        resultImg.style.display = 'none';
        downloadLink.classList.add('hidden'); // Hide download button on error
    } finally {
        loadingMessage.classList.add('hidden'); // Hide loading message
    }

    submitForm({nameData: name, phoneData: phoneNumber, dateData: date, eventData: eventName})
}

// Attach event listener to the generate button
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-btn');
    if (generateButton) {
        generateButton.addEventListener('click', handleGenerate);
    }

    
});

async function submitForm(data) {
    const formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSfoBpgOoVO5bG1EAHE6-0M9RefhsbDSOhdk0NaYi429UrvWcQ/formResponse';
    const fieldName = 'entry.844983067';
    const fieldPhone = 'entry.1984090650';
    const fieldDate = 'entry.789738226';
    const fieldEvent = 'entry.1780825786';
    const formData = new FormData();

    formData.append(fieldName, data.nameData);
    formData.append(fieldPhone, data.phoneData);
    formData.append(fieldDate, data.dateData);
    formData.append(fieldEvent, data.eventData);

    await fetch(formURL, {
        method: 'POST',
        body: formData,
    });
}