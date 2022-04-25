var points_human = 0;
var points_ai = 0;
var total_points = 0;
var board;
var currentPlayer;
var startingPlayer;
var moveCount;
var totalMoveCombos = 0;
var firstScore;
var move_score;
var sum;

function startGame() {   
    startingPlayer = currentPlayer = playerSelection();
    drawBoard();
    if(startingPlayer == "ai") {
        let tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.removeEventListener("click",makeMoveHuman);
        })
        setTimeout(function(){makeMoveAI(board);}, 1000);
    }
}

function alphaBeta(state, move, maximizing, points, alpha, beta){ //atgriež [vērtība, [1st aizstātais, 2nd aizstātais]]
    var temp_state = state.slice()
    //ja sasniegta pēdējā virsotne
    if(checkEnd(temp_state) == true){
        //ja dators sāk un saņem 8 punktus
        if(points >= 8 && startingPlayer == "ai"){
            return [1, move];
        }
        //ja dators ir otrais un netiek saņemti 8 punkti
        else if(points < 8 && startingPlayer != "ai"){
            return [1, move];
        //pretējā gadījumā virsotnei piešķir -1
        }else{
            return [-1, move];
        }
    }
    //Ja gājiens atrodas maksimizētāja līmenī, tad apskatam visus šīs virsotnes bērnus
    if(maximizing){
        var bestValue = -Infinity;
        var bestMove = null;
        var nextStates=[], nextMoves=[], nextPoints=[];
        var arrayAndPointsAndMoves = getArrayAndPointsAndMoves(temp_state);
        nextStates = arrayAndPointsAndMoves[0].slice();
        nextPoints = arrayAndPointsAndMoves[1].slice();
        nextMoves = arrayAndPointsAndMoves[2].slice();
        //Pa vienam apskata katru bērnu
        for(let i=0; i < nextStates.length; i++){
            var valueAndMove = alphaBeta(nextStates[i], nextMoves[i], false, points+nextPoints[i], alpha, beta);
            bestValue = Math.max(bestValue, valueAndMove[0]);
            alpha = Math.max(alpha, bestValue);
            //beta nogriešana
            if(beta<=alpha)
                break;
            if(valueAndMove[0] == bestValue){
                bestMove = nextMoves[i];
            }
        }
        //bērns atgriež vecākam savu vērtību
        return [bestValue, bestMove]
    }
    //Ja gājiens atrodas minimizētāja līmenī, tad apskatam visus šīs virsotnes bērnus
    else{
        var bestValue = Infinity;
        var bestMove = null;
        var nextStates=[], nextMoves=[], nextPoints=[];
        var arrayAndPointsAndMoves = getArrayAndPointsAndMoves(temp_state);
        nextStates = arrayAndPointsAndMoves[0].slice();
        nextPoints = arrayAndPointsAndMoves[1].slice();
        nextMoves = arrayAndPointsAndMoves[2].slice();
        //Pa vienam apskata katru bērnu
        for(let i=0; i < nextStates.length; i++){
            var valueAndMove = alphaBeta(nextStates[i], nextMoves[i], true, points+nextPoints[i], alpha, beta);
            bestValue = Math.min(bestValue, valueAndMove[0]);
            beta = Math.min(beta,bestValue);
            //alfa nogriešana
            if(beta <= alpha)
                break;
            if(valueAndMove[0] == bestValue){
                bestMove = nextMoves[i];
            }
        }
        //bērns atgriež vecākam savu vērtību
        return [bestValue, bestMove];
    }
}

function makeMoveHuman() {
    let move = parseInt(this.id);
    move_score = parseInt(this.innerHTML);
    moveCount++;
    //pirmais peles klikšķis
    if(moveCount%2 == 1) {
        firstScore = move_score;
        board[move] = 0;
        document.getElementById(move).remove();
    }
    //otrais peles klikšķis
    if(moveCount%2 == 0) {
        sum = firstScore + move_score;
        let replace = replacableNumber(sum);
        playerTotalPoints(sum);
        document.getElementById(move).innerHTML = replace;
        document.getElementById("moveMathHuman").innerHTML = "Cilvēka pēdējais gājiens ir: " + firstScore + " + " + move_score + " = " + sum + " ! Aizvietotā vērtība ir: " + replace;
        board[move] = replace;
        let tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.removeEventListener("click",makeMoveHuman);
        })
        if(checkEnd(board) == true) {
            returnWinner();
            return;
        }   
        setTimeout(function(){makeMoveAI(board);}, 2000);
    }       
}

function makeMoveAI(boardToCheck){
    selection = alphaBeta(boardToCheck, [], true, total_points, -Infinity, +Infinity);
    let firstSelect = selection[1][0];
    let secondSelect = selection[1][1];
    let move = 0;
    sum = 0;
    //pirmā skaitļa izvēle
    move = parseInt(document.getElementById(firstSelect).id);
    firstScore = parseInt(document.getElementById(move).textContent);
    board[move] = 0;
    document.getElementById(move).remove();

    //otrā skaitļa izvēle
    move = parseInt(document.getElementById(secondSelect).id);
    let secondScore = parseInt(document.getElementById(move).textContent);
    sum = firstScore + secondScore;
    let replace = replacableNumber(sum);
    playerTotalPoints(sum);
    document.getElementById(move).innerHTML = replace;
    document.getElementById("moveMathAI").innerHTML = "Datora pēdējais gājiens ir: " + firstScore + " + " + move_score + " = " + sum + " ! Aizvietotā vērtība ir: " + replace;
    board[move] = replace;
    let tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.addEventListener("click",makeMoveHuman);
    })   
    if(checkEnd(board) == true) {
        returnWinner();
        return;
    }  
}

function playerTotalPoints(sum) {
    if(sum>5)
        total_points += 5;
    else if(sum<5)
        total_points -= 5;
    else
        total_points += 3;
    document.getElementById("player_points").innerHTML = "Abu spēlētāju kopējais punktu skaits: " + total_points;
}

function replacableNumber(sum) {
    if(sum>5)
        return 1;
    else if(sum < 5)
        return 3;
    else
        return 2;
}

function getMoves(){
    moves = [];
    var children = document.getElementById("gameBoard").children;
    for(let i = 0; i < children.length; i++) {
        var child = children[i];
            moves.push(child);
    }
    return moves;
}

function getArrayAndPointsAndMoves(array){
    var theArray = []
    var points = []
    var moves = []
    for(let k = 0; k<array.length-1; k++){
        for(let j = array.length-1; j>k; j--){
            let temporary_array = array.slice();
            if(temporary_array[k] != 0 && temporary_array[j] !=0){
                sum = temporary_array[k] + temporary_array[j];
                temporary_array[k] = replacableNumber(sum);
                temporary_array[j] = 0;
                theArray.push(temporary_array);
                points.push(getPoints(sum));
                moves.push([k,j])
            }
        }
    }
    return [theArray, points, moves];
}

function getPoints(sum) {
    points = 0
    if(sum>5)
        points += 5;
    else if(sum<5)
        points -= 5;
    else
        points += 3;
    return points;
}

function drawBoard() {
    total_points = 0;
    firstScore = 0;
    move_score = 0;
    sum = 0;
    moveCount = 0;
    document.getElementById("moveMathHuman").innerHTML = "";
    document.getElementById("moveMathAI").innerHTML = "";
    document.getElementById("player_points").innerHTML = "";
    document.getElementById("winner").innerHTML = "";
    //randomBoard();
    board = [1,2,4,4,2,1];
    for(let n = 0; n < board.length; n++) {
        let tile = document.createElement("div");
        tile.textContent = board[n];
        tile.id = n.toString();
        tile.classList.add("tile");
        tile.addEventListener("click",makeMoveHuman);
        document.getElementById("gameBoard").append(tile);
    }
}
// --- FUNCTION IF EVER NEEDED ---
// function randomBoard() {
//     board = [];
//     for(let i = 0; i < 6; i++) {
//         board[i] = Math.floor(Math.random() * 5 + 1);
//     }
// }

function checkEnd(passedBoard) {
    var countOfNumbers = 0;
    for(let i = 0; i < passedBoard.length; i++) {
        if(passedBoard[i] > 0) {
            countOfNumbers++;
        }
    }
    if(countOfNumbers == 1) {
        return true;
    }else{
        return false
    }
}

function returnWinner(){
    if(startingPlayer == "human") {
        if(total_points>8) {
            add_score("human");
            document.getElementById("winner").innerHTML = "Uzvarētājs ir cilvēks!";
        }
        else {
            add_score("ai");
            document.getElementById("winner").innerHTML = "Uzvarētājs ir Mākslīgais Intelekts!";
        }
    } else {
        if(total_points>8) {
            add_score("ai");
            document.getElementById("winner").innerHTML = "Uzvarētājs ir Mākslīgais Intelekts!";
        }
        else {
            add_score("human");
            document.getElementById("winner").innerHTML = "Uzvarētājs ir cilvēks!";
        }
    }
    setTimeout(retryGame,500);
}

function playerSelection() {
    //Mainam pogas izskatu uz sarkanu un nepieejamu
    var poga = document.getElementById('poga');
    poga.innerHTML = "Spēle ir progresā...";
    poga.style.backgroundColor = "red";
    poga.style.color = "white";
    poga.disabled = true;

    //Atsledzam iespēju izvēlēties sākuma spēlētāju
    var select_menu = document.getElementById('izvele') 
    document.getElementById('playerSelectionMenu').style.display='none';
    
    //Atgriežam vai spēli uzsāk (MI vai cilvēks)
    return select_menu.options[select_menu.selectedIndex].value;
}

function retryGame() {
    var poga = document.getElementById('poga');
    poga.innerHTML = "Mēģināt vēlreiz?";
    poga.style.backgroundColor = "orange";
    poga.disabled = false;
    document.getElementById('playerSelectionMenu').style.display='block';
    //Notīram laukumu
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.remove();
    })
}

function add_score(player) {
    if(player=="human") {
        points_human += 1;
        document.getElementById('scoreboard_points_human').innerHTML = points_human;
    } else {
        points_ai += 1;
        document.getElementById('scoreboard_points_ai').innerHTML = points_ai;
    }
}