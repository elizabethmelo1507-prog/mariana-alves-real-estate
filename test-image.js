
const API_KEY = "AIzaSyAJS_HtF5Qn8jaGpLsuKpKL7oFNpZRF6zc";

async function testImage() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    instances: [{ prompt: "A luxury house in Manaus" }],
                    parameters: { sampleCount: 1 }
                })
            }
        );
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

testImage();
