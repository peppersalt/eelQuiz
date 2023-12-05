function compute() {
    var data = document.getElementById("data").value
    eel.demo(data)(setValue)
}

function setValue(res) {
    document.getElementById("abc").src = res
}

function openNewForm() {
  var name = document.getElementsByName("u")[0].value;
  var surname = document.getElementsByName("p")[0].value;
  var score = 0;

  if (name !== "" && surname !== "") {
    localStorage.setItem("name", name);
    localStorage.setItem("surname", surname);
    localStorage.setItem("score", score);

    window.close();
    eel.openNewForm();
    window.maximize();
  } else {
    alert("Пожалуйста, введите имя и фамилию.");
  }
}

function authenticate() {
    var login = document.getElementsByName("login")[0].value;
    var password = document.getElementsByName("password")[0].value;

    if (login !== "" && password !== "") {
        // Здесь производим проверку данных в people.xlsx
        eel.authenticate(login, password)(function(result) {
            if (result) {
                localStorage.setItem("login", login);
                localStorage.setItem("password", password);
                window.location.href = "dashboard.html";
            } else {
                alert("Неверный логин или пароль.");
            }
        });
    } else {
        alert("Пожалуйста, введите логин и пароль.");
    }
}
