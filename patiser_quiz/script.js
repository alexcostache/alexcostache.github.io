


async function startQuiz() {
    this.questions = await fetchQuestionsJSON("questions.json");
    document.getElementById("intro").style.display = "none";

    this.correct_answers = 0;
    this.incorrect_answers = 0;

    this.createQuestion = function () {
        // /pick a random question from the questions array /
        let question = this.questions[Math.floor(Math.random() * this.questions.length)];
        let question_id = this.questions.indexOf(question);
        let question_HTML = `<h1 class="text-center pt-5">${question.text}</h1>`;
        let assessment_HTML = `<h4 class="text-center">${question.Assessment}</h4>`;
        let options_HTML = question.options.map(option => `<span class="option list-group-item list-group-item-action mt-1">${option}</span>`).join("");
        let validate_btn_HTML = `<div class="d-grid gap-2 col-6 mx-auto mt-5"> <button class="btn btn-primary disabled" id="validate" type="button">Verifica raspunsul</button></div>`;
        let next_btn_HTML = `<div class="d-grid gap-2 col-6 mx-auto"><button class="btn btn-primary hidden" type="button" id="next">Urmatoarea Intrebare</button></div>`
        let question_id_HTML = `<div class="hidden" id="q_id">${question_id}</div>`;

        let template_HTML = question_id_HTML + question_HTML + assessment_HTML + '<div class="list-group mt-5">' + options_HTML + '</div>' + validate_btn_HTML + next_btn_HTML;
        document.getElementById("quiz").innerHTML = template_HTML;

        document.querySelectorAll(".option").forEach(option => option.addEventListener("click", (e) => { this.select(e) }));
        document.getElementById("next").addEventListener("click", () => { this.next() });
        document.getElementById("validate").addEventListener("click", () => { this.validate() });
        this.createStats();
    }

    this.createStats = function () {
        let stats_HTML = `<div class="progress-stacked">
        <div class="progress" role="progressbar" aria-label="Segment two" style="width: ${this.correct_answers * 1.11}%">
        <div class="progress-bar bg-success"></div>
        </div>
        <div class="progress" role="progressbar" aria-label="Segment one" style="width: ${this.incorrect_answers * 1.11}%">
          <div class="progress-bar bg-danger"></div>
        </div>
        </div>`;

        let questions_left_HTML = `<h6 class="mt-1">Intrebari Ramase:  ${this.questions.length}</h6>`;
        document.getElementById("stats").innerHTML = stats_HTML + questions_left_HTML;
    }

    this.createFinish = function () {
        let finish_HTML = `<h1 class="text-center pt-5">Felicitari! Ai terminat testul!</h1>`;
        finish_HTML += `<h4 class="text-center">Ai raspuns corect la ${this.correct_answers} intrebari si ai gresit la ${this.incorrect_answers} intrebari.</h4>`;
        finish_HTML += `<div class="d-grid gap-2 col-6 mx-auto mt-5"><button class="btn btn-primary" type="button" onclick="location.reload()">Restart</button></div>`;
        document.getElementById("quiz").innerHTML = finish_HTML;
    }



    this.select = (e) => {
        // add select class if not already present and remove if present 
        if (e.target.classList.contains("selected")) {
            e.target.classList.remove("selected");
        } else {
            e.target.classList.add("selected");
        }
        // enable validate button if at least one option is selected
        if (document.querySelectorAll(".selected").length > 0) {
            document.querySelector(".btn-primary").classList.remove("disabled");
        } else {
            document.querySelector(".btn-primary").classList.add("disabled");
        }
    }


    this.validate = () => {
        // check if the selected option is correct
        let q_id = document.getElementById("q_id").textContent;
        let correct_option = this.questions[q_id].correct
        let options = document.querySelectorAll(".option");

        for (let i = 0; i < options.length; i++) {
            if (options[i].textContent === correct_option) {
                options[i].classList.add("correct");
            } else {
                options[i].classList.add("incorrect");
            }
        }

        // check if the selected option is correct
        let selected_option = document.querySelector(".selected");
        if (selected_option.textContent === correct_option) {
            this.correct_answers++;
        } else {
            this.incorrect_answers++;
        }

        document.getElementById("next").classList.remove("hidden");
        document.getElementById("validate").classList.add("hidden");
        this.questions.splice(document.getElementById("q_id").textContent, 1);

    }

    this.next = function () {
        document.getElementById("quiz").innerText = "";

        if (this.questions.length === 0) {
            this.createFinish();
            this.createStats();
            return;
        }

        this.createQuestion();
    }



    this.createQuestion();
}




async function fetchQuestionsJSON(json_file) {
    let questions = [];
    await fetch(json_file)
        .then(response => response.json())
        .then(data => questions = data);
    return questions;
}


document.getElementById("start").addEventListener("click", startQuiz);