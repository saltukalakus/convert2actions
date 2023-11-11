document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM content loaded!');
    const inputScreen = document.getElementById('inputScreen');
    const outputScreen = document.getElementById('outputScreen');
    const codeInput = document.getElementById('codeInput');
    const convertedCode = document.getElementById('convertedCode');
    const convertButton = document.getElementById('convertButton');

    convertButton.addEventListener('click', function () {
        const code = codeInput.value;

        // Assume you have an API endpoint for code conversion on the backend
        // Replace 'http://localhost:3000/convert' with your actual backend endpoint
        const backendEndpoint = 'http://localhost:3000/convert';

        // Make a POST request to the backend
        fetch(backendEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);

            // Display the converted code on the output screen
            convertedCode.textContent = data.convertedCode;
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle errors
        });
    });
});

// Function to go back to the input screen
function goBack() {
    document.getElementById('inputScreen').style.display = 'block';
    document.getElementById('outputScreen').style.display = 'none';
}
