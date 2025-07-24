
window.bridge.receive("fromMain", (data) => {
    console.log(data)
    let myDiv = document.getElementById('mainDiv')

    // Remove any existing before updating
    while (myDiv.hasChildNodes()) {
        myDiv.removeChild(myDiv.firstChild)
    }
    // Add new bars
    for (i = 0; i < data.bars.length; i++) {
        let canv = document.createElement('canvas')
        canv.id = "bar" + i
        canv.width = data.width
        canv.height = data.height
        canv.style.border = "1px solid #" + data.bars[i].borderColor
        canv.style.marginLeft = data.bars[i].marginLeft + "px"
        myDiv.appendChild(canv)
        console.log(canv.id)
    }
    // Update div position
    myDiv.style.left = data.offsetLeft + "px"
    myDiv.style.marginBottom = data.offsetBottom + "px"
});

window.bridge.send("toMain", ["readConfig"])