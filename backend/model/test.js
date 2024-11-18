import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';


const BASE_URL = "https://leepath-model.el.r.appspot.com/";

async function uploadFile(filePath, desiredFilename) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("filename", desiredFilename);

    try {
        const response = await fetch(`${BASE_URL}upload`, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        console.log("Upload File Response:", result);
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

// Example Usage:
uploadFile("data.png", "testuser.png");

// Rename File
async function renameFile(oldName, newName) {
    const data = { old_name: oldName, new_name: newName };

    const response = await fetch(`${BASE_URL}rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("Rename File Response:", result);
}

// Download File
async function downloadFile(filename) {
    const data = { filename };

    const response = await fetch(`${BASE_URL}download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const contentDisposition = response.headers.get("Content-Disposition");
        let downloadFilename = filename;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match) downloadFilename = match[1];
        }

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        console.log(`File "${downloadFilename}" downloaded successfully.`);
    } else {
        const error = await response.json();
        console.error("Download File Error:", error);
    }
}

// Delete File
async function deleteFile(filename) {
    const params = new URLSearchParams({ filename });

    const response = await fetch(`${BASE_URL}delete?${params.toString()}`, {
        method: "DELETE",
    });

    const result = await response.json();
    console.log("Delete File Response:", result);
}

// Example Usage:

// Upload File (using a File object, e.g., from an <input type="file"> element)
document.getElementById("uploadButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length > 0) {
        await uploadFile(fileInput.files[0], "testuser.png");
    } else {
        console.log("No file selected.");
    }
});

// Rename File
renameFile("data.png", "image.png");

// Download File
downloadFile("image.png");

// Delete File
deleteFile("image.png");