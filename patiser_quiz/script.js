


async function startQuiz() {
    this.questions = await fetchQuestionsJSON("questions.json");
    document.getElementById("intro").style.display = "none";
    console.log(questions);


    this.createQuestion = function () {
        // /pick a random question from the questions array /
        let question = questions[Math.floor(Math.random() * questions.length)];
        console.log(question);
        let question_id = questions.indexOf(question);
        let question_HTML = `<h1 class="text-center pt-5">${question.text}</h1>`;
        let assessment_HTML = `<h4 class="text-center">${question.Assessment}</h4>`;
        let options_HTML = question.options.map(option => `<span class="option list-group-item list-group-item-action mt-1">${option}</span>`).join("");
        let validate_btn_HTML = `<div class="d-grid gap-2 col-6 mx-auto mt-5"> <button class="btn btn-primary disabled" id="validate" type="button">Verifica raspunsul</button></div>`;
        let next_btn_HTML = `<div class="d-grid gap-2 col-6 mx-auto"><button class="btn btn-primary hidden" type="button" id="next">Urmatoarea Intrebare</button></div>`
        let question_id_HTML = `<div class="hidden" id="q_id">${question_id}</div>`;

        let template_HTML = question_id_HTML + question_HTML + assessment_HTML + '<div class="list-group mt-5">' + options_HTML + '</div>' + validate_btn_HTML + next_btn_HTML;
        document.getElementById("quiz").innerHTML = template_HTML;

        document.querySelectorAll(".option").forEach(option => option.addEventListener("click", this.select));
        document.getElementById("next").addEventListener("click", this.next);
        document.getElementById("validate").addEventListener("click", this.validate);
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
        let selected_option = document.querySelector(".selected");
        let q_id = document.getElementById("q_id").textContent;
        let correct_option = questions[q_id].correct
        let options = document.querySelectorAll(".option");

        for (let i = 0; i < options.length; i++) {
            if (options[i].textContent == correct_option) {
                options[i].classList.add("correct");
            }else{
                options[i].classList.add("incorrect");
            }
        }

        document.getElementById("next").classList.remove("hidden");
        document.getElementById("validate").classList.add("hidden");

    }


    this.next = function () {

        document.getElementById("quiz").innerHTML = "";
        createQuestion();

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
