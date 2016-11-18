// Globals to keep track of all elements
var Blocks = new Map(), // map of all Blocks in the form of id:object
	AllContent = new Map(); // map of all Content in the form of id:object

// Unique identifiers for elements
var idcounter = 0;
var is_exist = 0;
function genID(prefix) 
{
	idcounter++;
  return prefix + idcounter;
}

// DOM helpers
function addToBlock(id,type,cond)
{
	if (id == "") return;
	var p = Blocks.get(id);

	if (p.type == "") { // add to simple block
		// convert p to type and migrate p's content to a child
		p.setType(type);
		var np = new Block("",p,p.content); // make new simple block
		p.setContent(""); // clear out p and attach child

		// make new child for the actual block to add
		var n = new Block("",p,cond);
	} else if (p.type == type) { // jut add a child to existing block of same type
		var n = new Block("",p,cond);		
	} else {
		console.error("Illegal block type extension: " + p.id + " is " + p.type + " and cannot have " + type + " children.");
	}
}

function removeBlock(id)
{
	if (id == "") return;
	var p = Blocks.get(id);
	var pp = p.parent;
	if (pp != null) {
		pp.removeChild(p);
		console.log("Removing child: " + p.id + " from parent: " + pp.id);
		redraw();
	}
}

function removeAllBlock()
{
  var id = idcounter;
  while(id != 0)
  {
    var remove_id = "BL" + id;
    removeBlock(remove_id);
    id--;
  }
  idcounter = 0;
}

function negateBlock(id)
{
	if (id == "") return;
	var b = Blocks.get(id);
	b.complement();
	redraw();
}


function exist()
{
   var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./working.txt", false);
    rawFile.send();
    var allText = rawFile.responseText;

    if(allText == '0')
    {
        if(is_exist == 0)
        {
          alert("successfully submitted.");
          is_exist = 1;
          return false;

        }
        else
        {
          alert("someone is running the app. Please wait...");
          return true;
        }
    }
    else
    {
      alert("someone is running the app. Please wait...");
      is_exist = 0;
      return true;
    }
}

function addtext1()
{
  var text = document.getElementById("text");
  text.innerHTML = "Search for number of patients who are: <br/><br/>in pic-sure: not female, with mean diastolic blood pressure less than or equal to 90 mmHg, <br/>and with mean systolicn blood pressure less than or equal to 130 mmHg, <br/>with a BMI less than or equal to 25 kg/m^2, and is white <br/><br/>in md2k: with blood glucose level greater than 110 mg/dL, with systolic blood pressure less than or equal to 110 mmHg,<br/>or with body fat percentage level greater than 16%<br/><br/>in ga4gh: at chromosome chr17, at position 35098007, <br/> with ALT A, and with assemblyid NCBI37";
}

function addtext2()
{
  var text = document.getElementById("text");
  text.innerHTML = "Search for number of patients who are:<br/><br/>in pic-sure: Systolic blood pressure less than 100 mmHg<br/><br/>in md2k: body temperature greater than 100.4F/38C or sleep duration less than 6 hours, <br/>or glucose level greater than or equal to 110 mg/dL. <br><br>in ga4gh: at chromosome chr17, at position 35098007, <br/> with ALT A, and with assemblyid NCBI37 ";
}
function addtext3()
{
  var text = document.getElementById("text");
  text.innerHTML = "Search for number of patients who are: <br/><br/>in pic-sure: with uric acid level between 3.5 and 7.2 mg/dL, <br/>or with total cholesterol level less than or equal to 200 mg/dL,<br/>or with a BMI between 20 and 30 kg/m^2<br/><br/>in md2k: with glucose level between 100 and 125 mg/dL,<br/><br/>in ga4gh: at chromosome chr17, at position 35098007, <br/> with ALT A, and with assemblyid NCBI37";
}

function redraw()
{
  var tmp, initial = Blocks.get("BL1");

	var query = document.getElementById("query");
  while (tmp = query.lastChild) query.removeChild(tmp);
	query.appendChild(initial.makeDOM());

	var sql = document.getElementById("sql");
  while (tmp = sql.lastChild) sql.removeChild(tmp);
	sql.appendChild(document.createTextNode("Serialized query: " + initial.serialize()));	
}


function dialogOpen(type,parent,content)
{
	var tmp, m = document.getElementById("modal");

	var d = document.getElementById("menu");
  //while (tmp = d.lastChild) d.removeChild(tmp);

  var tmp = document.getElementById("cparent");
  tmp.value = parent;

	tmp = document.getElementById("ctype");
  tmp.value = type;

  if (content === undefined) {
    content = "new";
  }
  tmp = document.getElementById("dialogtitle");
  tmp.innerHTML = parent + ": Add " + type + " condition: <span id='dialogselected'>" + content + "</span>";
  var tul = document.createElement("ul");
  tul.setAttribute("id","menu");
	Object.keys(ContentTemplate).forEach(function(item) { 
		var tli = document.createElement("li");
		tli.className = item;
		var a = document.createElement("a");
		a.setAttribute("href","#");
		a.appendChild(document.createTextNode(item));
		tli.appendChild(a);

		//var s = document.createElement("div");
		//s.className = item;

		var sul = document.createElement("ul");
		sul.className = item;
		Object.keys(ContentTemplate[item]).forEach(function(o) { 
			var od = document.createElement("li");
			od.className = item;
			var oda = document.createElement("a");
			oda.setAttribute("href","#");
			oda.style.display = "inline-block";
			oda.appendChild(document.createTextNode(o));
			od.appendChild(oda);			
			if (ContentTemplate[item][o] == "") { // simple operators
				var options = ['???', '<','<=','=','>=','>','!='], 
					os = document.createElement("select");
					os.setAttribute("item",item + "." + o);
					os.onchange = function() { prepCond("cond1",this.getAttribute("item") + " " + this.value); }
 				options.forEach(function(item) { var oo = document.createElement("option"); oo.text = item; os.add(oo); });
				od.appendChild(os);
				var ot = document.createElement("input");
				ot.setAttribute("type","text");
				ot.onchange = function() { prepCond("cond2",this.value); }
				od.appendChild(ot);
			} else { // limited range of values
				var options = ContentTemplate[item][o], 
					os = document.createElement("select");
 				var oo = document.createElement("option"); oo.text = ""; os.add(oo);
 				options.forEach(function(item) { oo = document.createElement("option"); oo.text = item; os.add(oo); });
				od.appendChild(os);
			}
			sul.appendChild(od);
		});
		tli.appendChild(sul);
		tul.appendChild(tli); 
	});

	d.appendChild(tul);
	m.style.display = "block";

}

function prepCond(x,y)
{
	var d = document.getElementById(x);
	d.value = y;
	modalTitleUpdate();
}

function modalTitleUpdate()
{
	var cond1 = document.getElementById("cond1").value,
		cond2 = document.getElementById("cond2").value,
	title = document.getElementById("dialogselected");
	cond1 = (cond1 === undefined) ? " ??? " : cond1;
	cond2 = (cond2 === undefined) ? " ??? " : cond2;
	title.innerHTML = cond1 + " '" + cond2 + "'";
}

function dialogClose(mode)
{
	var tmp, d = document.getElementById("modal");
	d.style.display = "none";
	d = document.getElementById("menu");
  while (tmp = d.lastChild) d.removeChild(tmp);
	if (mode) {
		var cond1 = document.getElementById("cond1"),
			cond2 = document.getElementById("cond2"),
			p = document.getElementById("cparent").value,
			type = document.getElementById("ctype").value;
	
		if (cond1.value != "" && cond2.value != "" && p != "") {
			addToBlock(p,type,cond1.value + " '" + cond2.value + "'");
		}
		cond1.value = "";
		cond2.value = "";
	}
	redraw();
}


/******** Basic Blocks ****************/

function Block(t,p,c)
{
	this.id = genID("BL");
	Blocks.set(this.id,this); 
	this.type = t; // standard AND , OR operators
	this.neg = false;
	this.content = c;
	this.children = [];
	this.parent = p;
	if (p != null) { 
		p.addChild(this);
		console.log("Adding to parent: " + p.id + " block " + this.id + " type: " +  this.type + " content " +  this.content);
	}
}

Block.prototype = {
	constructor: Block,

	addChild: function(b) {
		this.children.push(b);
		b.setParent(this);
	},

	removeChild: function(c) {
		var i = this.children.indexOf(c);
		if (i > -1) {
			this.children.splice(i,1);
		}
		Blocks.set(c.id,"");
	},

	setParent: function(p) {
		this.parent = p;
	},

	setContent: function(c) {
		this.content = c;
	},

	setType: function(t) {
		this.type = t;
	},

	complement: function() {
		this.neg = ! this.neg;
	},

	serialize: function() {
		if (this.children.length > 0) { // composite block
			var x = ( this.neg ? "NOT (" : "(" ) +  ((this.content != "") ? this.content + " " + this.type + " "  : "") + this.children[0].serialize();
			for (var i = 1; i < this.children.length; i++) {
				x = x + " " + this.type + " " + this.children[i].serialize();
			}
			x = x + ") ";
			return x;
		}
		else { // simple block
			return (this.neg ? "NOT " : "") + this.content;
		}
	},

	makeDOM: function() {
		var x = document.createElement("div");
		x.setAttribute("id", this.id);
		x.className = "block " + ((this.type != "") ? this.type.toLowerCase() : this.content.substr(0,this.content.indexOf("."))) + (this.neg ? " not" : "");

		var c = document.createElement("div");
		c.className = "content";
		// delete button
		var d = document.createElement("div");
		d.className = "bdel";
		d.setAttribute("parent", this.id);
		d.appendChild(document.createTextNode("x"));
		d.onclick = function() { removeBlock(this.getAttribute("parent")); };
		x.appendChild(d);
		// negate button
		var n = document.createElement("div");
		n.className = "bnot";
		n.setAttribute("parent", this.id);
		n.appendChild(document.createTextNode("!"));
		n.onclick = function() { negateBlock(this.getAttribute("parent")); };
		x.appendChild(n);


		// add content
		c.appendChild(document.createTextNode(this.content));
		x.appendChild(c); 

		// add content from children
		if (this.children.length > 0) { // composite block
			for (var i = 0; i < this.children.length; i++) {
				x.appendChild(this.children[i].makeDOM());
				// add delimiter symbol AND/OR
				if (i < this.children.length - 1) {
					var symbol = document.createElement("div");
					symbol.className = "s" + this.type.toLowerCase();
					symbol.appendChild(document.createTextNode(this.type));
					x.appendChild(symbol);
				}
			}
		}
		// add buttons
		var pp = this.parent;
//		if (pp == null || pp.type != "OR") {
		if ((this.type == "" && pp.type != "OR") || (this.type == "OR") ) {
			console.log("ID: " + this.id + " Type: " + this.type + (pp != null ? " Parent: " + pp.id + " Type: " + pp.type : " no parent"));
			var	b = document.createElement("div");
			b.setAttribute("parent",this.id);
			b.setAttribute("cond","or");		
			b.onclick = function() { dialogOpen("OR",this.getAttribute("parent"),this.content); };
			b.className = "bor";
			b.appendChild(document.createTextNode("\u25BA"));				
			x.appendChild(b);
		}

//		if (pp == null || pp.type != "AND") {
		if ((this.type == "" && pp.type != "AND") || (this.type == "AND") ) {
			b = document.createElement("div");
			b.setAttribute("parent",this.id);
			b.setAttribute("cond","and");		
			b.onclick = function() { dialogOpen("AND",this.getAttribute("parent"),this.content); };
			b.className = "band";
			b.appendChild(document.createTextNode("\u25BC"));
			x.appendChild(b);
		}		
		return x;
	}

}


/************** Content providers  ************/

/////////////// select dropdowns
function ContentSelector(decorationclass,options)
{
	this.id = genID("CS");
	AllContent.set(this.id,this);
	this.decoration = decorationclass;
	this.options = options;
	this.selected = "";
}

ContentSelector.prototype = {
	constructor: ContentSelector,

	serialize: function() {
		var t = document.getElementById(this.id);
		if (t) {
			this.selected = t.value;
		}		
		return this.selected;
	},

	makeDOM: function() {
		var t = document.createElement("select");
		t.setAttribute("id",this.id);
		t.className = this.decoration;
		this.options.forEach(function(item) { var o = document.createElement("option"); o.text = item; t.add(o); });
		return t;
	}
}

////////////////// text inputs
function ContentTextInput(decorationclass,label)
{
	this.id = genID("CT");
	AllContent.set(this.id,this);
	this.decoration = decorationclass;
	this.label = label;
	this.value = "null";
}

ContentTextInput.prototype = {
	constructor: ContentTextInput,

	serialize: function() {
		var t = document.getElementById(this.id);
		if (t) {
			this.value = t.value;
		}		
		return this.label + " :: " + this.value;
	},

	makeDOM: function() {
		var s = document.createElement("span");
		var l = document.createElement("label");
		l.setAttribute("for",this.id);
		l.addChild(document.createTextNode(this.label));
		var t = document.createElement("input");
		t.setAttribute("id",this.id);
		t.setAttribute("type","text");
		t.className = this.decoration;
		s.addChild(l);
		s.addChild(t);
		return s;
	}
}

/////////////////// range selectors
function ContentRange(decorationclass,min,max)
{
	this.id = genID("CR");
	AllContent.set(this.id,this);
	this.decoration = decorationclass;
	this.min = min;
	this.max = max;
	this.value = "";
}

ContentRange.prototype = {
	constructor: ContentRange,

	serialize: function() {
		var t = document.getElementById(this.id);
		if (t) {
			this.value = t.value;
		}		
		return this.value;
	},

	makeDOM: function() {
		var t = document.createElement("input");
		t.setAttribute("id",this.id);
		t.setAttribute("type","range");
		t.min = this.min;
		t.max = this.max;
		t.className = this.decoration;
		return t;
	}
}

/************** ComparisonOperator provider  ************/

function ComparisonOperator(type)
{
	this.id = genID("OP");
	AllContent.set(this.id,this);
	this.type = type;
}

ComparisonOperator.prototype = {
	constructor: ComparisonOperator,

	serialize: function() {
		var t = document.getElementById(this.id);
		if (t) {
			this.type = t.value;
		}		
		return this.type;
	},

	makeDOM: function() {
		var t = document.createElement("select");
		t.setAttribute("id",this.id);
		var options = ['<','<=','=','>=','>','!='];
		options.forEach(function(item) { var o = document.createElement("option"); o.text = item; t.add(o); });
		return t;
	}
}


/******************* Comparison triplet: key ? value ***********/

function Comparison(content,operator,value)
{
	this.id = genID("OP");
	AllContent.set(this.id,this);
	this.content = content;
	this.operator = operator;
	this.value = value;
}

Comparison.prototype = {
	constructor: Comparison,

	serialize: function() {
		return this.content.serialize() + " " + this.operator.serialize() + " " + this.value;
	},

	makeDOM: function() {
		var c = document.createElement("div");
		c.setAttribute("id",this.id);
		c.appendChild(this.content.makeDOM());
		c.appendChild(this.operator.makeDOM());
		c.appendChild(document.createTextNode(value));
		return c;
	}
}
