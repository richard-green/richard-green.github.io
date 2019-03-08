; (function (document) {

    function addEvent(obj, evType, fn) {

        if (obj.addEventListener) {
            obj.addEventListener(evType, fn, false);
            return true;
        }
        else if (obj.attachEvent) {
            var r = obj.attachEvent("on" + evType, fn);
            return r;
        }
        else {
            return false;
        }
    }

    function refreshCss() {

        var list = document.getElementsByTagName("link");

        for (var i = 0; i < list.length; i++) {
            if (list[i].rel.toLowerCase() == "stylesheet" && list[i].href) {
                list[i].href = randomize(list[i].href);
            }
        }

        return false;
    }

    function randomize(url) {

        var urlqs = new RegExp("([^\?]+)([\?](.*))?"); // url and querystring groups
        var baseurl = url.replace(urlqs, "$1");
        var qs = url.replace(urlqs, "$3");
        var rndqs = "rnd=" + Math.random();

        if (qs) {
            var rnd = new RegExp("(?:[^=]+=[^&]+&)?(rnd=[^&]+)(?:&.*)?");
            if (rnd.test(qs)) {
                rnd = qs.replace(rnd, "$1");
                qs = qs.replace(rnd, rndqs);
            }
            else {
                qs = qs + "&" + rndqs;
            }
            url = baseurl + "?" + qs;
        }
        else {
            url = baseurl + "?" + rndqs;
        }

        return url;
    }

    function keyListener(e) {

        var charCode = (e.charCode) ? e.charCode :
			((e.keyCode) ? e.keyCode :
			((e.which) ? e.which : 0));

        if (charCode == 96 && e.ctrlKey) {
            if (e.preventDefault) e.preventDefault();
            refreshCss();
            return false;
        }
    }

    addEvent(document, "keypress", keyListener);

})(document);
