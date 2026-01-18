
const API_KEY = "AIzaSyAJS_HtF5Qn8jaGpLsuKpKL7oFNpZRF6zc";

async function testKey() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                })
            }
        );
        const data = await response.json();
        console.log("Text Test Status:", response.status);
        console.log("Text Test Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Text Test Error:", e);
    }
}

testKey();
