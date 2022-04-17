// [TIPP #10] class helyet érdemesebb inkább id (vagy valami unique azonosító) alapján hivatkozni a html elemekre
const dropArea = document.querySelector(".drag-area");
const textAreaEmpty = document.querySelector(".area-empty");
const textAreaFilled = document.querySelector(".area-filled");
// [TIPP #11] Nem érdemes szülő már az elején több beágyazott rétegen keresztül hivatkozni elemekre
// Ha bárki belenyúl a kódba simán eltörheti a hivatkozásokat és máris nem működik a kód.
const filledText = textAreaFilled.querySelector("header");
const emptyText = textAreaEmpty.querySelector("header");
const browseButton = textAreaEmpty.querySelector("button");
const uploadButton = textAreaFilled.querySelector("button");
const input = dropArea.querySelector("input");

let fileList = [];
let parsedFileList = [];

function transformFiles() {
    for (file of fileList) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async (event) => {
            if (event.target.readyState === FileReader.DONE) {
                const arrayBuffer = event.target.result;
                const array = new Uint8Array(arrayBuffer);
                // [TIPP #12] Nem kellenek olyan változók, amiket nem használunk (Itt nem elég onnan, hogy "new GBX({")
                let mGBX = new GBX({
                    data: array,
                    onParse: function (metadata) {
                        if (metadata.type == "Replay") {
                            parsedFileList.push(metadata);
                        }
                    }
                })
            }
        }
    }
}

function verifyFiles() {
    // [TIPP #14] Érdemes lenne csak az újonna beérkező fájlokat validálni és nem mindig az összeset
    console.log(fileList);

    for (file of fileList) {
        let fileType = file.name.split(".").pop();
        let validExtensions = ["Gbx"];
        // [TIPP #15] Megeshet, hogy valaki által feltöltött fájl kisbetűs gbx kiterjesztésű és ezáltal fennakad a validáción
        if (!validExtensions.includes(fileType)) {
            let index = fileList.indexOf(file);
            fileList.splice(index, 1);
        }
    }

    transformFiles();
    updateView();
}

function updateView() {
    dropArea.classList.remove("active");
    if (fileList.length > 0) {
        // [TIPP #16] Kis szintaktikai varázslat, ha már template stringeket használsz
        // filledText.textContent = `${fileList.length} file${fileList.length > 1 ? 's' :''} are ready to upload`
        if (fileList.length > 1) {
            filledText.textContent = `${fileList.length} files are ready to upload`;
        } else {
            filledText.textContent = `${fileList.length} file is ready to upload`;
        }
        textAreaEmpty.style.display = "none";
        textAreaFilled.style.display = "flex";
    } else {
        textAreaEmpty.style.display = "flex";
        textAreaFilled.style.display = "none";
    }
}


// [TIPP #13] Rossz megszokás az addEventListener ne nagyon használd
//Inkább bindold rá az onClick eventet a domban az elementre (sokkal átláthatóbb a kód)
//Az alábbi esetekben lehet érdemes használ az eventListenereket
//1. Ha valamilyen logia alapján dinamikusan akarsz függvényeket hozzáadni egy elemhez
//2. Ha egy DOM elemhez sok függvényt szeretnél hozzárendelni
//3. Ha valami iteráció alapján akarsz hozzárendelni valamikhez függvényt (pl.: minden táblázat cellára egy onclicket)
//4. Ha változik az a függvény valahol, amit hozzárendelsz egy adott elemhez
browseButton.addEventListener("click", () => {
    input.click();
});

uploadButton.addEventListener("click", () => {

    const requestBody = parsedFileList.map(replay => {
        return {
            driverNickname: replay.driverNickname,
            time: replay.time,
            xml: replay.xml
        }
    });

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    };

    fetch(`${HOST}/replays`, requestOptions)
        .then(response => response.json())
        .then(data => {
            fillTable(data.data)
            console.log(data)
        })
        .catch(error => console.log(error));

    fileList = [];
    parsedFileList = [];
    textAreaEmpty.style.display = "flex";
    textAreaFilled.style.display = "none";
});

input.addEventListener("change", function () {
    let droppedFiles = this.files;
    for (let i = 0; i < droppedFiles.length; i++) {
        fileList.push(droppedFiles[i]);
    }
    verifyFiles();
});

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("active");
});

dropArea.addEventListener("dragleave", (event) => {
    if (event.relatedTarget.className != "drag-ignore" && event.target.className != "drag-ignore") {
        updateView();
    }
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    let droppedFiles = event.dataTransfer.files;
    for (let i = 0; i < droppedFiles.length; i++) {
        fileList.push(droppedFiles[i]);
    }
    verifyFiles();
});

