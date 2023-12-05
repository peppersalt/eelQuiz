var login = localStorage.getItem("login");
var password = localStorage.getItem("password");
console.log("Login:", login);
console.log("Password:", password);

eel.authenticate(login, password)(function(result) {
    if (result) {
        eel.getDashboardData(login, password)(function(data) {
            if (data) {
                // Log retrieved data to console
                console.log("Retrieved data:", data);

                var dashboardDataDiv = document.getElementById("dashboardData");
                var html = "Снова привет,<br>" + data['Name'] + " " + data['Surname'] + "!";
                dashboardDataDiv.innerHTML = html;

                // Use values from the data dictionary
                var ctx = document.getElementById('myChart').getContext('2d');

                // Set color based on score ranges
                function getColor(score) {
                    if (score < 60) {
                        return 'rgba(120, 100, 120, 0.4)';
                    } else if (score < 71) {
                        return 'rgba(0, 106, 200, 0.4)';
                    } else if (score < 78) {
                        return 'rgba(100, 210, 80, 0.4)';
                    } else {
                        return 'rgba(225, 55, 92, 0.4)';
                    }
                }

                var chartData = {
                    labels: ['Расширенные знания', 'Логика', 'Вычислительные способности'],
                    datasets: [{
                        label: 'Интеллект-карта',
                        data: [data['Intell1'], data['Intell2'], data['Intell3']],
                        backgroundColor: [
                            getColor(data['Intell1']),
                            getColor(data['Intell2']),
                            getColor(data['Intell3'])
                        ],
                        borderColor: [
                            getColor(data['Intell1']),
                            getColor(data['Intell2']),
                            getColor(data['Intell3'])
                        ],
                        borderWidth: 1
                    }]
                };

                var myChart = new Chart(ctx, {
                    type: 'bar',
                    data: chartData,
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                });

            } else {
                alert("Данные не найдены.");
            }
        });
    } else {
        alert("Ошибка аутентификации.");
    }
});
