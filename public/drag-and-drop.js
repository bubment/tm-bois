
const dropArea = document.querySelector(".drag-area");
const dragText = dropArea.querySelector("header");
const button = dropArea.querySelector("button");
const input = dropArea.querySelector("input");

let file;

button.onclick = () => {
    input.click();
}

input.addEventListener("change", function (event) {
    file = this.files[0];
    dropArea.classList.add("active");
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
    handleFile();
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
    file = event.dataTransfer.files[0];
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
    handleFile();
});

function handleFile() {
    let fileType = file.name.split(".").pop();
    let validExtensions = ["Gbx"];

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