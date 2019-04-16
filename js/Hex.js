function binToHex(bin)
{
	if (bin.length == 0 || bin.length % 4 > 0)
	{
		return "";
	}
	var sOut = "";
	for (var i=0; i<bin.length; i+=4)
	{
		sOut += decToHex(parseInt(bin.substr(i,4),2));
	}
	return sOut;
}

function hexToBin(hex)
{
	if (hex.length == 0)
	{
		return "";
	}
	var sOut = "";
	for (var i=0; i<hex.length; i++)
	{
		sOut += decToBin(parseInt(hex.substr(i,1),16));
	}
	return sOut;
}

function decToBin(dec)
{
	var bin = new Array(
		"0000", "0001", "0010", "0011",
		"0100", "0101", "0110", "0111",
		"1000", "1001", "1010", "1011",
		"1100", "1101", "1110", "1111");
	var sOut = "";
	if (dec > 0 && dec < 16)
	{
		sOut = bin[dec];
	}
	else
	{
		sOut = "0000";
	}
	return sOut;
}

function decToHex(dec)
{
	var hex = new Array(
		'0', '1', '2', '3',
		'4', '5', '6', '7',
		'8', '9', 'a', 'b',
		'c', 'd', 'e', 'f');
	var sOut = "";
	if (dec > 0 && dec < 16)
	{
		sOut = hex[dec];
	}
	else
	{
		sOut = "0";
	}
	return sOut;
}

function convertAsciiToHex(str)
{
	var sOut = "";
	for (var i=0; i<str.length; i++)
	{
		sOut += decToHex(parseInt(str.charCodeAt(i) / 16)) + decToHex(str.charCodeAt(i) % 16);
	}
	return sOut;
}

function convertHexToAscii(str)
{
	str = str.replace(/ \r\n/g,'');
	if (str.length == 0 || str.length % 2 == 1)
	{
		return "";
	}
	var sOut = "";
	for (var i = 0; i < str.length; i+=2)
	{
		sOut += unescape("%" + str.substr(i,2));
	}
	return sOut;
}

function hexCalcNOT(str1)
{
	return binToHex(binCalcNOT(hexToBin(str1)));
}

function hexCalcOR(str1, str2)
{
	return binToHex(binCalcOR(hexToBin(str1), hexToBin(str2)));
}

function hexCalcAND(str1, str2)
{
	return binToHex(binCalcAND(hexToBin(str1), hexToBin(str2)));
}

function hexCalcXOR(str1, str2)
{
	return binToHex(binCalcXOR(hexToBin(str1), hexToBin(str2)));
}

function binCalcNOT(str1)
{
	if (str1.length == 0)
	{
		return "";
	}
	var sOut = "";
	for (var i=0; i<str1.length; i++)
	{
		sOut += ~parseInt(str1.charAt(i),2) + 2;
	}
	return sOut;
}

function binCalcOR(str1, str2)
{
	if (str1.length == 0 || str1.length != str2.length)
	{
		return "";
	}
	var sOut = "";
	for (var i=0; i<str1.length; i++)
	{
		sOut += parseInt(str1.charAt(i),2) | parseInt(str2.charAt(i),2)
	}
	return sOut;
}

function binCalcAND(str1, str2)
{
	if (str1.length == 0 || str1.length != str2.length)
	{
		return "";
	}
	var sOut = "";
	for (var i=0; i<str1.length; i++)
	{
		sOut += parseInt(str1.charAt(i),2) & parseInt(str2.charAt(i),2);
	}
	return sOut;
}

function binCalcXOR(str1, str2)
{
	if (str1.length == 0 || str1.length != str2.length)
	{
		return "";
	}
	var sOut = "";
	for (var i=0; i<str1.length; i++)
	{
		sOut += parseInt(str1.charAt(i),2) ^ parseInt(str2.charAt(i),2)
	}
	return sOut;
}
