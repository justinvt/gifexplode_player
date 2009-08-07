Object.prototype.each = function(lambda){
	for(var i = 0;i < this.length;i++){
		lambda.call(this[i],i)
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
var tick_border = 0;
var timeline_width = 300;
var start_frame = 0;
var end_frame = 0;

function getImages(){
	return document.images.grep(function(){return this.has_property("src",frame_regex)}).collect(function(){return this.src})
}

function getFPS(){
	var input_fps, fps
	input_fps = parseFloat(document.getElementById("speed").value)
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

function frameToTick(frame){
	return parseInt((timeline_width/frames.length) * frame)
}

function tickToFrame(frame){
	return parseInt((frames.length/timeline_width) * frame)
}

function markerWidth(frame){
	return (parseInt(timeline_width/frames.length) + 1)
}

function replaceImage(pause){
	pause = pause || false
	if(current_frame >= end_frame)
	  current_frame = start_frame
	if(current_frame < start_frame)
	  current_frame = end_frame - 1
	document.getElementById("frame_permalink").value = document.getElementById("viewer").getElementsByTagName("img")[0].src = frames[current_frame]
	document.getElementById("current_frame").value = current_frame + 1
	//document.getElementById("time_line").getElementsByTagName("div").each(function(){this.style.background = "#fff"})
	//document.getElementById("time_line").getElementsByTagName("div")[frameToTick(current_frame)].style.background = "red"
	document.getElementById("marker").style.left = frameToTick(current_frame) + "px"
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

function disable_ticks(start,end){
	document.getElementById("time_line").getElementsByTagName("div").each(function(i){
		if(i > frameToTick(start_frame) && i < frameToTick(end_frame) && this.id != "marker")
			this.style.background = "#fff"
		else if(this.id != "marker")
			this.style.background = "#eee"
		else
			return false
	})
}

function createViewer(frames, element){
	var viewer, stop, start, next, prev, speed, current, permalink, speed_label, current_label, time_line, start_frame_field, end_frame_field
	end_frame = frames.length;
	viewer          = document.createElement("div")
	nextFrame       = document.createElement('img')
	controls        = document.createElement("div")
	start_and_stop  = document.createElement("div")
	start           = document.createElement("input")
	stop            = document.createElement("input")
	next            = document.createElement("input")
	prev            = document.createElement("input")
	speed           = document.createElement("input")
	current         = document.createElement("input")
	start_frame_field = document.createElement("input")
	start_label     = document.createElement("label")
	end_label       = document.createElement("label")
	end_frame_field = document.createElement("input")
	permalink_form  = document.createElement("div")
	permalink_label = document.createElement("label")
	permalink       = document.createElement("input")
	speed_label     = document.createElement("label")
	current_label   = document.createElement("label")
	time_line       = document.createElement("div")
	
	var i = 0;
	time_line.id = "time_line"
	time_line.style.width = "300px"
	time_line.style.margin = "0"
	time_line.style.height = "10px"
	time_line.style.cssFloat = "left"
	time_line.style.styleFloat = "left"
	time_line.style.position = "relative"
	
	controls.id = "controls"
	prev.type = start.type = next.type = "button"
	start_frame_field.type = end_frame_field.type = speed.type = current.type = permalink.type ="text"
	start.id = "start_button"
	next.value  = ">"
	prev.value  = "<"
	permalink.id = "frame_permalink"
	permalink_form.style.display = "block"
	permalink_label.innerHTML = "current frame"
	start_label.innerHTML = "Start at"
	end_label.innerHTML = "End at"
	start_frame_field.value = start_frame + 1
	end_frame_field.value = end_frame
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
	
	controls.style.clear = "both"
	
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
	start_frame_field.onkeyup     = function(){
		start_frame = this.value - 1
		disable_ticks(start_frame,end_frame)
	}
	
	end_frame_field.onkeyup     = function(){
		end_frame = this.value
		disable_ticks(start_frame,end_frame)
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
	
	start_and_stop.appendChild(start_label)
	start_and_stop.appendChild(start_frame_field)
	start_and_stop.appendChild(end_label)
	start_and_stop.appendChild(end_frame_field)
	
	viewer.appendChild(nextFrame)
	viewer.appendChild(time_line)
	viewer.appendChild(document.createElement("br"))
	viewer.appendChild(controls)
	viewer.appendChild(start_and_stop)
	viewer.id = "viewer"
	element = element || document.body
	element.insertBefore(viewer,element.firstChild);

	viewer.getElementsByTagName("label").each(function(){ this.style.padding = "3px" })
	viewer.getElementsByTagName("input").grep(function(){return this.has_property("type",/text/)}).each(function(){ this.style.textAlign = "center";this.style.margin = "0 0 0 5px" })
	viewer.getElementsByTagName("div").each(function()  { this.style.margin = "10px 0 0 0";this.style.textAlign="center" })
	start_and_stop.getElementsByTagName("input").grep(function(){return this.has_property("type",/text/)}).each(function(){ this.size = "4"})
	
	//frames.each(function(){
	var ticks = parseInt(time_line.style.width.replace(/[^\d]+/,''))
	
	for(var j=0;j < ticks;j++){
		var f = document.createElement("div")
		f.id = "f_" + j
		f.className = "tick"
		f.style.cssFloat = "left"
		f.style.styleFloat = "left"
		f.style.fontSize = "0.001px"
		//f.style.width = parseInt((parseInt(time_line.style.width) / frames.length - tick_border)) + "px"
		f.style.width = "1px"
		f.style.height = "10px"
		f.style.background = "#fff"
		f.style.borderWidth = "0 " + tick_border + "px 0 0"
		f.style.borderStyle = "solid"
		f.style.borderColor = "#eee"
		f.style.margin = "0"
		time_line.appendChild(f)
	}
	
	var marker = document.createElement("div")
	marker.id = "marker"
	marker.style.position = "absolute"
	marker.style.top = "0px"
	marker.style.left = "0px"
	marker.style.width = "1px"
	marker.style.height = "10px"
	marker.style.background = "red"
	marker.style.width = markerWidth() + "px"
	time_line.appendChild(marker)
	
	time_line.getElementsByTagName("div").each(function(){
		this.onclick = function(){
			var this_frame = parseInt(this.id.replace(/[^\d]+/,''))
			current_frame = tickToFrame(this_frame)
			replaceImage(!playing)
		}
	})
	
	play()
}

window.onload = function(){
	frames = getImages()
	createViewer(frames,document.getElementById("menu"))
}