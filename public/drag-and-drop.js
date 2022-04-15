const dropArea = document.querySelector(".drag-area");
const textAreaEmpty = document.querySelector(".area-empty");
const textAreaFilled = document.querySelector(".area-filled");
const filledText = textAreaFilled.querySelector("header");
const dragText = dropArea.querySelector("header");
const button = dropArea.querySelector("button");
const input = dropArea.querySelector("input");


button.onclick = () => {
    input.click();
}

input.addEventListener("change", function () {
    var fileList = this.files;
    acceptFiles(fileList);
});

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("active");
    dragText.textContent = "Release to Upload File";
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    var fileList = event.dataTransfer.files;
    acceptFiles(fileList);
});

function acceptFiles(fileList) {
    console.log(fileList)

    for (file of fileList) {
        let fileType = file.name.split(".").pop();
        let validExtensions = ["Gbx"];
        if (!validExtensions.includes(fileType)) {
            alert("Only GBX files are allowed!");

        }
    }

    dropArea.classList.remove("active");
    filledText.textContent = `${fileList.length} file ready to upload`;
    textAreaEmpty.style.display = "none";
    textAreaFilled.style.display = "flex";
}

function handleFile(fileList) {

    if (validExtensions.includes(fileType)) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = (event) => {
            if (event.target.readyState === FileReader.DONE) {
                const arrayBuffer = event.target.result;
                const array = new Uint8Array(arrayBuffer);

                let mGBX = new GBX({
                    data: array,
                    onParse: function (metadata) {
                        console.log(metadata)
                    }
                })
            }
        }
    } else {
        alert("This is not a GBX File!");
        dropArea.classList.remove("active");
        dragText.textContent = "Drag & Drop to Upload File";
    }
}