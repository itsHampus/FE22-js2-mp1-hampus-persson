// Visa inte dessa containers förens spelet börjar
document.getElementById('imgGridContainer').style.display = 'none';
document.getElementById('gridContainer').style.display = 'none';
document.getElementById('startOverContainer').style.display = 'none';

printHSToBody(false);
document.getElementById('usernameContainer').addEventListener('submit', startTheGame);
function startTheGame(event) {
    event.preventDefault();
    let playerScore = 0;
    let computerScore = 0;
    let username = document.getElementById('username');
    const getUsername = document.getElementById('usernameInput');
    username.innerText = `Användarnamn: ${getUsername.value}`;
    // Ta bort formuläret och visa bilderna användaren ska interagera med 
    document.getElementById('usernameContainer').remove();
    document.getElementById('imgGridContainer').style.display = 'grid';

    //Element som ska innehålla spelarens och datorns val
    let printPlayerChoice = document.getElementById('userChoice');
    let printComputerChoice = document.getElementById('computerChoice');
    let whoWon = document.getElementById('whoWon');

    // När användaren klickar på en bild jämför denne mot datorns val
    imgContainer.addEventListener('click', compareResult);
    function compareResult(event) {
        document.getElementById('gridContainer').style.display = 'grid';
        let playerChoice = event.target.id;
        // Datorn gör sitt val
        let computerChoiceRandom = Math.floor(Math.random() * 3);
        let computerChoice = '';
        if (computerChoiceRandom == 0) {
            computerChoice = rock.id;
        }
        else if (computerChoiceRandom == 1) {
            computerChoice = paper.id;
        }
        else if (computerChoiceRandom == 2) {
            computerChoice = scissor.id;
        }

        /* Jämför playerChoice med computerChoice för att se vem som vann/förlora.
        Om det blir lika eller om spelaren vinner så fortsätter spelet */
        if (playerChoice == rock.id && computerChoice == scissor.id || playerChoice == paper.id && computerChoice == rock.id || playerChoice == scissor.id && computerChoice == paper.id) {
            playerScore++;
            whoWon.innerText = 'Du vann och får en poäng!';
            printChoices();
        }
        // Om datorn vinner avslutas spelet, bilderna och dess container tas bort, Spelaren får möjligheten att börja om. 
        else if (playerChoice == rock.id && computerChoice == paper.id || playerChoice == paper.id && computerChoice == scissor.id || playerChoice == scissor.id && computerChoice == rock.id) {
            computerScore++;
            whoWon.innerText = 'Datorn vann och får en poäng';
            printChoices();
            imgGridContainer.remove();
            restart();
        }
        else if (playerChoice == computerChoice) {
            whoWon.innerText = 'Det blev lika, ingen får poäng';
            printChoices();
        }
        function printChoices() {
            printPlayerChoice.innerText = `Du valde ${playerChoice}`;
            printComputerChoice.innerText = `Datorn valde ${computerChoice}`;
        }
        document.getElementById('playerScoreText').innerText = `Din poäng ${playerScore}`;
        document.getElementById('computerScoreText').innerText = `Datorns poäng ${computerScore}`;
    }
    // Gör så att användaren kan starta om spelet när den förlorat
    function restart() {
        // Skapa ett spelarobjekt som ska användas för att jämföra användarens poäng mot HS-listan
        const playerScoreObj = {
            name: getUsername.value,
            score: playerScore
        }
        getHighscore(playerScoreObj);

        document.getElementById('endResult').innerText = `Slutresultat: ${playerScore}`;
        document.getElementById('startOverContainer').style.display = 'flex';
        document.getElementById('startOverBtn').addEventListener('click', () => {
            location.reload();
        })
    }
}
// Hämtar HS-listan från databasen varefter funktionen compareToHigscore anropas, HS och spelarObjektet skickas med som parametrar
async function getHighscore(incomingPlayerScoreObj) {
    const url = `https://mp1-ssp-highscore-default-rtdb.europe-west1.firebasedatabase.app/scores.json`;
    const response = await fetch(url);
    const hs = await response.json();
    compareToHighscore(hs, incomingPlayerScoreObj);
}
// Jämför användarens poäng mot HS-listan
async function compareToHighscore(incomingHS, incomingPlayerScoreObj) {
    const highscoreArray = Object.values(incomingHS);
    // Kollar om användarens poäng är större än något av poängen i HS, returnerar indexet i arrayen som användarens poäng ska hamna på
    const index = highscoreArray.findIndex(checkHS);
    function checkHS(hsObj) {
        console.log(hsObj);
        return hsObj.score < incomingPlayerScoreObj.score
    }
    // Är index negativt så är användarens poäng för dålig för att hamna på HS
    if (index >= 0) {
        // Lägg till användarens poäng på rätt plats i arrayen
        highscoreArray.splice(index, 0, incomingPlayerScoreObj);
        // Ta bort det sista objektet i arrayen så den inte blir för lång
        let garbage = highscoreArray.pop();
        for (let i = 0; i < highscoreArray.length; i++) {
            await put(i, highscoreArray[i]);
        }
    }
    printHSToBody(true);
}
// Stoppa in alla highscores (ett för ett) i databasen 
async function put(index, incomingPlayerScoreObj) {
    const url = `https://mp1-ssp-highscore-default-rtdb.europe-west1.firebasedatabase.app/scores/${index}.json`;

    const init = {
        method: 'PUT',
        body: JSON.stringify(incomingPlayerScoreObj),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    }
    const response = await fetch(url, init);
    const data = await response.json();
    // console.log(data);
}
// Skriv HS-listan till body. Funktionen har en boolean som parameter och när den är true tömms HS-listan som finns i bodyn så det gamla resultatet tas bort innan det nya läggs till.
async function printHSToBody(emptyList) {
    if (emptyList == true) { document.getElementById('lista').innerHTML = '' }
    const url = 'https://mp1-ssp-highscore-default-rtdb.europe-west1.firebasedatabase.app/scores.json';
    const response = await fetch(url);
    const hsArrayObj = await response.json();
   
    hsArrayObj.forEach(element => {
        const nameAndScore = document.createElement('li');
        nameAndScore.innerText = `${element.name} ${element.score}`;
        document.getElementById('lista').append(nameAndScore);
    })
}