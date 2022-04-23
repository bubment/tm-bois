const dropArea = document.querySelector('#drop-area');
const textAreaEmpty = document.querySelector('#area-empty');
const textAreaFilled = document.querySelector('#area-filled');
const filledText = document.querySelector('#header-text-filled');
const emptyText = document.querySelector('#header-text-empty');
const uploadButton = document.querySelector('#button-filled-upload');
const cancelButton = document.querySelector('#button-filled-cancel');
const browseButton = document.querySelector('#button-empty');
const spanFilled = document.querySelector('#span-filled');
const input = document.querySelector('#input-empty');

let fileList = [];
let parsedFileList = [];

browseButton.addEventListener('click', () => {
    input.click();
});

cancelButton.addEventListener('click', () => {
    resetFiles();
});

uploadButton.addEventListener('click', () => {

    const requestBody = parsedFileList.map(replay => {
        return {
            name: replay.driverNickname,
            time: replay.time,
            xml: replay.xml
        }
    });

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    };

    fetch(`${HOST}/upload`, requestOptions)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.log(error));

    resetFiles();
});

input.addEventListener('change', function () {
    let droppedFiles = this.files;
    for (let i = 0; i < droppedFiles.length; i++) {
        fileList.push(droppedFiles[i]);
    }
    verifyFiles();
});

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('active');
});

dropArea.addEventListener('dragleave', (event) => {
    if (['drop-container', 'hero-image'].includes(event.relatedTarget.id)) {
        updateView();
    }
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    let droppedFiles = event.dataTransfer.files;
    for (let i = 0; i < droppedFiles.length; i++) {
        fileList.push(droppedFiles[i]);
    }
    dropArea.classList.remove('active');
    verifyFiles();
});


function resetFiles() {
    fileList = [];
    parsedFileList = [];
    textAreaEmpty.style.display = 'flex';
    textAreaFilled.style.display = 'none';
}

function updateView() {
    dropArea.classList.remove('active');
    if (fileList.length > 0) {
        filledText.textContent = `${fileList.length} file${fileList.length > 1 ? 's are' : ' is'} ready to upload`;
        spanFilled.textContent = `${50 - fileList.length} ${50 - fileList.length > 0 ? 'more' : ''} file${50 - fileList.length > 1 ? 's' : ''} can be uploaded`;
        textAreaEmpty.style.display = 'none';
        textAreaFilled.style.display = 'flex';
    } else {
        resetFiles();
    }
}

function verifyFiles() {
    const MAX_FILES = 50;

    fileList = [...new Map(fileList.map(file => [file.name, file])).values()]

    for (file of fileList) {
        let fileType = file.name.split('.').pop();
        let validExtensions = ['Gbx', 'gbx'];
        if (!validExtensions.includes(fileType)) {
            let index = fileList.indexOf(file);
            fileList.splice(index, 1);
        }
    }

    while (fileList.length > MAX_FILES) {
        fileList.pop();
    }

    console.log(fileList);

    transformFiles();
    updateView();
}

function transformFiles() {
    parsedFileList = [];

    for (file of fileList) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async (event) => {
            if (event.target.readyState === FileReader.DONE) {
                const arrayBuffer = event.target.result;
                const array = new Uint8Array(arrayBuffer);
                let metadata = parseGBX(array);
                parsedFileList.push(metadata);
                console.log(metadata);
            }
        }
    }
}



