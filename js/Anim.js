var frames = new Array();
var frameDelays = new Array();
var totalFrames = 0;
var currentFrame = 0;
var repeat = -1;

function startAnimation()
{
	// Start the animation
	nextFrame();
}

function addFrame(HTML, delay)
{
   frames[totalFrames] = HTML;
   frameDelays[totalFrames] = delay;
   totalFrames++;
}

function nextFrame()
{
   if (frames.length > 0)
   {
	  document.getElementById("frameData").innerHTML = "<pre>" + frames[currentFrame] + "</pre>";
	  currentFrame++;
	  if (currentFrame==frames.length)
	  {
	  	 currentFrame = 0;
	  	 
	  	 if (repeat > 0)
	  	 {
	  	 	repeat--;
	  	 }
	  	 else if (repeat == 0)
	  	 {
	  	 	return;
	  	 }
	  }
	  window.setTimeout("nextFrame()", frameDelays[currentFrame]);
   }
}

function setRepeat(times)
{
	// -1 = infinite repetition
	// 0  = show once
	repeat = times;
}

function addEvent(obj, evType, fn)
{ 
	if (obj.addEventListener)
	{ 
		obj.addEventListener(evType, fn, false); 
		return true; 
	}
	else if (obj.attachEvent)
	{ 
		var r = obj.attachEvent("on"+evType, fn); 
		return r; 
	}
	else
	{ 
		return false; 
	} 
}

addEvent(window, "load", startAnimation);