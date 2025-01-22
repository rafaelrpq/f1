
function setKey() {
    key = prompt("Insira sua chave de API do Google AI Studio: ");
    localStorage.setItem('apiKey', key);
    location.reload();
}

const apiKey = localStorage.getItem('apiKey') ?? setKey();
async function fazerConsulta(prompt) {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'; 
    const requestBody = {
        "contents": [{
            "parts":[{ text : "Explain how AI works" }]
        }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        
        // Extrair a resposta do modelo
        if(data && data.candidates && data.candidates.length > 0){
            const generatedText = data.candidates[0].content.parts[0].text;
            console.log("Resposta do modelo:", generatedText);
        } else {
          console.log("Nenhuma resposta encontrada no JSON.");
        }
        

    } catch (error) {
        console.error('Erro ao fazer a consulta:', error);
    }
}

// Exemplo de uso
const meuPrompt = 'Escreva um pequeno poema sobre o mar.';
fazerConsulta(meuPrompt);