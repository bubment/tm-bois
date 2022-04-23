const recordTable = document.querySelector('#record-table');

window.addEventListener('load', () => {
    formatBest();
    formatRecords();
})

function formatRecords() {
    for (let row of recordTable.rows) {
        for (let cell of row.cells) {
            let timeCell = cell.querySelector('.time-content')
            if (timeCell) {
                let recordTime = timeCell.innerText;

                let millisec = recordTime.slice(-3);
                let totalSec = recordTime.slice(0, -3);
                let totalMin = Math.floor(totalSec / 60);
                let hour = Math.floor(totalMin / 60);
                let sec = totalSec - totalMin * 60;
                let min = totalMin - hour * 60;

                if (recordTime == 0) {
                    timeCell.innerText = '-'
                } else {
                    timeCell.innerText = `${min.toString()}:${sec.toString().padStart(2, '0')}.${millisec}`;
                }
            }

            let deltaCell = cell.querySelector('.delta-content')
            if (deltaCell) {
                let deltaTime = deltaCell.innerText;

                let millisec = deltaTime.slice(-3);
                let totalSec = deltaTime.slice(0, -3);
                let totalMin = Math.floor(totalSec / 60);
                let hour = Math.floor(totalMin / 60);
                let sec = totalSec - totalMin * 60;
                let min = totalMin - hour * 60;

                if (deltaTime == 0) {
                    deltaCell.innerText = '0.000'
                    deltaCell.classList.add('delta-null');
                } else {
                    deltaCell.innerText = `+ ${sec.toString()}.${millisec.padStart(3, '0')} `;
                }
            }
        }
    }
}

function formatBest() {
    for (let i = 1, row; row = recordTable.rows[i]; i++) {
        let fastestCell = { index: -1, time: Infinity }
        for (let j = 1, cell; cell = row.cells[j]; j++) {
            let timeCell = cell.querySelector('.time-content')
            if (timeCell) {
                if (timeCell.innerText > 0 && timeCell.innerText < fastestCell.time) {
                    fastestCell.index = j;
                    fastestCell.time = timeCell.innerText;
                }
            }
        }

        bestTime = row.cells[fastestCell.index].querySelector('.time-content');
        bestTime.classList.add('best-time');
    }
}