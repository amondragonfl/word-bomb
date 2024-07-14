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
const message = document.getElementsByClassName('message')[0];
input.disabled = true;

function playShakeAnim()
{
    input.classList.add('shake');
    setTimeout(() => {
        input.classList.remove('shake');
    }, 150);
}

function playPulseAnim()
{
    input.classList.add('pulse');
    setTimeout(() => {
        input.classList.remove('pulse');
    }, 800);
}


function handleInput(event) // Handle enter key press to sumbit word 
{
    if (event.key === 'Enter') {
        const word = input.value.trim();
        if (word && word.length>2 && word.toUpperCase().includes(document.getElementsByClassName('letter-seq')[0].innerText)) {
            checkIfWordExists(word).then(exists => {
                if (exists) {
                    playPulseAnim()
                    fetchRandomLetters()
                    input.value = '';
                    message.innerText = "..."
                    countdown.style.setProperty("--width", 100)
                } 
                else
                {
                    playShakeAnim();
                    message.innerText = "Word not found";
                }
            })
        } else { 
            if (word.length <= 2) 
                { message.innerText = "Word must be at least 3 characters";}
            else { message.innerText = "Word must contain" + " " + document.getElementsByClassName('letter-seq')[0].innerText;}

            playShakeAnim(); 
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
                countdown.style.setProperty("--width", width - 0.1)
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
    button.focus();
    input.value = '';
    message.innerText = "Press play to start";
}

button.addEventListener('click', () => {
    button.disabled = true;
    input.disabled = false;
    button.blur();
    input.focus();
    message.innerText = "...";
    startGame();
});