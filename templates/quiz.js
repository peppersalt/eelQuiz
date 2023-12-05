document.addEventListener('DOMContentLoaded', function() {

    var timeInSecs;
    var ticker;

    function startTimer(secs) {
        timeInSecs = parseInt(secs);
        ticker = setInterval(tick, 1000);
    }

    function tick() {
        var secs = timeInSecs;
        if (secs > 0) {
            timeInSecs--;
        } else {
            clearInterval(ticker);
            QuizUI.displayScore();
            return;
        }

        var days = Math.floor(secs/86400);
        secs %= 86400;
        var hours = Math.floor(secs/3600);
        secs %= 3600;
        var mins = Math.floor(secs/60);
        secs %= 60;
        var pretty = ( (days < 10 ) ? "0" : "" ) + days + ":" + ( (hours < 10 ) ? "0" : "" ) + hours + ":" + ( (mins < 10) ? "0" : "" ) + mins + ":" + ( (secs < 10) ? "0" : "" ) + secs;

        document.getElementById("countdown").innerHTML = pretty;

        if (timeInSecs == 0) { // Заменено secs на timeInSecs
            clearInterval(ticker);
            QuizUI.displayScore();
        }
    }

    startTimer(1*60);
//-----------------------------------------------------------------------------------------------------------
    function Quiz(questions) {
        this.totalScore = 0;
        this.scoresByType = {
            "1": 0,
            "2": 0,
            "3": 0
        };
        this.questions = questions.slice(0, 10);
        this.currentQuestionIndex = 0;
    }
    Quiz.prototype.guess = function(answer) {
        var currentQuestion = this.getCurrentQuestion();
        var questionType = currentQuestion.type;

        if (!this.scoresByType[questionType]) {
            this.scoresByType[questionType] = 0;
        }

        var maxScorePerType = 100; // Maximum score for each type of question

        if (currentQuestion.isCorrectAnswer(answer)) {
            this.scoresByType[questionType] += maxScorePerType / this.questions.filter(q => q.type === questionType).length;

            // Cap the score for each type at 100
            this.scoresByType[questionType] = Math.min(this.scoresByType[questionType], maxScorePerType);
        }

        localStorage.setItem("totalScore", this.totalScore);
        localStorage.setItem("scoresByType", JSON.stringify(this.scoresByType));

        if (!this.hasEnded()) {
            this.currentQuestionIndex++;
        }
    };


    Quiz.prototype.getCurrentQuestion = function() {
        return this.questions[this.currentQuestionIndex];
    };

    Quiz.prototype.hasEnded = function() {
        return this.currentQuestionIndex >= this.questions.length;
    };

    function Question(text, choices, answer,type) {
        this.text = text;
        this.choices = choices;
        this.answer = answer;
        this.type = type;
    }

    Question.prototype.isCorrectAnswer = function(choice) {
         return this.answer === choice;
    };


    var QuizUI = {
        quiz: null,  // Initialize the quiz object

        init: function(questions) {
            this.quiz = new Quiz(questions);
            this.displayNext();
        },

        displayNext: function () {
            if (this.quiz.hasEnded()) {
                this.displayScore();
            } else {
                // Log the type of the current question
                console.log("Type of Question:", this.quiz.getCurrentQuestion().type);
                this.displayQuestion();
                this.displayChoices();
                this.displayProgress(); // Add this line
            }
        },

        displayQuestion: function() {
            var element = document.getElementById("question");
            element.innerHTML = this.quiz.getCurrentQuestion().text;
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]); // Queue MathJax to typeset the content
        },

        displayChoices: function() {
            var choices = this.quiz.getCurrentQuestion().choices.split(',');

            for (var i = 0; i < choices.length; i++) {
                this.populateIdWithHTML("choice" + i, choices[i]);
                this.guessHandler("guess" + i, choices[i]);
            }

            MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.getElementById("choices")]);
        },

        populateIdWithHTML: function(id, content) {
            var element = document.getElementById(id);
            if (element) {
                element.innerHTML = content;
            }
        },

        displayProgress: function() {
            var element = document.getElementById("progress");
            element.innerHTML = "Вопрос " + (this.quiz.currentQuestionIndex + 1) + " из " + this.quiz.questions.length;
        },

        displayScore: function() {
            var gameOverHTML = "<h1>Тест окончен!</h1>";

            // After calculating and displaying the total score
            var totalScore = Object.values(this.quiz.scoresByType).reduce((total, score) => total + score, 0);
            totalScore /= Object.keys(this.quiz.scoresByType).length;
            totalScore = Math.round(totalScore * 100) / 100;

            // Add a call to send scores to the server and update people.xlsx
            this.sendScoresToServer(totalScore, this.quiz.scoresByType);
            gameOverHTML += "<h2 style='margin-top: 2.375em;'> Ваши общие баллы: " + totalScore + " баллов    (максимум 100 баллов)</h2>";

            // Display scores by type with styling
            var scoresByType = localStorage.getItem("scoresByType");
            if (scoresByType) {
                scoresByType = JSON.parse(scoresByType);
                for (var type in scoresByType) {
                    gameOverHTML += "<h3 style='color: #fff;'>"; // Red color for numbers
                    if (type === "1") {
                        gameOverHTML += "<span style='opacity: 0.7;'>Расширенные знания:</span> " + scoresByType[type].toFixed(2) + " баллов";
                    } else if (type === "2") {
                        gameOverHTML += "<span style='opacity: 0.7;'>Логика:</span> " + scoresByType[type].toFixed(2) + " баллов";
                    } else if (type === "3") {
                        gameOverHTML += "<span style='opacity: 0.7;'>Вычислительные способности:</span> " + scoresByType[type].toFixed(2) + " баллов";
                    } else {
                        gameOverHTML += "<span style='opacity: 0.7;'>Неизвестный тип:</span> " + scoresByType[type].toFixed(2) + " баллов";
                    }
                    gameOverHTML += "</h3>";
                }
            }

            // Add a button to return to the dashboard
            gameOverHTML += "<button id='returnToDashboard' class='btn--default'>Вернуться на главную</button>";

            // Populate the "quiz" element with the HTML content
            this.populateIdWithHTML("quiz", gameOverHTML);

            // Add event listener to the return to dashboard button
            var returnButton = document.getElementById("returnToDashboard");
            if (returnButton) {
                returnButton.onclick = function() {
                    // Redirect to the dashboard.html page
                    window.location.href = "dashboard.html";
                };
            }
        },

        sendScoresToServer: function(totalScore, scoresByType) {
            // Get the login and password from localStorage
            var login = localStorage.getItem("login");
            var password = localStorage.getItem("password");

            // Make a request to the server to update the scores in people.xlsx
            eel.addToTable(login, password, totalScore, scoresByType);
        },

        guessHandler: function(id, guess) {
            var button = document.getElementById(id);
            button.onclick = function() {
                console.log('User guess:', guess); // Проверяем, что guess содержит правильный ответ
                QuizUI.quiz.guess(guess);
                QuizUI.displayNext();
            };
        }
    };

    eel.get_quiz_data()().then(function(data) {
        var questions = [];
        var options = data[1];
        var correct_answers = data[2];
        var type_questions = data[3];

        for (var i = 0; i < type_questions.length; i++) {
            var text = data[0][i];
            var choices = options[i];
            var answer = correct_answers[i];
            var type_question = type_questions[i];
            var question = new Question(text, choices, answer, type_question);
            questions.push(question);
        }

        questions = questions.sort(function() {
            return 0.5 - Math.random();
        });

        var selectedQuestions = questions.slice(0, 10); // Select 5 random questions

        // Инициализация Quiz только один раз
        QuizUI.init(selectedQuestions); // Initialize the QuizUI with the selected questions
    });

});