// reference: // from https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// referecne: http://stackoverflow.com/questions/9088552/javascript-custom-object-and-image-onload

var socket = io.connect();

socket.on('connect', function(){
    console.log("Connected");
});

socket.on('remove', function(idt){
    var parentElem = document.getElementById('chatters');
    var remove = document.getElementById(idt);
    var removeClient = parentElem.removeChild(remove);
    
});

socket.on('image', function(data, id, clients){
    var ident = "/#"+id
    for (var i = 0; i<clients.length; i++){
        if(clients[i] == ident){
        var img = new ImageConstructor(data, ident);
        }
        else{
            continue;
        }
    }
});

function ImageConstructor(source, elemId){
    this.img = new Image();
    this.source=source;
    this.img.src = source;
    this.elemId = elemId;
    this.img.onload = function() {
        if(document.getElementById(elemId) == null){
        placeImage();
        }
        show();
    }
    function show(){
        document.getElementById(elemId).src = source;
    }
    
    function placeImage() {
        this.imgElem = document.createElement("img");
        this.imgElem.src = source;
        this.imgElem.id = elemId;
        document.getElementById("chatters").appendChild(this.imgElem);
    }
}
    
    function invert(data, thecontext, imageData){
    for (var i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];// red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
    thecontext.putImageData(imageData, 0, 0);
  }

function init(){

// These help with cross-browser functionality (shim)
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||             navigator.msGetUserMedia;

    // The video element on the page to display the webcam
    var video = document.getElementById('thevideo');

    // if we have the method
    if (navigator.getUserMedia) {
	   navigator.getUserMedia({video: true}, function(stream) {
			 video.src = window.URL.createObjectURL(stream) || stream;
			 video.play();
		  }, function(error) {alert("Failure " + error.code);});
    }

    // Canvas element on the page
    
    
    function filteredImage(){
    var idx = 0;
    var filters = ['grayscale', 'sepia'];

        function changeFilter(e){
            var el = e.target;
            el.className = '';
        
            el.classList.add(filters[idx]);
            idx++
            if (idx >1){
                idx = 0;
            }
        }
        document.getElementById('thevideo').addEventListener(
        'click', changeFilter, false);
    }
    

    var draw = function() {
        var thecanvas = document.getElementById('thecanvas');
        var thecontext = thecanvas.getContext('2d');
        // Draw the video onto the canvas
	    thecontext.drawImage(video,0,0,video.width,video.height);
    
        //added
        var imageData = thecontext.getImageData(0, 0, thecanvas.width, thecanvas.height);
        var data = imageData.data;
        
        invert(data, thecontext, imageData);
        
	    var dataUrl = thecanvas.toDataURL('image/webp', 1);
        
        // Optionally draw it to an image object to make sure it works
         document.getElementById('imagefile').src = dataUrl;
	   
        
        // Send it via our socket server the same way as we send the image
        socket.emit('image', dataUrl, socket.id);
	   
        // Draw again in 3 seconds
	   setTimeout(draw,300);	
    };
    filteredImage();
    draw();
};

window.addEventListener('load', init);