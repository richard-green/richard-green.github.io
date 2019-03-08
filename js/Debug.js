/****

DEBUG - A lightweight javascript debugger by Richard Green http://rdgreen.me.uk
============================================================================

Cross browser; works in IE6, IE7, FireFox, Opera, maybe more!

Why not add this page as a favelet; debug any page on any site! Copy the following line into a new favourite:
javascript:(function(){var%20s=document.createElement('script');s.type='text/javascript';s.src='http://rdgreen.me.uk/js/Debug.js';document.body.appendChild(s);})()

Then, simply click on the favourite, and it auto-loads the debug script into your current browser page!

This file is under no copyright whatsoever; please feel free to use and modify to your hearts content, although
please credit me if you do and let me know of any improvements!


This file contains the following debug functions:
=================================================
Debug.Error(value, [title]) - creates an error window containing 'value'. Background colour is reddish. Level = 0

Debug.Warning(value, [title]) - creates an warning window containing 'value'. Background colour is yellow. Level = 1

Debug.Info(value, [title]) - creates an info window containing 'value'. Background colour is green. Level = 2

Debug.Write(value, [title]) - creates a debug box containing 'value'. Calls Debug.InspectObject if value is an object. Level = 3

Debug.InspectObject(obj, [title], [class]) - creates an object browser (tree view of objects contents). Level = 3

Debug.Xml(sXml) - pass this an xml string to display the xml nicely formatted in a debug window. Level = 3


NOTE:
=====

The Debug window will not appear by default, you need to press ` to make it appear
(the character underneath the escape key on a standard keyboard; also called the back-tick)


UPDATES:
========

2011-01-17	New icons
2010-12-22	Don't sort arrays
2010-04-26	Debug is now defined as a Closure
2009-05-14	Stack trace now available for all log messages!
2009-04-11	Clear button no longer removes text entered in the evaluate box
2009-04-11	List/Refresh of external CSS+JavaScript files now finalised!
2009-04-06	List current page's cookie values

****/

var Debug = (function ()
{
	var oDebugPane = null;
	var bAllowDebug = true;
	var bListFunctions = false;
	var txtEvaluateThis = null;
	var iPopupLevel = -1; // message level causing pop-up

	function Init()
	{
		if (bAllowDebug)
		{
			if (oDebugPane == null)
			{
				CreateStyles();
				oDebugPane = document.createElement("div");
				oDebugPane.id = "DebugPane";
				oDebugPane.style.display = "none";
				AddHeaders();
				document.body.appendChild(oDebugPane);
			}
			return true;
		}
		else
		{
			return false;
		}
	}

	function AddHeaders()
	{
		var spnDebugWindow = document.createElement("span");

		spnDebugWindow.innerHTML = "Debug Window \
			(<a href='#' onclick='Debug.HideWindow(); return false;'>hide</a> | \
			<a href='#' onclick='Debug.ClearWindow(); return false;'>clear</a> | \
			<a href='#' onclick='Debug.ToggleFunctionView(this); return false;'>" + (bListFunctions ? "hide" : "show") + " functions</a> | \
			<a href='#' onclick='Debug.ListCookies(); return false;'>cookies</a> | \
			javascript: <a href='#' onclick='Debug.ListJsIncludes(); return false;'>list</a>/\<a href='#' onclick='Debug.RefreshJavaScript(); return false;'>refresh</a> | \
			css: <a href='#' onclick='Debug.ListCssIncludes(); return false;'>list</a>/\<a href='#' onclick='Debug.RefreshCss(); return false;'>refresh</a>) | \
			<a href='#' onclick='Debug.ViewState(); return false;'>viewstate</a>)";

		// Data URI checking - thanks to http://weston.ruter.net/2009/05/07/detecting-support-for-data-uris/
		var data = new Image();
		data.onload = data.onerror = function ()
		{
			if (data.width != 1 || data.height != 1) oDebugPane.className += " no-data-uri";
		}
		data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

		DebugEntry(spnDebugWindow, "", true);
		var spnEvaluate = document.createElement("span");
		var lblEvaluate = document.createElement("label");

		if (txtEvaluateThis == null)
		{
			txtEvaluateThis = document.createElement("input");
			txtEvaluateThis.type = "text";
			txtEvaluateThis.id = "txtEvaluateThis";
			txtEvaluateThis.style.width = "80%";
			txtEvaluateThis.style.float = "right";
			addEvent(txtEvaluateThis, "keypress", txtEvaluateThisKeyPress);
		}

		spnEvaluate.appendChild(lblEvaluate);
		spnEvaluate.appendChild(txtEvaluateThis);
		lblEvaluate.innerHTML = "Evaluate:&nbsp;";
		lblEvaluate.htmlFor = "txtEvaluateThis";
		var imgEvaluate = EvaluateImage();
		addEvent(imgEvaluate, "click", imgEvaluateClick);
		spnEvaluate.appendChild(imgEvaluate);
		DebugEntry(spnEvaluate, "", true);
	}

	function HideWindow()
	{
		if (Init())
		{
			oDebugPane.style.display = "none";
		}
		return false;
	}

	function ShowWindow()
	{
		if (Init())
		{
			oDebugPane.style.display = "";
			document.body.removeChild(oDebugPane);
			document.body.appendChild(oDebugPane);
			oDebugPane.childNodes[1].getElementsByTagName("input")[0].focus();
		}
	}

	function ToggleWindow()
	{
		if (Init())
		{
			if (oDebugPane.style.display == "")
			{
				HideWindow();
			}
			else
			{
				ShowWindow();
			}
		}
	}

	function ClearWindow()
	{
		if (Init()) oDebugPane.innerHTML = "";
		AddHeaders();
		return false;
	}

	function ToggleFunctionView(a)
	{
		bListFunctions = !bListFunctions;
		a.innerHTML = (bListFunctions ? "hide" : "show") + " functions";
		return false;
	}

	function Error(value, title)
	{
		Write(value, title, "error");
	}

	function Warning(value, title)
	{
		Write(value, title, "warning");
	}

	function Info(value, title)
	{
		Write(value, title, "info");
	}

	function Write(value, title, cssClass)
	{
		if (typeof (value) == "object")
		{
			InspectObject(value, title ? title : "Anonymous Object", cssClass ? cssClass : "debug");
		}
		else
		{
			if (title)
			{
				InspectObject({ "Value": value }, title, cssClass ? cssClass : "debug");
			}
			else
			{
				DebugEntry(value, cssClass ? cssClass : "debug", false);
			}
		}
	}

	function InspectObject(obj, title, cssClass)
	{
		if (typeof (obj) != "object")
		{
			Write(obj);
			return;
		}
		var h4 = document.createElement("h4");
		var img = RefreshImage();
		addEvent(img, "click", RefreshObject);
		img.obj = obj;
		h4.appendChild(document.createTextNode(title ? title + " " : "Anonymous Object "));
		h4.appendChild(img);
		var oList = ListObject(obj);
		DebugEntry(h4, cssClass ? cssClass : "object");
		h4.parentNode.appendChild(oList);
	}

	function Xml(sXml)
	{
		if (typeof (sXml) == "string")
		{
			var pre = document.createElement("pre");
			pre.appendChild(document.createCDATASection(PrettifyXml(sXml)));
			DebugEntry(pre, "xml");
		}
	}

	function ErrorHandler(message, url, line)
	{
		InspectObject({ "message": message, "url": url, "line": line }, "Unhandled Exception", "error");
		return true;
	}

	function ListJsIncludes()
	{
		var list = document.getElementsByTagName("script");
		var outputOL = document.createElement("ol");
		var items = 0;

		for (var i = 0; i < list.length; i++)
		{
			if (list[i].src)
			{
				var li = document.createElement("li");
				var a = document.createElement("a");
				a.appendChild(document.createTextNode(Relativize(list[i].src)));
				a.href = list[i].src;
				li.appendChild(a);
				outputOL.appendChild(li);
				items++;
			}
		}

		if (items > 0)
		{
			DebugEntry(outputOL, "debug");
		}
		else
		{
			var em = document.createElement("em");
			em.appendChild(document.createTextNode("No external CSS files"));
			DebugEntry(em, "debug");
		}

		return false;
	}

	function ListCssIncludes()
	{
		var list = document.getElementsByTagName("link");
		var outputOL = document.createElement("ol");
		var items = 0;

		for (var i = 0; i < list.length; i++)
		{
			if (list[i].rel.toLowerCase() == "stylesheet" && list[i].href)
			{
				var li = document.createElement("li");
				var a = document.createElement("a");
				a.appendChild(document.createTextNode(Relativize(list[i].href)));
				a.href = list[i].href;
				li.appendChild(a);
				outputOL.appendChild(li);
				items++;
			}
		}

		if (items > 0)
		{
			DebugEntry(outputOL, "debug");
		}
		else
		{
			var em = document.createElement("em");
			em.appendChild(document.createTextNode("No external CSS files"));
			DebugEntry(em, "debug");
		}

		return false;
	}

	function ListCookies()
	{
		var cookies = {}; var ca = document.cookie.split(';'); for (var i = 0; i < ca.length; i++)
		{
			var eq = ca[i].indexOf('='); cookies[Trim(ca[i].substr(0, eq))] = Trim(ca[i].substr(eq + 1))
		}

		InspectObject(cookies, "cookies", "info");

		return false;
	}

	function Trim(str)
	{
		return str.replace(/^[ \t]*/, "").replace(/[ \t]*$/, "");
	}

	function RefreshJavaScript()
	{
		var dynlist = document.getElementsByTagName("script");
		var exp = new RegExp("^(.*\/)?(d|D)ebug.js$", "i");
		var list = [];

		for (var i = 0; i < dynlist.length; i++)
		{
			list[i] = dynlist[i];
		}

		for (var i = 0; i < list.length; i++)
		{
			if (list[i].src && exp.test(list[i].src) == false)
			{
				var newBlock = document.createElement("script");
				newBlock.type = "text/javascript";
				newBlock.src = Randomize(list[i].src);

				var parent = list[i].parentNode;
				parent.removeChild(list[i]);
				parent.appendChild(newBlock);
			}
		}

		return false;
	}

	function RefreshCss()
	{
		var list = document.getElementsByTagName("link");

		for (var i = 0; i < list.length; i++)
		{
			if (list[i].rel.toLowerCase() == "stylesheet" && list[i].href)
			{
				list[i].href = Randomize(list[i].href);
			}
		}

		return false;
	}

	function Relativize(url)
	{
		var host = document.location.protocol + "//" + document.location.host;
		return url.replace(new RegExp("^" + host), "").replace(new RegExp("^" + document.location.pathname), "");
	}

	function Randomize(url)
	{
		var urlqs = new RegExp("([^\?]+)([\?](.*))?"); // url and querystring groups
		var baseurl = url.replace(urlqs, "$1");
		var qs = url.replace(urlqs, "$3");
		var rndqs = "rnd=" + Math.random();

		if (qs)
		{
			var rnd = new RegExp("(?:[^=]+=[^&]+&)?(rnd=[^&]+)(?:&.*)?");
			if (rnd.test(qs))
			{
				rnd = qs.replace(rnd, "$1");
				qs = qs.replace(rnd, rndqs);
			}
			else
			{
				qs = qs + "&" + rndqs;
			}
			url = baseurl + "?" + qs;
		}
		else
		{
			url = baseurl + "?" + rndqs;
		}

		return url;
	}

	function ListObject(obj)
	{
		if (obj == null)
		{
			em = document.createElement("em");
			em.innerHTML = "null";
			return em;
		}

		var ul, li, a;
		ul = document.createElement("ul");
		var emptyObject = true;

		if (typeof (obj) == "string")
		{
			li = document.createElement("li");
			li.innerHTML = "<pre>" + Escape(PrettifyXml(obj)) + "</pre>";
			ul.appendChild(li);
			return ul;
		}

		try
		{
			var listItems = new Object();
			var liNames = new Array();

			for (var o in obj)
			{
				if (o == "domConfig")
				{
					// Potentially dangerous sub-object that can crash FF when interrogated
				}
				else
				{
					li = document.createElement("li");

					switch (typeof (obj[o]))
					{
						case "object":
							if (obj[o] == null)
							{
								li.innerHTML = o + ": <em>null</em>";
							}
							else
							{
								a = document.createElement("a");
								a.innerHTML = o;
								a.style.color = '#080';
								a.onclick = function (e)
								{
									return ExpandObject(this);
								};
								a.href = "#";
								a.obj = obj[o];
								li.appendChild(a);
							}
							break;

						case "function":
							if (bListFunctions)
							{
								li.innerHTML = "<span style='color:#00f;'>" + o + "</span>: <em>function</em>";
							}
							else
							{
								li = null;
							}
							break;

						default:
							if (o == "innerHTML" || o == "outerHTML" || o == "html" || o == "textContent" || o == "outerText" || o == "innerText" || o == "xml")
							{
								a = document.createElement("a");
								a.innerHTML = o;
								a.style.color = '#080';
								a.onclick = function (e)
								{
									return ExpandObject(this);
								};
								a.href = "#";
								a.obj = obj[o];
								li.appendChild(a);
							}
							else
							{
								li.innerHTML = o + ": " + Escape(obj[o]);
							}
							break;
					}

					if (li != null)
					{
						liNames.push(o);
						listItems[o] = li;
						emptyObject = false;
					}
				}
			}
			if (emptyObject)
			{
				li = document.createElement("li");
				li.innerHTML = Escape(obj);
				ul.appendChild(li);
			}
			else
			{
				if (IsArray(obj) == false)
				{
					liNames.sort();
				}
				for (var i = 0; i < liNames.length; i++)
				{
					if (liNames[i] && listItems[liNames[i]])
					{
						ul.appendChild(listItems[liNames[i]]);
					}
				}
			}
		}
		catch (ex)
		{
		}

		return ul;
	}

	function IsArray(obj)
	{
		return Object.prototype.toString.call(obj) === "[object Array]";
	}

	function Escape(str)
	{
		if (typeof (str) == "string")
		{
			return str.replace(/&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
		}
		else
		{
			return str;
		}
	}

	function ExpandObject(a)
	{
		if (!a)
		{
			var e = window.event;
			a = e.target ? e.target : e.srcElement ? e.srcElement : null;
		}

		if (!a) return;

		if (a.ul)
		{
			a.ul.style.display = a.ul.style.display == "" ? "none" : "";
		}
		else
		{
			a.ul = ListObject(a.obj);
			a.parentNode.appendChild(a.ul);
		}
		return false;
	}

	function RefreshObject(evt)
	{
		if (!evt)
		{
			evt = window.event;
		}

		var a = evt.target ? evt.target : evt.srcElement ? evt.srcElement : null;
		if (!a) return false;

		var dbg = a.parentNode.parentNode;
		var ul = dbg.getElementsByTagName("ul")[0];
		dbg.removeChild(ul);
		a.ul = ListObject(a.obj);
		dbg.appendChild(a.ul);

		return false;
	}

	function PrettifyXml(sXml)
	{
		return sXml.replace(/&/g, "&amp;").replace(/></g, "&gt;\n&lt;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n[ \t]+/g, "\n");
	}

	function ViewState()
	{
		var viewstate = document.getElementById("__VIEWSTATE");

		if (viewstate)
		{
			Write("ViewState size: " + viewstate.value.length + " bytes.");
		}
		else
		{
			Write("No ViewState present on page.");
		}

		return false;
	}

	function Stack()
	{
		// With thanks to http://eriwen.com/javascript/js-stack-trace/ for providing a more robust implementation of stack tracing

		var callstack = [];
		var isCallstackPopulated = false;
		try
		{
			i.dont.exist += 0; // doesn't exist- that's the point
		}
		catch (e)
		{
			if (e.stack)
			{
				// Firefox
				var lines = e.stack.split('\n');
				for (var i = 0, len = lines.length; i < len; i++)
				{
					//if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/))
					{
						callstack.push(lines[i]);
					}
				}
				// Remove call to Stack()
				callstack.shift();
				isCallstackPopulated = true;
			}
			else if (window.opera && e.message)
			{
				// Opera
				var lines = e.message.split('\n');
				for (var i = 0, len = lines.length; i < len; i++)
				{
					if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/))
					{
						var entry = lines[i];
						// Append next line also since it has the file info
						if (lines[i + 1])
						{
							entry += " at " + lines[i + 1];
							i++;
						}
						callstack.push(entry);
					}
				}
				// Remove call to printStackTrace()
				callstack.shift();
				isCallstackPopulated = true;
			}
		}
		if (!isCallstackPopulated)
		{
			// IE and Safari
			var currentFunction = arguments.callee.caller;
			while (currentFunction)
			{
				var fn = currentFunction.toString();
				var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
				callstack.push(fname);
				currentFunction = currentFunction.caller;
			}
		}

		return callstack;
	}

	function DebugEntry(debugEntry, cssClass, hideControls)
	{
		if (Init())
		{
			var oDebugEntry = document.createElement("div");
			oDebugEntry.className = cssClass == null ? "" : cssClass;

			if (!hideControls)
			{
				var oCloseDebugEntry = DeleteImage();
				addEvent(oCloseDebugEntry, 'click', function () { oDebugPane.removeChild(oDebugEntry); return false; });
				oDebugEntry.appendChild(oCloseDebugEntry);

				var list = Stack();

				if (list)
				{
					var stack = document.createElement("div");
					var h4 = document.createElement("h4");
					h4.appendChild(document.createTextNode("stack trace"));
					stack.appendChild(h4);
					list = list.splice(1, list.length - 1); // pop this function
					stack.appendChild(ListObject(list));
					var oStack = StackImage();
					addEvent(oStack, 'click', function () { if (oDebugEntry.lastChild == stack) { oDebugEntry.removeChild(stack); } else { oDebugEntry.appendChild(stack); } return false; });
					oDebugEntry.appendChild(oStack);
				}
			}

			if (typeof (debugEntry) == "object")
			{
				oDebugEntry.appendChild(debugEntry);
			}
			else if (debugEntry == null)
			{
				oDebugEntry.appendChild(document.createTextNode("null"));
			}
			else
			{
				if (cssClass == "xml")
				{
					oDebugEntry.appendChild(document.createTextNode(debugEntry));
				}
				else
				{
					oDebugEntry.appendChild(document.createTextNode(Escape(debugEntry)));
				}
			}

			oDebugPane.appendChild(oDebugEntry);

			var iLevel = 4;

			switch (cssClass)
			{
				case "error":
					iLevel = 0;
					break;
				case "warning":
					iLevel = 1;
					break;
				case "info":
					iLevel = 2;
					break;
				case "debug":
				case "xml":
					iLevel = 3;
					break;
			}

			if (iLevel <= iPopupLevel)
			{
				ShowWindow();
			}
		}
	}

	function CreateStyles()
	{
		var stylesheet =

			"#DebugPane {" +
				"position: absolute;" +
				"top: 0px;" +
				"left: 0px;" +
				"width: 800px;" +
				"background-color: #eec;" +
				"color: #000;" +
				"font-size: 9pt;" +
				"font-family: tahoma, arial, sans-serif;" +
				"border: 1px solid #000;" +
				"padding: 0px;" +
				"margin: 0px;" +
				"text-align: left;" +
				"z-index: 10001;" +
			"}" +

			"#DebugPane a {" +
				"color: #080;" +
			"}" +

			"#DebugPane div {" +
				"padding: 10px;" +
				"border: 1px solid #000;" +
				"margin: 3px;" +
				"max-height: 300px;" +
				"overflow: auto;" +
				"background-color: #fff;" +
			"}" +

			"#DebugPane div.error {" +
				"background-color: #fcc;" +
			"}" +

			"#DebugPane div.warning {" +
				"background-color: #ff8;" +
			"}" +

			"#DebugPane div.info {" +
				"background-color: #eef;" +
			"}" +

			"#DebugPane div.debug {" +
				"background-color: #ffd;" +
			"}" +

			"#DebugPane div.object {" +
				"background-color: #dfd;" +
			"}" +

			"#DebugPane div.xml {" +
				"background-color: #dfd;" +
			"}" +

			"#DebugPane div h4 {" +
				"padding: 0;" +
				"margin: 5px 0;" +
				"font-size: 1em;" +
			"}" +

			"#DebugPane div ul, #DebugPane div ol {" +
				"margin: 5px 0;" +
				"border-left: 2px solid blue;" +
				"list-style: none;" +
				"padding: 0 5px;" +
				"font-size: 9pt;" +
			"}" +

			"#DebugPane div ul li, #DebugPane div ol li {" +
				"font-size: 9pt;" +
				"margin-left: .5em;" +
			"}" +

			"#DebugPane input {" +
				"font-size: 8pt;" +
			"}" +

			"#DebugPane div.xml pre {" +
				"margin: 0;" +
				"font-size: 9pt;" +
			"}" +

			"#DebugPane div div {" +
				"border: 0;" +
				"border-top: 1px solid black;" +
				"margin: 0;" +
				"margin-top: 10px;" +
				"padding: 0;" +
				"background-color: transparent;" +
			"}" +

			"#DebugPane div.image {" +
				"border: 0;" +
				"margin: 0;" +
			"}" +

			"#DebugPane.no-data-uri div.image {" +
				"border: 1px solid black;" +
			"}" +

			"#DebugPane div.image.delete {" +
				"background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVQ4jZWSIQsCQRCF7w8JixcshrUIIiKChgsGg0EQwWIRDFc0CGLRpMVgsAg2je5fEUFEBN07FeEZTvduZW9PB17Z780wOzOGEQhGCRglMEJCyxklcLZrONu10qTljBLwzRK7TAy7TAx8s5RMUdwzrObY5+JCfDXHp+UwFmzCZJTgupjiUEgIXRdT5ds72fz+pskoAZ+NcSwlleKzcWiyXGQywMlKSeKTQWSyP+1RD+dyWpIz6mlX7CcPbVwqWaWcoa2/A7ffBq/mhdx+W/mmvINbtwW3VhS6dVtijWFMKvCwm7g3LNwbFh52MzgwU8Pl6T87dTw7ddW0o7hv0qwqinsmHfyB/x8vGRZmoDn0nyQAAAAASUVORK5CYII=);" +
				"float: right;" +
				"width: 16px;" +
				"height: 16px;" +
				"margin-left: 4px;" +
				"cursor: pointer;" +
			"}" +

			"#DebugPane div.image.refresh {" +
				"background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACBklEQVQ4jY2Sy2sTYRTFT4vgKkJjdRFRxG6VLgZxJ2inaWZi3ahRTH0UN+LGhQgF6cJHTWYmKS3iI2nExAeZDFpxEdEKQptY21iLcRJSmEkWRZeC/gXHxRhraFJz4XI35/zuPR8f0EbJEfyQNLAdbdManupheTXFvlAbkAEFulcBxTAohsABBRzPgtMLO/ip9oCHN4JIWgcTcz7O20NcqAX5sXaa89Ugc9YQYznQWNrGnDVGn9oEIqmg8WU/X1V2M226mC65qJdcTJsuPi1uYbwAZsytfFe5sh7gj3TevT3joW5t5th7cDgJnkk4ESQVnFgEDdvNl+YFik4EoRGggY9WwJEsKN7CtwOXcOOPSAAgHJ/solE6Rm+4iRkABqOgXwMPXkUMwF4A3bKGx0eizqmSgu9yZM0sR6D7NXAwuhalvs0DAN4wmDGP8sSkuy7YB0CQVCjeMH6OZJ2L/c3+hhgCnxfP0ah2caIAShrYHwLPJsCLz0A1D+rVTbw5s53itU6jwexTwTeVy8yU3Zz6DD5cBpNFMPXVmckiOL2yk0+WeimpHQSwax1gzrrOzHI3Y3lw1jrJnB1gvhrgh1qAeTvA+KxIWWvxmACEvhC4aN/hi4KH46/BU/fA4H1Q1sB+BTw0iretzA2Q8mqK5+M99U3/9p6NzH8hkgZKKn61I24JAdD7P9Fv7fsZJBSg78gAAAAASUVORK5CYII=);" +
				"float: right;" +
				"width: 16px;" +
				"height: 16px;" +
				"margin-left: 4px;" +
				"margin-top: -5px;" +
				"cursor: pointer;" +
			"}" +

			"#DebugPane div.image.evaluate {" +
				"background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA90lEQVQ4jc2QMUvDQABG7ycJgpskaeOoo2520f/hnQFFRZB2UXSxItg6ZchdwUFsDdJioAgtiEVBTUVdpOCi8FzsnouLb3/vg0+If8dM0AgLQYPcAU8ZmoM3pld0vogjDeHNkHryjCNzRBypOUlSpjYuqCWPuLYRV2mqnSHFchu/0uYwfvhypcke8ZRm7ypldr/L3EGX0nGP3fPbz8zHekpTiV+Yr/ZYOOqzdHrHzlnfLrB9+cpibUCpfk+5lY5/mMwYiFhvvbMcPrHVTPFklF0WQoiCigjiDzY7I1xbWQghiquGtetv++UxvjIjPzD55F8m/iJb8wMdtJjpjSDqrQAAAABJRU5ErkJggg==);" +
				"float: right;" +
				"width: 16px;" +
				"height: 16px;" +
				"margin-left: 4px;" +
				"cursor: pointer;" +
			"}" +

			"#DebugPane div.image.stack {" +
				"background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB4klEQVQ4jZ3RzU4aYRSA4W8HmJTYWPUGvIMutPfTpGlXbjujIIggvx0EqtDi0gsww0gTW+PGdKEJaZpuKEYYaptKAhRm+BF4u6B/hiYQTvLuTp6TfJ+wSZnDRXeWedcRD1wa82Ma7hyx6M5ikzKHYsGdZT9XJXlRIXlRITWm33v7uSoL7ixi1qmhFQyW03lW0nkejWklnWc5nUcrGMw6NcTMWoZpZ2Ytg7DKKgDFy8+Ui5fopSv0UomyrlMul++k6zrFYpGrQgEAq6z+BW6uy8w9O+Hk7TH+QBiPdxvHxibPpXXkdScut4ctnx9fIMTXL9ejQLXyDbNewWjUaDYbGKaJ2TJptVu02i3MlolhGNTqdSo330cBo15l7uk73p+doUTjBEIKHm8Ap9uDa3MLnz9EKBIlrMSo12r/ANIQaBs/oGvQv23T6/foDwYjj9Yf9Ol0OxjNxhCQVITlF0C3zf0nx+TOz0ns7vFCiRMIRvB4t/H6AgTDUZTYS2KJJLedDgCWOwC9yf9v0P8fAPcev+HTxw8kX6WJJ5JElB18/iD+UARlJ05iN8Ve6vWffYukImyyOnJg0rHJKsLu0KYG7A4NYV09OLU7NGyyikWaLJusYndoWFcPToUQYkkI8XDKln4CdoEDJC3gPsUAAAAASUVORK5CYII=);" +
				"float: right;" +
				"width: 16px;" +
				"height: 16px;" +
				"margin-left: 4px;" +
				"cursor: pointer;" +
			"}"
		;

		var oStyles = document.createElement("style");
		oStyles.type = "text/css";
		oStyles.media = "all";

		if (oStyles.styleSheet)
		{
			oStyles.styleSheet.cssText = stylesheet;
		}
		else
		{
			var cssText = document.createTextNode(stylesheet);
			oStyles.appendChild(cssText);
		}

		document.getElementsByTagName("head")[0].appendChild(oStyles);
	}

	function DeleteImage()
	{
		var img = document.createElement("div");
		img.title = img.alt = 'delete';
		img.className = 'image delete';
		return img;
	}

	function RefreshImage()
	{
		var img = document.createElement("div");
		img.title = img.alt = 'refresh';
		img.className = 'image refresh';
		return img;
	}

	function EvaluateImage()
	{
		var img = document.createElement("div");
		img.title = img.alt = 'evaluate';
		img.className = 'image evaluate';
		return img;
	}

	function StackImage()
	{
		var img = document.createElement("div");
		img.title = img.alt = 'stack trace';
		img.className = 'image stack';
		return img;
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
			var r = obj.attachEvent("on" + evType, fn);
			return r;
		}
		else
		{
			return false;
		}
	}

	function imgEvaluateClick(e)
	{
		if (!e) e = window.event;
		var trg = e.target ? e.target : e.srcElement;
		try
		{
			InspectObject(eval(trg.previousSibling.value), trg.previousSibling.value);
		}
		catch (ex)
		{
			Error(ex.message);
		}
	}

	function txtEvaluateThisKeyPress(e)
	{
		if (!e) e = window.event;

		var charCode = (e.charCode) ? e.charCode :
			((e.keyCode) ? e.keyCode :
			((e.which) ? e.which : 0));

		if (charCode == 13)
		{
			var trg = e.target ? e.target : e.srcElement;
			try
			{
				InspectObject(eval(trg.value), trg.value);
			}
			catch (ex)
			{
				Error(ex.message);
			}
		}
	}

	function debugKeyPress(e)
	{
		if (!Init()) return;

		var charCode = (e.charCode) ? e.charCode :
			((e.keyCode) ? e.keyCode :
			((e.which) ? e.which : 0));

		if (charCode == 96)
		{
			if (e.preventDefault) e.preventDefault();
			ToggleWindow();
			return false;
		}
	}

	addEvent(document, "keypress", debugKeyPress);

	addEvent(window, "error", ErrorHandler);

	return {
		ClearWindow: ClearWindow,
		Error: Error,
		HideWindow: HideWindow,
		Info: Info,
		InspectObject: InspectObject,
		ListCookies: ListCookies,
		ListCssIncludes: ListCssIncludes,
		ListJsIncludes: ListJsIncludes,
		RefreshCss: RefreshCss,
		RefreshJavaScript: RefreshJavaScript,
		ShowWindow: ShowWindow,
		ToggleFunctionView: ToggleFunctionView,
		ViewState: ViewState,
		Warning: Warning,
		Write: Write,
		Xml: Xml
	};

})();