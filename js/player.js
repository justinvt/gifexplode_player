Object.prototype.each = function(lambda){
	for(var i = 0;i < this.length;i++){
		lambda.call(this[i])
	}
	return this
}

Object.prototype.collect = function(lambda){
	results = []
	for(var i = 0;i < this.length;i++){
		results.push(lambda.call(this[i]))
	}
	return results
}

Object.prototype.grep = function(lambda){
	var result = []
	for(var i = 0;i < this.length;i++){
		if(lambda.call(this[i]))
		  result.push(this[i])
	}
	return result
}

Object.prototype.has_property = function(attr,match){
	match = match || RegExp(".","g")
	return (this[attr] != null && this[attr].typeOf != "undefined" && this[attr] != "" && this[attr].match(match))
}

var default_speed = 10 //fps
var speed_units = "fps"
var frame_regex = RegExp("-[\\d]+\\.png$","g")

var current_frame = 0;
var frames;
var stepper, playing;


function getImages(){
	return document.images.grep(function(){return this.has_property("src",frame_regex)}).collect(function(){return this.src})
}

function getFPS(){
	var input_fps, fps
	input_fps = parseInt(document.getElementById("speed").value)
	if(input_fps <= 0)
	  input_fps = 0.1
	return 1000/input_fps
}

function setPlayState(currently_playing){
	if(currently_playing){
	  playing = true
	  document.getElementById("start_button").value = "❚❚"
	}
	else{
      playing = false
	  document.getElementById("start_button").value = "►"
	}
}

function replaceImage(pause){
	pause = pause || false
	if(current_frame >= frames.length)
	  current_frame = 0
	if(current_frame < 0)
	  current_frame = frames.length - 1
	document.getElementById("frame_permalink").value = document.getElementById("viewer").getElementsByTagName("img")[0].src = frames[current_frame]
	document.getElementById("current_frame").value = current_frame + 1
	current_frame++;
	clearTimeout(stepper)
	if(!pause)
	  stepper = setTimeout("replaceImage()",getFPS())
	setPlayState(!pause)
}

function advance(){
	replaceImage(true)
}

function previous(){
	//subtract 2 because the counter for the next frame to display has already advanced 1
	current_frame-=2;
	replaceImage(true)
}

function play(){
	replaceImage()
	
}

function pause(){
	clearTimeout(stepper)
	setPlayState(false)
}

function toggle_play(){
	!playing ? play() : pause()
}

function createViewer(frames, element){
	var viewer, stop, start, next, prev, speed, current, permalink, speed_label, current_label
	viewer          = document.createElement("div")
	nextFrame       = document.createElement('img')
	controls        = document.createElement("div")
	start           = document.createElement("input")
	stop            = document.createElement("input")
	next            = document.createElement("input")
	prev            = document.createElement("input")
	speed           = document.createElement("input")
	current         = document.createElement("input")
	permalink_form  = document.createElement("div")
	permalink_label = document.createElement("label")
	permalink       = document.createElement("input")
	speed_label     = document.createElement("label")
	current_label   = document.createElement("label")
	controls.id = "controls"
	prev.type = start.type = next.type = "button"
	speed.type = current.type = permalink.type ="text"
	start.id = "start_button"
	next.value  = ">"
	prev.value  = "<"
	permalink.id = "frame_permalink"
	permalink_form.style.display = "block"
	permalink_label.innerHTML = "current frame"
	speed.name = speed.id  = "speed"
	speed.value = default_speed;
	speed.size = current.size = 3
	current.disabled = true
	current.name = current.id = "current_frame"
	speed_label.innerHTML = speed_units
	current_label.innerHTML = " of " + frames.length
	
	nextFrame.style.display = "block"
	nextFrame.style.margin = "0 auto"
	nextFrame.style.border = "solid 1px #fff"
	nextFrame.style.borderColor = document.body.background
	
	viewer.style.position = "absolute"
	viewer.style.top = "0px"
	viewer.style.right = "0px"
	viewer.style.background = "#624E2B"
	viewer.style.background = "#624E2B"
	viewer.style.padding = "10px"
	viewer.className+=viewer.className?' box':'box';
	
	permalink.onclick = function(){ this.select() }
	start.onclick     = function(){ toggle_play() }
	next.onclick      = function(){ advance() }
	prev.onclick      = function(){ previous() }
	speed.onkeyup     = function(){
		if(playing){
		  clearTimeout(stepper)
		  replaceImage()
		}
	}
	
	permalink_form.appendChild(permalink_label)
	permalink_form.appendChild(permalink)
	controls.appendChild(start)
	controls.appendChild(prev)
	controls.appendChild(next)
	controls.appendChild(speed)
	controls.appendChild(speed_label)
	controls.appendChild(current)
	controls.appendChild(current_label)
	controls.appendChild(permalink_form)
	viewer.appendChild(nextFrame)
	viewer.appendChild(controls)
	viewer.id = "viewer"
	element = element || document.body
	element.insertBefore(viewer,element.firstChild);

	viewer.getElementsByTagName("label").each(function(){ this.style.padding = "3px" })
	viewer.getElementsByTagName("input").grep(function(){return this.has_property("type",/text/)}).each(function(){ this.style.textAlign = "center";this.style.margin = "0 0 0 5px" })
	viewer.getElementsByTagName("div").each(function()  { this.style.margin = "10px 0 0 0" })
	
	play()
}

window.onload = function(){
	frames = getImages()
	createViewer(frames,document.getElementById("menu"))
}