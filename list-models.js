
const API_KEY = "AIzaSyAJS_HtF5Qn8jaGpLsuKpKL7oFNpZRF6zc";

async function listModels() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        const data = await response.json();
        console.log("Models:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
