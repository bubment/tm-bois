
const tableBody = document.querySelector("tbody");

function apiCallExample() {
    fetch('http://localhost:3000/records')
        .then(response => response.json())
        .then(data => fillTable(data))
        .catch(err => console.log(err));
}

function fillTable(data) {
    for (let row of data) {
        if (row.season == "Spring" && row.year == 2022) {
            var mapNumber = parseInt(row.map);
            var playerNumber;

            switch (row.player) {
                case "bubment":
                    playerNumber = 2;
                    break;
                case "CTRL_BUTTON":
                    playerNumber = 3;
                    break;
                case "ESC_BUTTON":
                    playerNumber = 4;
                    break;
                default: playerNumber = -1;
            }

            if (playerNumber !== -1) {
                var cell = tableBody.querySelector(`tr:nth-of-type(${mapNumber})`).querySelector(`td:nth-of-type(${playerNumber})`);

                milliSec = row.time.slice(-3);
                secTemp = parseInt(row.time.slice(0, -3));
                min = Math.floor(secTemp / 60);
                sec = secTemp - min * 60;

                cell.innerHTML = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${milliSec}`;
            }
        }
    }
}

