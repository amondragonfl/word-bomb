let intervalId;

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
        throw new Error('Server error');
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
        throw new Error('Server error');
    }
}

let gameRunning = false;
const input = document.getElementsByClassName("word-input")[0];
const button = document.querySelector('.play-but');
const countdown = document.getElementsByClassName("countdown-bar")[0];
const computedStyleCountdown = getComputedStyle(countdown)
const message = document.getElementsByClassName('message')[0];
const score_text = document.getElementsByClassName('score')[0];
const wordCountText = document.getElementsByClassName('words')[0];
const skipsText = document.getElementsByClassName('skips')[0];
const correctSound = new Audio('assets/correct_sound.wav');
const incorrectSound = new Audio('assets/incorrect_sound.wav');
const clickSound = new Audio('assets/click_sound.wav');
const lostSound = new Audio('assets/lost_sound.wav');
const clockTickSound = new Audio('assets/clocktick_sound.wav');
const backgroundMusic = new Audio('assets/background_music.mp3');
backgroundMusic.loop = true;
clockTickSound.loop = true;

const skipButton = document.getElementById("skip-button");
skipButton.addEventListener('click', function() {
    skipButton.blur();
    if (gameRunning && skips>0)
    {
        playSound(clickSound)
        skips -= 1;
        skipsText.innerText = "Skips: " + String(skips)
        const width = parseFloat(computedStyleCountdown.getPropertyValue("--width"))
        countdown.style.setProperty("--width", 100)
        fetchRandomLetters()
        input.focus();
    }
    else {playSound(incorrectSound)} 
});

const musicButton = document.getElementById("music-button");
musicButton.addEventListener('click', function(){
    musicButton.blur();
    playSound(clickSound)
    if (backgroundMusic.paused)
    {
        backgroundMusic.play();
        enableMusic = true;
    } else 
    {
        backgroundMusic.pause();
        enableMusic = false;
    }

})

const restartButton = document.getElementById("restart-button");
restartButton.addEventListener('click', function() {
    restartButton.blur();
    if (gameRunning)
    {
        playSound(clickSound)
        stopGame();
    }
    else {playSound(incorrectSound)} 
});



input.disabled = true;
let usedWords = [];
let score = 0;
let enableMusic = true;
let wordCount = 0;
let skips = 3;
let percentageSubtract = 0.1;

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

function playSound(sound) {
    // Reset the sound if it's already playing
    if (!sound.paused) {
        sound.pause();
        sound.currentTime = 0;
    }
    sound.play();
}


function handleInput(event) // Handle enter key press to sumbit word 
{
    if (event.key === 'Enter') {
        const word = input.value.trim();
        if (word && word.length>2 && word.toUpperCase().includes(document.getElementsByClassName('letter-seq')[0].innerText) && !usedWords.includes(word)) {
            checkIfWordExists(word).then(exists => {
                if (exists) {
                    playSound(correctSound)
                    usedWords.push(word);
                    score += 150 * word.length;
                    wordCount += 1;
                    score_text.innerText = "score: " + String(score)
                    wordCountText.innerText = "words: " + wordCount;
                    playPulseAnim()
                    fetchRandomLetters()
                    input.value = '';
                    message.innerText = "";
                    countdown.style.setProperty("--width", 100)
                } 
                else
                {
                    playShakeAnim();
                    playSound(incorrectSound)
                    message.innerText = "Word not found";
                }
            }).catch(error => {
                message.innerText = "Server Error";
            })
        } else { 
            if (word.length <= 2) 
                { message.innerText = "Word must be at least 3 characters";}
            else if (usedWords.includes(word)) 
                {message.innerText = "Word was already used"} 
            else { message.innerText = "Word must contain" + " " + document.getElementsByClassName('letter-seq')[0].innerText;}

            playShakeAnim(); 
            playSound(incorrectSound)
        } 
    }
}


function startGame() {
    gameRunning = true;
    clockTickSound.play();
    score = 0;
    wordCount = 0;
    skips = 3;
    usedWords = []
    percentageSubtract = 0.1;
    score_text.innerText = "score: " + String(score)
    wordCountText.innerText = "words: " + wordCount;
    input.addEventListener('keydown', handleInput);
    fetchRandomLetters()
    
    intervalId = setInterval(() => {
        const width = parseFloat(computedStyleCountdown.getPropertyValue("--width")) || 0
        if (width > 0)
        {
                countdown.style.setProperty("--width", width - percentageSubtract)
        }
        else
        {
            playSound(lostSound)
            stopGame()
        }
        if (wordCount > 15) {percentageSubtract = Math.min(wordCount/150.0, .65)}

    }, 5)
    
}

function stopGame()
{
    gameRunning = false;
    usedWords = []
    if (!clockTickSound.paused) {
        clockTickSound.pause();       
        clockTickSound.currentTime = 0; 
    }
    input.removeEventListener('keydown', handleInput);
    clearInterval(intervalId);
    input.disabled = true;
    countdown.style.setProperty("--width", 100)
    document.getElementsByClassName('letter-seq')[0].innerText = "word bomb";
    button.disabled = false;
    button.focus();
    input.value = '';
    message.innerText = "Game Over";
}

button.addEventListener('click', () => {
    if (enableMusic && backgroundMusic.paused) {  backgroundMusic.play() }
    playSound(clickSound)
    message.innerText = "starting...";
    button.disabled = true;
    fetch('http://127.0.0.1:5000/random-letters')
  .then(response => {
    if (!response.ok) {
        message.innerText = "Network respone not Ok"
        button.disabled = false;
        throw new Error('Network response was not ok ' + response.statusText);
    }
    else
    {
        input.disabled = false;
        input.focus();
        message.innerText = "";
        startGame(); 
    }
  })
  .catch(error => {
    button.disabled = false;
    message.innerText = "Unable to reach server";
    console.error('Failed to reach the server:', error);
  });
  button.blur();
});