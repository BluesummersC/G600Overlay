let layouts
window.bridge.send("toMain", ["requestConfig"]);
window.bridge.receive("configReturn", (data) => {
    console.log(data);
    let activeLayout = ""
    if (Object.hasOwn(data, 'last_active')) {
        if (data.last_active !== ""){
            activeLayout = data.last_active
        }
    }

    layouts = data.layouts
    console.log(layouts)
    // populate the selection
    for (let key in layouts) {
        let opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = key;
        if (key == activeLayout) {
            opt.selected = true
            selectLayout(key)
        }
        document.getElementById('selectLayouts').append(opt);
    }

});
function selectLayout(selectedLayout) {
    document.getElementById('inputWidth').value = layouts[selectedLayout].width;
    document.getElementById('inputHeight').value = layouts[selectedLayout].height;
    document.getElementById('inputLeftOffset').value = layouts[selectedLayout].offsetLeft;
    document.getElementById('inputBottomOffest').value = layouts[selectedLayout].offsetBottom;
    window.bridge.send("toMain", ["updateActive", selectedLayout])
}
function sendUpdate() {
    let sel = document.getElementById('selectLayouts')
    let selected = sel.options[sel.selectedIndex].text
    let layout = layouts[selected]
    layout.width = document.getElementById('inputWidth').value
    layout.height = document.getElementById('inputHeight').value
    layout.offsetLeft = document.getElementById('inputLeftOffset').value
    layout.offsetBottom = document.getElementById('inputBottomOffest').value
    window.bridge.send('toMain', ['activate', selected, layout])

}
function saveToFile() {
    let sel = document.getElementById('selectLayouts')
    let selected = sel.options[sel.selectedIndex].text
    window.bridge.send('toMain', ['save', selected])
}