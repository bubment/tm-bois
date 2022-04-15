const dropArea = document.querySelector(".drag-area");
const textAreaEmpty = document.querySelector(".area-empty");
const textAreaFilled = document.querySelector(".area-filled");
const filledText = textAreaFilled.querySelector("header");
const dragText = dropArea.querySelector("header");
const browseButton = textAreaEmpty.querySelector("button");
const uploadButton = textAreaFilled.querySelector("button");
const input = dropArea.querySelector("input");

var GBXArray = [];
var dragCounter = 0;

function transformFiles(fileList) {
    for (file of fileList) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async (event) => {
            if (event.target.readyState === FileReader.DONE) {
                const arrayBuffer = event.target.result;
                const array = new Uint8Array(arrayBuffer);

                let mGBX = new GBX({
                    data: array,
                    onParse: function (metadata) {
                        if (metadata.type == "Replay") {
                            GBXArray.push(metadata);
                        }
                    }
                })
            }
        }
    }
}

function acceptFiles(fileList) {
    var isValidExtension = true;
    for (file of fileList) {
        let fileType = file.name.split(".").pop();
        let validExtensions = ["Gbx"];
        if (!validExtensions.includes(fileType)) {
            alert("Only GBX files are allowed!");
            isValidExtension = false;
        }
    }

    if (isValidExtension) {
        transformFiles(fileList);
        filledText.textContent = `${fileList.length} file ready to upload`;
        textAreaEmpty.style.display = "none";
        textAreaFilled.style.display = "flex";
    } else {
        dragText.textContent = "Drag & Drop to Upload File";
    }
}

browseButton.addEventListener("click", () => {
    input.click();
});

uploadButton.addEventListener("click", () => {

    const requestBody = GBXArray.map(replay => {
        return {
            driverNickname:replay.driverNickname,
            time:replay.time,
            xml:replay.xml
        }
    })

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

    GBXArray = [];
    textAreaEmpty.style.display = "flex";
    textAreaFilled.style.display = "none";
});

input.addEventListener("change", () => {
    var fileList = this.files;
    dropArea.classList.remove("active");
    acceptFiles(fileList);
});

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("active");
    textAreaEmpty.style.display = "flex";
    textAreaFilled.style.display = "none";
    dragText.textContent = "Release to Upload File";
});


dropArea.addEventListener("dragleave", (e) => {
    if (e.relatedTarget.className != "drag-ignore" && e.target.className != "drag-ignore") {
        dropArea.classList.remove("active");
        dragText.textContent = "Drag & Drop to Upload File";
    }
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    var fileList = event.dataTransfer.files;
    dropArea.classList.remove("active");
    acceptFiles(fileList);
});

