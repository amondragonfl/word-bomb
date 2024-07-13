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
        return data.exists;
    } catch (error) {
        console.error('Error checking the word:', error);
    }
}

const input = document.getElementsByClassName("word-input")[0];

function startGame() {
    fetchRandomLetters()

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const word = input.value.trim();
            if (word && word.toUpperCase().includes(document.getElementsByClassName('letter-seq')[0].innerText)) {
                checkIfWordExists(word).then(exists => {
                    if (exists) {
                        fetchRandomLetters()
                        input.value = ''; // Clear input after submission
                    }
                })
            }
        }
    });
}

const button = document.querySelector('.play-but');
button.addEventListener('click', () => {
    button.disabled = true;
    startGame();
    button.blur(); // Remove focus
});