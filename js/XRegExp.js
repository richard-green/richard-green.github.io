if(!window.XRegExp){var XRegExp;(function(){XRegExp=function(pattern,flags){if(XRegExp.isRegExp(pattern)){if(flags!==undefined)
throw TypeError("can't supply flags when constructing one RegExp from another");return pattern.addFlags("");}
if(runningTokens)
throw Error("can't call the XRegExp constructor within token definition functions");var flags=flags||"",output=[],pos=0,currScope=XRegExp.OUTSIDE_CLASS,thisRegex={hasNamedCapture:false,captureNames:[],hasFlag:function(flag){if(flag.length>1)
throw SyntaxError("flag can't be more than one character");return flags.indexOf(flag)>-1;}}, tokenResult,match,chr,regex;while(pos<pattern.length){tokenResult=runTokens(pattern,pos,currScope,thisRegex);if(tokenResult){output.push(tokenResult.output);pos+=Math.max(tokenResult.matchLength,1);}else{chr=pattern.charAt(pos);if(match=real.exec.call(nativeTokens[currScope],pattern.slice(pos))){output.push(match[0]);pos+=match[0].length;}else{if(chr==="[")currScope=XRegExp.INSIDE_CLASS;else if(chr==="]")currScope=XRegExp.OUTSIDE_CLASS;output.push(chr);pos++;}}}
regex=RegExp(output.join(""),real.replace.call(flags,/[^gimy]+/g,""));regex._xregexp={source:pattern,captureNames:thisRegex.hasNamedCapture?thisRegex.captureNames:null};return regex;};var replacementToken=/\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g,compliantExecNpcg=/()??/.exec("")[1]===undefined,compliantLastIndexIncrement=function(){var x=/^/g;x.test("");return!x.lastIndex;}(),compliantLastIndexReset=function(){ var x=/x/g;"x".replace(x,"");return!x.lastIndex;}(),real={exec:RegExp.prototype.exec,match:String.prototype.match,replace:String.prototype.replace,split:String.prototype.split,test:RegExp.prototype.test},runTokens=function(pattern,index,scope,context){var i=tokens.length,result,t,m;runningTokens=true;while(i--){t=tokens[i];if((scope&t.scope)&&(!t.trigger||t.trigger.call(context))){t.pattern.lastIndex=index;m=t.pattern.exec(pattern);if(m&&m.index===index){result={output:t.handler.call(context,m,scope),matchLength:m[0].length};break;}}}
runningTokens=false;return result;},runningTokens=false,nativeTokens={},tokens=[];XRegExp.INSIDE_CLASS=1;XRegExp.OUTSIDE_CLASS=2;nativeTokens[XRegExp.INSIDE_CLASS]=/^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/;nativeTokens[XRegExp.OUTSIDE_CLASS]=/^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/;XRegExp.addToken=function(pattern,handler,scope,trigger){tokens.push({pattern:XRegExp(pattern).addFlags("g"),handler:handler,scope:scope||XRegExp.OUTSIDE_CLASS,trigger:trigger||null});};
RegExp.prototype.exec=function(str){var match=real.exec.apply(this,arguments),name,r2;if(match){if(!compliantExecNpcg&&match.length>1&&XRegExp._indexOf(match,"")>-1){r2=RegExp("^"+this.source+"$(?!\\s)",XRegExp._getNativeFlags(this));real.replace.call(match[0],r2,function(){for(var i=1;i<arguments.length-2;i++){if(arguments[i]===undefined)
match[i]=undefined;}});}
if(this._xregexp&&this._xregexp.captureNames){for(var i=1;i<match.length;i++){name=this._xregexp.captureNames[i-1];if(name)
match[name]=match[i];}}
if(!compliantLastIndexIncrement&&this.global&&this.lastIndex>(match.index+match[0].length))
this.lastIndex--;}
return match;};if(!compliantLastIndexIncrement){RegExp.prototype.test=function(str){//
var match=real.exec.call(this,str);if(match&&this.global&&this.lastIndex>(match.index+match[0].length))
this.lastIndex--;return!!match;};}
String.prototype.match=function(regex){if(!XRegExp.isRegExp(regex))
regex=RegExp(regex);if(regex.global){var result=real.match.apply(this,arguments);regex.lastIndex=0;return result;}
return regex.exec(this);};String.prototype.replace=function(search,replacement){var isRegex=XRegExp.isRegExp(search),captureNames,result,str;if(isRegex&&typeof replacement.valueOf()==="string"&&replacement.indexOf("${")===-1&&compliantLastIndexReset)
return real.replace.apply(this,arguments);if(!isRegex)
search=search+""; else if(search._xregexp)
captureNames=search._xregexp.captureNames;if(typeof replacement==="function"){result=real.replace.call(this,search,function(){if(captureNames){
arguments[0]=new String(arguments[0]);for(var i=0;i<captureNames.length;i++){if(captureNames[i])
arguments[0][captureNames[i]]=arguments[i+1];}}
if(isRegex&&search.global)
search.lastIndex=arguments[arguments.length-2]+arguments[0].length;return replacement.apply(window,arguments);});}else{str=this+"";result=real.replace.call(str,search,function(){var args=arguments;return real.replace.call(replacement,replacementToken,function($0,$1,$2){if($1){switch($1){case "$":return "$";case "&":return args[0];case "`":return args[args.length-1].slice(0,args[args.length-2]);case "'":return args[args.length-1].slice(args[args.length-2]+args[0].length);default://
var literalNumbers="";$1=+$1;if(!$1)
return $0;while($1>args.length-3){literalNumbers=String.prototype.slice.call($1,-1)+literalNumbers;$1=Math.floor($1/10);}
return($1?args[$1]:"$")+literalNumbers;}}else{var n=+$2;//
if(n<=args.length-3)
return args[n];n=captureNames?XRegExp._indexOf(captureNames,$2):-1;return n>-1?args[n+1]:$0;}});});}
if(isRegex&&search.global)
search.lastIndex=0;return result;};String.prototype.split=function(s,limit){if(!XRegExp.isRegExp(s))
return real.split.apply(this,arguments);var str=this+"",output=[],lastLastIndex=0,match,lastLength;if(limit===undefined||+limit<0){limit=Infinity;}else{limit=Math.floor(+limit);if(!limit)
return[];}
s=s.addFlags("g");//
while(match=s.exec(str)){if(s.lastIndex>lastLastIndex){output.push(str.slice(lastLastIndex,match.index));if(match.length>1&&match.index<str.length)
Array.prototype.push.apply(output,match.slice(1));lastLength=match[0].length;lastLastIndex=s.lastIndex;if(output.length>=limit)
break;}
if(!match[0].length)
s.lastIndex++;}
if(lastLastIndex===str.length){if(!real.test.call(s,"")||lastLength)
output.push("");}else{output.push(str.slice(lastLastIndex));}
return output.length>limit?output.slice(0,limit):output;};})();RegExp.prototype.addFlags=function(flags){var regex=XRegExp(this.source,(flags||"")+XRegExp._getNativeFlags(this)),x=this._xregexp;if(x){regex._xregexp={source:x.source,captureNames:x.captureNames?x.captureNames.slice(0):null};}
return regex;};RegExp.prototype.apply=function(context,args){return this.exec(args[0]);};//
RegExp.prototype.call=function(context,str){return this.exec(str);};RegExp.prototype.execAll=function(str){var regex=this.addFlags("g"),result=[],match;while(match=regex.exec(str)){result.push(match);if(!match[0].length)
regex.lastIndex++;}
if(this.global)
this.lastIndex=0;return result;};RegExp.prototype.forEachExec=function(str,callback,context){var regex=this.addFlags("g"),i=-1,match;while(match=regex.exec(str)){callback.call(context,match,++i,str,regex);if(!match[0].length)
regex.lastIndex++;}
if(this.global)
this.lastIndex=0;};
RegExp.prototype.validate=function(str){var regex=RegExp("^(?:"+this.source+")$(?!\\s)",XRegExp._getNativeFlags(this));if(this.global)
this.lastIndex=0;return str.search(regex)===0;};XRegExp.cache=function(pattern,flags){var key="/"+pattern+"/"+(flags||"");return XRegExp.cache[key]||(XRegExp.cache[key]=XRegExp(pattern,flags));};XRegExp.escape=function(str){return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g,"\\$&");};XRegExp.freezeTokens=function(){XRegExp.addToken=null;};//
XRegExp.isRegExp=function(o){return Object.prototype.toString.call(o)==="[object RegExp]";};XRegExp.matchWithinChain=function(str,regexes,detailMode){var match;function recurse(values,level){var regex=regexes[level].addFlags("g"),result=[],matches,i,j;for(i=0;i<values.length;i++){if(detailMode){matches=regex.execAll(values[i][0]);for(j=0;j<matches.length;j++)
matches[j].index+=values[i].index;}else{matches=values[i].match(regex);}
if(matches)
result.push(matches);}
result=Array.prototype.concat.apply([],result);if(regexes[level].global)
regexes[level].lastIndex=0;return level===regexes.length-1?result:recurse(result,level+1);};if(detailMode)
match={"0":str,index:0};return recurse([detailMode?match:str],0);};XRegExp._getNativeFlags=function(regex){return(regex.global?"g":"")+(regex.ignoreCase?"i":"")+(regex.multiline?"m":"")+(regex.extended?"x":"")+(regex.sticky?"y":"");};XRegExp._indexOf=function(array,item,from){for(var i=from||0;i<array.length;i++)
if(array[i]===item)return i;return-1;};(function(){var quantifier=/^(?:[?*+]|{\d+(?:,\d*)?})\??/;XRegExp.addToken(/\(\?#[^)]*\)/,function(match){return quantifier.test(match.input.slice(match.index+match[0].length))?"":"(?:)";});XRegExp.addToken(/\((?!\?)/,function(){this.captureNames.push(null);return "(";});//
XRegExp.addToken(/\(\?<([$\w]+)>/,function(match){this.captureNames.push(match[1]);this.hasNamedCapture=true;return "(";});XRegExp.addToken(/\\k<([\w$]+)>/,function(match){var index=XRegExp._indexOf(this.captureNames,match[1]);return index>-1?"\\"+(index+1)+(isNaN(match.input.charAt(match.index+match[0].length))?"":"(?:)"):match[0];});XRegExp.addToken(/\[\^?]/,function(match){return match[0]==="[]"?"\\b\\B":"[\\s\\S]";});XRegExp.addToken(/(?:\s+|#.*)+/,function(match){return quantifier.test(match.input.slice(match.index+match[0].length))?"":"(?:)";},XRegExp.OUTSIDE_CLASS,function(){return this.hasFlag("x");});XRegExp.addToken(/\./,function(){return "[\\s\\S]";},XRegExp.OUTSIDE_CLASS,function(){return this.hasFlag("s");});})(); XRegExp.version="1.1.0";}
