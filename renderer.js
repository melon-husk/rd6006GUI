var ipc = require('electron').ipcRenderer;
var authButton = document.getElementById('startBtn');
authButton.addEventListener('click', function () {
    ipc.once('actionReply', function (event, response) {
        processResponse(response);
    })
    ipc.send('invokeAction', 'someData');
});