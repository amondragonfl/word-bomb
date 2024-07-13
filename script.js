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
const button = document.querySelector('.play-but');
const countdown = document.getElementsByClassName("countdown-bar")[0];
const computedStyleCountdown = getComputedStyle(countdown)
input.disabled = true;

function handleInput(event) // Handle enter key press to sumbit word 
{
    if (event.key === 'Enter') {
        const word = input.value.trim();
        if (word && word.length>2 && word.toUpperCase().includes(document.getElementsByClassName('letter-seq')[0].innerText)) {
            checkIfWordExists(word).then(exists => {
                if (exists) {
                    fetchRandomLetters()
                    input.value = '';
                    countdown.style.setProperty("--width", 100)
                }
            })
        }
    }
}


function startGame() {
    input.addEventListener('keydown', handleInput);
    fetchRandomLetters()
    
    const intervalId = setInterval(() => {
        const width = parseFloat(computedStyleCountdown.getPropertyValue("--width")) || 0
        if (width > 0)
        {
                countdown.style.setProperty("--width", width - 0.9)
        }
        else
        {
            stopGame(intervalId)
        }
    }, 5)
    
}

function stopGame(interID)
{
    input.removeEventListener('keydown', handleInput);
    clearInterval(interID);
    input.disabled = true;
    countdown.style.setProperty("--width", 100)
    document.getElementsByClassName('letter-seq')[0].innerText = "Game Over";
    button.disabled = false;
}

button.addEventListener('click', () => {
    button.disabled = true;
    input.disabled = false;
    button.blur();
    input.focus();
    startGame();
});