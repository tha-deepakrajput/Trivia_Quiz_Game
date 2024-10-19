// API URL
const URL = "https://the-trivia-api.com/v2/questions";

let first_player = document.querySelector('#first_player');   // first player
let second_player = document.querySelector('#second_player');   // second player
let curr_player;

let first_player_input = document.getElementById('first_player');     
let second_player_input = document.getElementById('second_player');   
let start_button = document.getElementById('start_btn');   // first button 
let start_game_button = document.getElementById('start_game');   // second button 
let first_page = document.getElementById('first_page');     // first page
let input_page = document.getElementById('second_page');   // second page 

// array to store the categories 
let category = []; 

// start button of the starting page 
start_button.addEventListener('click', () => {
    document.body.innerHTML = '';
    document.body.append(input_page);
    input_page.style.display = 'block';
})

// start game button of the second page 
start_game_button.addEventListener('click', () => {
    first_player = first_player_input.value;
    second_player = second_player_input.value;
    curr_player = first_player_input.value;
    console.log(curr_player);
    if (first_player && second_player) {
        fetchCategories();
    }
    else {
        alert('Enter both player names')
    }
});

// async function to fetch categories from the API 
async function fetchCategories() {
    response = await fetch('https://the-trivia-api.com/v2/categories')
    data = await response.json();
    showCategory(data);
}

let used_categories = [];  // Array to store used categories

// function that will display the categories 
function showCategory(data) {
    document.body.innerHTML = '';
    category = []; 
    let div = document.createElement('div');        // Create a div
    div.classList.add('third_page');                // Add a class = third_page to div
    let h1 = document.createElement('h1');          // Create an h1
    h1.textContent = 'SELECT THE CATEGORY';         // Add text to h1
    div.append(h1);                                 // Append h1 to the div
    document.body.append(div);                      // Append div to the body

    // Loop through each category in the data
    for(let current_category in data) {
        // This will skip if the category is in the used_categories array
        if (!(used_categories.includes(current_category))) {
            category.push(current_category);
            
            let cat_btn = document.createElement('button');
            cat_btn.classList.add('cat_list');
            cat_btn.textContent = current_category;
            div.append(cat_btn);

            cat_btn.addEventListener('click', () => {
                used_categories.push(current_category);  // Add selected category to used categories
                fetchQuestions(current_category);        // Fetch questions for the selected category
            });
        }
    }
    if (category.length === 0)  {
        alert('All categories are used. We are going to announce the winner...');
        end_game();
    }
}

// fetching questions 
async function fetchQuestions(categoryName) {
    document.body.innerHTML = '';
    let div1 = document.createElement('div');
    div1.classList.add('question_page');
    div1.textContent = 'questions';

    const response = await fetch(`${URL}?categories=${categoryName}&difficulty=easy,medium,hard&limit=100`);
    const data = await response.json();

    // filter the difficulty level questions 
    let easy_ques = data.filter(ques => ques.difficulty === 'easy');
    let medium_ques = data.filter(ques => ques.difficulty === 'medium');
    let hard_ques = data.filter(ques => ques.difficulty === 'hard');

    easy_ques = easy_ques.slice(0, 2);
    medium_ques = medium_ques.slice(0,2);
    hard_ques = hard_ques.slice(0, 2);

    const allQuestionsDifficulties = [...easy_ques, ...medium_ques, ...hard_ques];      

    showQuestions(allQuestionsDifficulties);
};

let curr_index = 0;         //current index
let scores = {
    first_player: 0,
    second_player: 0
};
// show questions function
function showQuestions(allQuestionsDifficulties) {
    display_ques(allQuestionsDifficulties[curr_index]);

    async function display_ques(ques) {        
        document.body.innerHTML = '';
        let div2 = document.createElement('div');
        div2.classList.add('display_questions');
        div2.innerHTML = `<p><b>${curr_player}'s turn</b> <br> The Question is : ${ques.question.text}</p>`;
        document.body.append(div2);

        await display_options(ques);
        display_score();        // display the scores.
    }

    // function that will display the options 
    async function display_options(ques) {
        let ul = document.createElement('ul');
    
        // combined correct and incorrect answer in the array 
        let all_answers = [ques.correctAnswer, ...ques.incorrectAnswers];
    
        // we are using sort to suffle the array 
        all_answers.sort(() => Math.random() - 0.5);
    
        all_answers.forEach(answer => {
            let li = document.createElement('li');
            li.textContent = answer;
            ul.append(li);
    
            li.addEventListener('click', () => {
                check_ans(answer, ques.correctAnswer);
            });
        });
        
        document.body.append(ul);

    }

    // function to check the right answer. This will tell the chosen answer is the right answer or not. 
    function check_ans(chosen_ans, right_ans) {

        if (chosen_ans === right_ans) {
            if (curr_player === first_player) {
                scores.first_player += score_update(curr_index);
            } else {
                scores.second_player += score_update(curr_index);
            }
        } else {
            alert(`Your answer is Incorrect!\n The right answer is ${right_ans.toUpperCase()}`);
        }

        curr_index += 1;
        curr_player = curr_player === first_player ? second_player : first_player;      // used turnery operator.

        if (curr_index < allQuestionsDifficulties.length) {
            display_ques(allQuestionsDifficulties[curr_index]); // Pass the next question 
        } else {
            document.body.innerHTML = '<button class="play_again">Play again</button> <button class="quit_game">Quit</button>';
            document.querySelector('.play_again').addEventListener('click', () => {
                resetIndex();
                fetchCategories();
            });
            document.querySelector('.quit_game').addEventListener('click', () => {
                end_game();
            });
            display_score()     // display the score.
        }
    }
}

// function to display the score 
function display_score() {
    let firstPlayerScore = document.createElement('h2');
    let secondPlayerScore = document.createElement('h2');
    firstPlayerScore.textContent = `Score of ${first_player} is ${scores.first_player}`;
    secondPlayerScore.textContent = `Score of ${second_player} is ${scores.second_player}`;

    document.body.append(firstPlayerScore);
    document.body.append(secondPlayerScore);
}
// function to update the score 
function score_update(index) {
    if (index < 2) {
        return 10;
    }
    else if(index < 4) {
        return 15;
    }
    else {
        return 20;
    }
}

// function to reset the index 
function resetIndex() {
    curr_index = 0;        // Reset the current index
}

// function to end the game 
function end_game() {
    document.body.innerHTML = '';
    let end_container = document.createElement('div');
    end_container.classList.add('end_container');
    let first_h2 = document.createElement('h2');
    let second_h2 = document.createElement('h2');
    // Create a button to go on the Home page
    let startNewGame = document.createElement('button');

    if (scores.first_player > scores.second_player) {
        first_h2.textContent = `${first_player} won the game | Score : ${scores.first_player}`;
        second_h2.textContent = `${second_player} lose the game | Score : ${scores.second_player}`;
    }
    else if (scores.first_player < scores.second_player) {
        first_h2.textContent = `${second_player} won the game | Score : ${scores.second_player}`;
        second_h2.textContent = `${first_player} lose the game | Score : ${scores.first_player}`;
    }
    else {
        first_h2.textContent = `The Game is Tie.`;
    }

    startNewGame.textContent = 'Go To Welcome Page';
    startNewGame.classList.add('starNew_game');
    startNewGame.addEventListener('click', () => {
        resetIndex();
        welcomePage();
    });
    end_container.append(first_h2);
    end_container.append(second_h2);
    end_container.append(startNewGame);
    document.body.append(end_container);
}

// function to reload the page 
function welcomePage() {
    location.reload();
}