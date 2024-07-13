async function fetchRandomLetters()
{
    try {
        const response = await fetch('http://127.0.0.1:5000/random-letters');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        document.getElementsByClassName('letter-seq')[0].innerText = data.letters;
    }  catch (error) {
        console.error('There was a problem fetching random letters:', error);
    }
}

async function checkIfWordExists(word) {
    try {
        const response = await fetch('http://127.0.0.1:5000/check-word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ word: word })
        });
        
        const data = await response.json();
    } catch (error) {
        console.error('Error checking the word:', error);
    }
}


checkIfWordExists('table');
fetchRandomLetters();