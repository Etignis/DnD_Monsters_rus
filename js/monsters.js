var TENTACULUS_APP_VERSION = "2.1.0";

var oConfig = {}; // global app config data
function setConfig(prop, val) {
	if(prop && val != undefined && oConfig) {
		oConfig[prop] = val;
		localStorage.setItem("configMonsters", JSON.stringify(oConfig));
	}
}
function getConfig(prop) {
	oConfig = JSON.parse(localStorage.getItem("configMonsters")) || {};
	if(prop!=undefined) {
		return localStorage.getItem("configMonsters")? oConfig[prop] : {};
	}
	return oConfig;
}
function count_mod(num){
	var mod=Math.floor((num-10)/2);
	if(mod>0)
		mod="+"+mod;
	num = num+"&nbsp;("+mod+")";
	return num;
}
function c_string(clas, s_clas, title, cont){
	var string ='';
	if(cont != '' && cont != undefined)
		string = '<div class="'+clas+' i4-tipe"><span class="'+s_clas+'">'+title+'</span>'+cont+'</div>';
	return string;
}

function ToNormalFraction(sFraction) {
	if(/\d+\/\d+/.test(sFraction))
		return eval(sFraction);
	if(/\d+/.test(sFraction))
		return Number(sFraction);
	return sFraction;
}

function getCardView() {
	var sView = $("#ViewSegmented input:radio:checked").val();
	var sClass = "";
	switch (sView){
		case "card":
			sClass = "monster_card";
			break;
		default:
			sClass = "monster";
	}
	return sClass;
}

// function isInViewport (elem) {
	// var bounding = elem.getBoundingClientRect();
	// return (
		// bounding.top >= 0 &&
		// bounding.left >= 0 &&
		// bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		// bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
	// );
// };
$.fn.isInViewport = function() {
	var elementTop = $(this).offset().top;
	var elementBottom = elementTop + $(this).outerHeight();
	var viewportTop = $(window).scrollTop();
	var viewportBottom = viewportTop + $(window).height();
	return elementBottom > viewportTop && elementTop < viewportBottom;
};

$(document).ready(function(){
	var monsterLevels = [];
	var monsterTypes = [];
	var aHiddenMonsters = [];

	var oTimer; // for TimeOut (filtering)
	var nTimerSeconds = 100;
	var oImageLoadingTimer;

	var aHiddenMonsters = [];
	var aLockedMonsters = {};
	var filteredMonsters = [];

	var oSource = {};

	$("body").on("load", ".beautifullDescription img", function(){
		debugger;
		while ($(this).height() > $(this).closest(".monster").height()-50) {
			var nWidth = $(this).width();
			$(this).width(nWidth-10);
		}
	});
	
	function translateCR(str){
		str = String(eval(str)*1000);
		while (str.length<7) {
			str = "0" + str;
		}
		return str;
	}

	function arrDiff(arr1, arr2) {
		var arr3 = arr2;//.map(function(item){return item.en});
		return arr1.filter(
			function(item){
				return (arr3.indexOf(item.name.toLowerCase())>=0)? false: true;
			}
		);
	}

	function removeFromArr(arr, el) {
		var index;

		for (var i=0; i<arr.length; i++) {
			if(arr[i] == el) {
				index = i;
				break;
			}
		}
		arr.splice(i, 1);
		return arr
	}

	function getViewPortSize(mod) {
		var viewportwidth;
		var viewportheight;

		//Standards compliant browsers (mozilla/netscape/opera/IE7)
		if (typeof window.innerWidth != 'undefined')
		{
			viewportwidth = window.innerWidth,
			viewportheight = window.innerHeight
		}

		// IE6
		else if (typeof document.documentElement != 'undefined'
		&& typeof document.documentElement.clientWidth !=
		'undefined' && document.documentElement.clientWidth != 0)
		{
			viewportwidth = document.documentElement.clientWidth,
			viewportheight = document.documentElement.clientHeight
		}

		//Older IE
		else
		{
			viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
			viewportheight = document.getElementsByTagName('body')[0].clientHeight
		}

		if(mod=="width")
			return viewportwidth;

		return viewportwidth + "~" + viewportheight;
	}

	function createSegmentedButton(src, params) {
		var ret = '';
		var id =  params.id? "id='"+params.id+"'": "";
		var mode = params.mode || "fix";
		var subtypes = params.subtypes || false;

		var name = new Date().getTime();
		if(params.id) {
			var name = params.id;
		}

		var modeClass = " class='mode_"+mode+"' ";

		function getOption(el) {
			var sOptionValue, sOptionLabel;
			if(typeof el == "number" || typeof el == "string") {
				sOptionValue = sOptionLabel = el;
			} else {
				sOptionValue = el.key;
				sOptionLabel = el.title;
			}

			var selected = el.selected? " checked " : "";

			return "<input "+selected+" name='"+name+"' type='radio' value='"+sOptionValue+"' id='tg_"+sOptionValue+"'><label for='tg_"+sOptionValue+"' "+modeClass+" data-hierarchy='root'>"+sOptionLabel+"</label>";
		}

		var oItems = [];
		for (var i =0; i < src.length; i++) {
			var type = src[i];

			var key = (typeof type == "number" || typeof type == "string")? type: type.key;
			oItems[key] = type;

		}

		for(var i in oItems) {
			ret+= getOption(oItems[i]);
		}
		ret = "<div "+id+" class='segmented_button'>"+ret+"</div>";
		return ret;
	}

	function createToggle(src, params) {
		var ret = '';
		var id =  params.id? "id='"+params.id+"'": "";
		var mode = params.mode || "fix";
		var subtypes = params.subtypes || false;

		var modeClass = " class='mode_"+mode+"' ";

		function getOption(el, elParent) {
			var sOptionValue, sOptionLabel;
			if(typeof el == "number" || typeof el == "string") {
				sOptionValue = sOptionLabel = el;
			} else {
				sOptionValue = el.key;
				sOptionLabel = el.title;
			}

			return "<input type='checkbox' value='"+sOptionValue.replace(/\s+/g, "_")+"' id='tg_"+elParent.replace(/\s+/g, "_")+"_"+sOptionValue.replace(/\s+/g, "_")+"'><label for='tg_"+elParent.replace(/\s+/g, "_")+"_"+sOptionValue.replace(/\s+/g, "_")+"' "+modeClass.replace(/\s+/g, "_")+" data-hierarchy='root'>"+sOptionLabel+"</label>";
		}
		var aItems = [];
		var oItems = [];
		for (var i =0; i < src.length; i++) {
			var type = src[i];
			type.parentId= params.id;

			if (subtypes == "only") {
				for (var sbt in type.subtype) {
					oItems[type.subtype[sbt].key]=type.subtype[sbt];
				}
			} else {
				var key = (typeof type == "number" || typeof type == "string")? type: type.key;
				oItems[key] = type;
			}

		}
		
		for(var i in oItems) {
			aItems.push(i);
		}
		aItems.sort(function (a, b) {
			if(ToNormalFraction(a) < ToNormalFraction(b))
				return -1;
			if(ToNormalFraction(a) > ToNormalFraction(b))
				return 1;
			return 0;
		})
		for (var i=0; i< aItems.length; i++) {
			ret+= getOption(aItems[i], params.id);
		}
		// aItems.forEach(function(el) {
			// ret+= getOption(el, params.id);
		// }.bind(el, params))
		/**/
		ret = "<div "+id+" class='toggle_box'><div class='toggle_box_content'>"+ret+"</div></div>";
		return ret;
	}

	function createSelect(src, params) {
		var options = "";
		var selected_key = params.selected_key;
		var id = params.id? "id='"+params.id+"'" : "";
		var sClass = params.controlClass? params.controlClass : "";
		var atr_class = params.class? params.class : "";
		var width = params.width? "; width: "+ params.width: "";
		var lableText;
		var min_width = 0;
		var oParams = params.params;
		var aParams = [], sParams="";
		if(oParams) {
			oParams.forEach(function(item) {
				aParams.push(item.name+"='"+item.value+"'");
			});
			sParams = aParams.join(" ");
		}
		src.forEach(function(item){
			var key = item.name;
			var text = item.title;
			if(text.length > min_width)
				min_width = text.length/2;
			options += "<li class='option' data-key='"+key+"'>"+text+"</li>";
			if(key == selected_key){
				lableText = text
			}
		});
		min_width = min_width>20? 20: min_width;
		min_width = min_width<5? 5: min_width;
		min_width = ~~(min_width*0.75);

		var list = "<ul class='list'>" + options + "</ul>";

		var selectedKey = selected_key;
		var label="<div class='label "+atr_class+"' data-selected-key='" + selectedKey + "' "+width+"'>" + lableText + "</div>";
		var select = "<button " + id + " " + sParams + " class='customSelect "+sClass+"' "+width+"'>" + label + list + "</button>"

		return select;
	}

	function createComboBox(src, param) {
		var ARR_DOWN = '<i class="fa fa-arrow-down"></i>';
		var ARR_UP = '<i class="fa fa-arrow-up"></i>';
		var ret = '';
		var id =  param.id? "id='"+param.id+"'": "";
		var title = param.title? param.title: "Выберите";
		var checked = param.checkAll? "checked": "";
		var isOpen = (param.isOpen!=undefined) ? param.isOpen : true;
		var arrow, display = "", content_open=true;
		var min_width = 0;
		if(isOpen && isOpen != "false"){
			arrow="<div class='combo_box_arrow'><span class='arr_down' style='display:none'>"+ARR_DOWN+"</span><span class='arr_up'>"+ARR_UP+"</span></div>";
		} else {
			arrow="<div class='combo_box_arrow'><span class='arr_down'>"+ARR_DOWN+"</span><span class='arr_up' style='display:none'>"+ARR_UP+"</span></div>";
			display = " style='display:none' ";
			content_open = false;
		}
		for (var i =0; i < src.length; i++) {
			var type = src[i];
			var max = type.title.length/2;
			if (max > min_width) {
				min_width = max;
			}

			var sOptionValue = type.key || "";
			var sOptionTitle = type.title || "";

			var oSubtype = type.subtype;
			if(oSubtype) {

			}

			ret+="<input "+checked+" type='checkbox' value='"+sOptionValue+"' id='ch_"+sOptionValue+"'><label for='ch_"+sOptionValue+"' data-hierarchy='root'>"+sOptionTitle+"</label>";

		}
		min_width = min_width>20? 20: min_width;
		min_width = min_width<5? 5: min_width;
		min_width = ~~(min_width*0.9)+2;
		ret = "<div "+id+" class='combo_box' data-text='"+title+"' data-content-open='"+content_open+"'><div class='combo_box_title'>"+title+"</div><div class='combo_box_content' "+display+" >"+ret+"</div>"+arrow+"</div>";
		return ret;
	}

	function createInput(params){
		var id = params.id? "id='"+params.id+"'" : "";
		return "<div "+id+" class='customInput'><input type='text'><span class='cross'></span></div>";
	}

	function showInfoWin(sText) {
		if(!$(".mod_win_wrapper").length){
			var bCross = "<span class='bCloseInfoWin'>×</span>";
			$("body").append("<div class='mod_win_wrapper'><div class='mod_win'>"+bCross+sText+"</div></div>");
		}
		$(".mod_win_wrapper").fadeIn();
	}
	function hideInfoWin() {
		if($(".mod_win_wrapper").length){
			$(".mod_win_wrapper").fadeOut();
		}
	}
	function showDBG() {
		if(!$("#dbg").length){
			$("body").append("<div id='dbg'></div>");
		}
		$("#dbg").fadeIn();
		$("body").height();
	}
	function hideDBG() {
		if($("#dbg")){
			$("#dbg").fadeOut();
		}
	}

	function pretifyString(s) {
		return s.substr(0,1).toUpperCase() + s.substr(1);
	}


	// helpers for monster parameters
	function getMonsterTraits(oData) {
		var trait = '';
		if(Array.isArray(oData)) {
			for(var i in oData){
				trait+="<div class='trait i4-tipe'>"+
					"<span class='i2-tipe'>"+oData[i].name.trim()+"</span>"+
					oData[i].text+
				"</div>";
			}
		}

		else if(typeof oData == "object") {

			trait+="<div class='trait i4-tipe'>"+
				"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
				oData.text+
			"</div>";
		}

		return trait;
	}
	function getMonsterReactions(oData) {
				var reaction = '';
		if(Array.isArray(oData)) {
			for(var i in oData){

				reaction+="<div class='reaction i4-tipe'>"+
					"<span class='i2-tipe'>"+oData[i].name.trim()+"</span>"+
					oData[i].text+
				"</div>";
			}
		}
		else if(typeof oData == "object") {

			reaction+="<div class='reaction i4-tipe'>"+
				"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
				oData.text+
			"</div>";
		}

		return reaction;
	}
	function getMonsterActions(oData) {
		var action = '';
		if(Array.isArray(oData)) {
			for(var i in oData){
				action+="<div class='action i4-tipe'>"+
					"<span class='i2-tipe'>"+oData[i].name.trim()+"</span>"+
					oData[i].text+
				"</div>";
			}
		}
		else if(typeof oData == "object") {

			action+="<div class='action i4-tipe'>"+
				"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
				oData.text+
			"</div>";
		}
		if(action!='')
			action="<div class='actions i3-tipe'>Действия</div>"+action;


		return action;
	}
	function getMonsterLegendary(oData) {

		var legendary = '';
		if(Array.isArray(oData)) {
			for(var i in oData){
				legendary+="<div class='legendary i4-tipe'>"+
					"<span class='i2-tipe'>"+oData[i].name.trim()+"</span>"+
					oData[i].text+
				"</div>";
			}
		}
		else if(typeof oData == "object") {
			if(oData.list) {
				// new
				var sLenendaryText = oData.text? "<span class='i2-tipe'>"+oData.text+"</span>" : "";
				legendary+="<div class='legendary i4-tipe'>"+
					sLenendaryText+
					oData.list.map(function(el){
						var sLeg = "";
						if(el.name) {
							sLeg = el.name + " - ";
						}
						if(el.text) {
							sLeg += el.text;
						}

						return sLeg;
					}).join("")+
				"</div>";

			} else{
				// old
				legendary+="<div class='legendary i4-tipe'>"+
					"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
					oData.text+
				"</div>";
			}

		}
		if(legendary!='')
			legendary="<div class='legendary i3-tipe'>Легендарные Действия</div>"+legendary;

		return legendary;
	}
	function getMonsterLair(oData) {
		var lair = '';
		if(Array.isArray(oData)) {
			for(var i in oData){
				lair+="<div class='lair i4-tipe'>"+
					"<span class='i2-tipe'>"+oData[i].name.trim()+"</span>"+
					oData[i].text+
				"</div>";
			}
		}
		else if(typeof oData == "object") {
			if(oData.list) {
				// new
				var sLenendaryText = oData.text? "<span class='i2-tipe'>"+oData.text+"</span>" : "";
				lair+="<div class='lair i4-tipe'>"+
					sLenendaryText+
					oData.list.map(function(el){
						var sLeg = "";
						if(el.name) {
							sLeg = el.name + " - ";
						}
						if(el.text) {
							sLeg += el.text;
						}

						return sLeg;
					}).join("")+
				"</div>";

			} else{
				// old
				lair+="<div class='lair i4-tipe'>"+
					"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
					oData.text+
				"</div>";
			}

		}
		if(lair!='')
			lair="<div class='lair i3-tipe'>Действия логова</div>"+lair;

		return lair;
	}
	function getMonsterLocal(oData) {
		var local = '';
		if(Array.isArray(oData)) {
			for(var i in oData){
				local+="<div class='local i4-tipe'>"+
					"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
					oData[i].text+
				"</div>";
			}
		}
		else if(typeof oData == "object") {
			if(oData.list) {
				// new
				var sLenendaryText = oData.text? "<span class='i2-tipe'>"+oData.text+"</span>" : "";
				local+="<div class='local i4-tipe'>"+
					sLenendaryText+
					oData.list.map(function(el){
						var sLeg = "";
						if(el.name) {
							sLeg = el.name + " - ";
						}
						if(el.text) {
							sLeg += el.text;
						}

						return sLeg;
					}).join("")+
				"</div>";

			} else{
				// old
				local+="<div class='local i4-tipe'>"+
					"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
					oData.text+
				"</div>";
			}

		}
		if(local!='')
			local="<div class='local i3-tipe'>Эффекты местности</div>"+local;

		return local;
	}
	function getMonsterSpells(oData) {
		var spells = '';
		if(Array.isArray(oData)) {
			for(var i in oData){
				spells+="<div class='spells'>"+
					"<span class='i2-tipe'>"+oData[i].name.trim()+"</span>"+
					oData[i].text+
				"</div>";
			}
		}

		else if(typeof oData == "object") {

			spells+="<div class='spells'>"+
				"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
				oData.text+
			"</div>";
		}

		//console.log("spells: "+spells);
		if(spells!='')
			spells="<div class='spellist i3-tipe'>Заклинания</div>"+spells;

		return spells;
	}

  function getMonsterAbils(oData, sTitle, sClassName) {
    var ret = '';
		if(Array.isArray(oData)) {
			for(var i in oData){
        var sText='';
        var oText = oData[i].text;
        if(Array.isArray(oText)){
          oText.forEach(function(item){
            sText += "<p>"+item+"</p>";
          });
        } else{
          sText = oText;
        }
				ret+="<div class='"+sClassName+" i4-tipe'>"+
					(oData[i].name? "<span class='i2-tipe'>"+oData[i].name.trim()+"</span>" : "")+
					sText+
				"</div>";
			}
		}
		else if(typeof oData == "object") {
			if(oData.list) {
				// new
				//var sLenendaryText = oData.text? "<span class='i2-tipe'>"+oData.text+"</span>" : "";
				//var sText = oData.text? oData.text : "";
        var sText='';
        var oText = oData.text;
        if(oText && Array.isArray(oText)){
          oText.forEach(function(item){
            sText += "<p>"+item+"</p>";
          });
        } else{
          sText = oText;
        }
        
				ret+= sText+

					oData.list.map(function(el){
						var sLeg = "";
						if(el.name) {
							sLeg =  "<span class='i2-tipe'>"+el.name+"</span>";
						}
						if(el.text) {
							sLeg += el.text;
						}

						return "<div class='"+sClassName+" i4-tipe'>"+sLeg+"</div>";
					}).join("");

			} else{
				// old
        var sText='';
        var oText = oData.text;
        if(Array.isArray(oText)){
          oText.forEach(function(item){
            sText += "<p>"+item+"</p>";
          });
        } else{
          sText = oText;
        }
				ret+="<div class='"+sClassName+" i4-tipe'>"+
					"<span class='i2-tipe'>"+oData.name.trim()+"</span>"+
					sText+
				"</div>";
			}

		}
		if(ret!='' && sTitle) {

			ret= "<div class='"+sClassName+" i3-tipe'>"+sTitle+"</div>"+ret;
    }

		return ret;
  }

	function makeImageName(sImg){
		var oImg = /([\da-z\s'_-]+)/ig.exec(sImg);
		if(oImg && oImg[1]) {
			return oImg[1].toUpperCase().replace(/\s/g, "_") + ".jpg";			
		}
		return "";
	}
	function makeImageFromName(sImg){
		var oImg = /\(([\da-z\s\\\/'_-]+)\)/ig.exec(sImg) || /\[([\da-z\s\\\/'-]+)\]/ig.exec(sImg);
		if(oImg && oImg[1]) {
			return oImg[1].toUpperCase().replace(/[^\w-]/g, "_") + ".jpg";			
		}
		return "";
	}
	function createCard(oMonster, sLockedSpell, sClass) {
		var size = '';
		size = monsterSize[oMonster.size];
		if (sClass == undefined || sClass == "") {
			sClass = "monster";
		}

		size='<span class="size">' + size + '</span>';

		var trait = getMonsterAbils(oMonster.trait, null, "trait");//getMonsterTraits(oMonster.trait);
		var reaction = getMonsterAbils(oMonster.reaction, "Реакция", "reaction");//getMonsterReactions(oMonster.reaction);
		var action = getMonsterAbils(oMonster.action, "Действия", "action");//getMonsterActions(oMonster.action);
		var legendary = getMonsterAbils(oMonster.legendary, "Легендарные действия", "legendary");//getMonsterLegendary(oMonster.legendary);
		var lair = getMonsterAbils(oMonster.lair, "Действия логова", "lair");//getMonsterLair(oMonster.lair);
		var local = getMonsterAbils(oMonster.local, "Эффекты местности", "local");//getMonsterLocal(oMonster.local);
		var spells = getMonsterAbils(oMonster.spells, "Заклинания", "spells");//getMonsterSpells(oMonster.spells);

		var stats = '';
		var str = oMonster.str;
		var dex = oMonster.dex;
		var con = oMonster.con;
		var inl = oMonster.int;
		var wis = oMonster.wis;
		var cha = oMonster.cha;
		stats = '<div class="stats">'+
				'<span class="str"><span class="i-tipe">STR </span>' + count_mod(str) + '</span>'+
				'<span class="dex"><span class="i-tipe">DEX </span>' + count_mod(dex) + '</span>'+
				'<span class="con"><span class="i-tipe">CON </span>' + count_mod(con) + '</span>'+
				'<span class="int"><span class="i-tipe">INT </span>' + count_mod(inl) + '</span>'+
				'<span class="wis"><span class="i-tipe">WIS </span>' + count_mod(wis) + '</span>'+
				'<span class="cha"><span class="i-tipe">CHA </span>' + count_mod(cha) + '</span>'+
			'</div>';
		var skill = c_string("skill", "i2-tipe", "Способность", oMonster.skill);
		var vulnerable = c_string("vulnerable", "i2-tipe", "Уязвимость", oMonster.vulnerable);
		var immune = c_string("immune", "i2-tipe", "Иммунитет", oMonster.immune);
		var conditionImmune = c_string("conditionImmune", "i2-tipe", "Иммунитет к состояниям", oMonster.conditionImmune);
		var senses = c_string("senses", "i2-tipe", "Чувства", oMonster.senses);
		var passive = c_string("passive", "i2-tipe", "Пассивное восприятие", oMonster.passive);
		var languages = c_string("languages", "i2-tipe", "Язык", oMonster.languages);
		var name= oMonster.name;

		// experience
		var experience = "?";
		try{
			experience = monsterExpa[oMonster.cr].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
		} catch (err) {

		}
		experience = "<span style='color: #999;'> ("+experience+" XP)</span>";
		var cr = c_string("cr", "i2-tipe", "Сложность", "<span class='cr_num'>"+oMonster.cr+"</span>" + experience);

		var oLock = sLockedSpell? '<a href="#" class="unlock_monster" title="Открепить"><i class="fa fa fa-unlock-alt" aria-hidden="true"></i></a>':
		'<a href="#" class="lock_monster" title="Закрепить"><i class="fa fa-lock" aria-hidden="true"></i></a>';

		var oHide = sLockedSpell? "" : '<a href="#" class="hide_monster" title="Скрыть"><i class="fa fa-eye-slash" aria-hidden="true"></i></a>';

		var add = oMonster.add? "<hr>"+oMonster.add : "";


		var sFiction = oMonster.fiction? 	'<div class="fiction">' + oMonster.fiction + '</div><hr>' : "";
		var sImage = "";
		if(oMonster.image) {
			if(typeof oMonster.image == "string") {
        sImage = makeImageName(oMonster.image);
			} else if(oMonster.image.src && oMonster.image.type) {
        sImage = makeImageName(oMonster.image.src);
			}
		} else {
			sImage = makeImageFromName(oMonster.name);		
		}
		sImage = '<a title="Открыть изображение в новой вкладке" href="img/cute_monsters/' + sImage + '" target="_blanc"><img class="lasy_img" data-src="img/cute_monsters/' + sImage + '"  onerror="this.style.display=\'none\'"></a>';			

    var sBeautifullDescription = (sFiction || sImage)? "<div class='beautifullDescription'><a href='#' class='sh_beautifullDescription'>Скрыть/показать описание</a><div class='beautifullDescriptionInner'>" +sImage+sFiction+"</div></div>" : "";

		var sMonsterType = oMonster.type? '<span class="type">' + (oMonster.typeLink? "<a href='#"+oMonster.typeLink+"'>"+oMonster.type+"</a>" : oMonster.type) + '</span>' : "";

		var ret = '<div class="' + sClass + '" data-name="'+name.toLowerCase()+'">'+
			oHide+
			oLock+
			"<div class='left'><div class='inner'>"+
			'<div class="name">' + name + '</div>'+
			'<div>'+
				size+
				sMonsterType+
				'<span class="alignment">' + oMonster.alignment + '</span>'+
			'</div>'+
			'<hr>'+
      sBeautifullDescription+
			'<div class="ac"><span class="i-tipe">AC </span>' + oMonster.ac + '</div>'+
			'<div class="hp"><span class="i-tipe">HP </span>' + oMonster.hp + '</div>'+
			'<div class="speed"><span class="i-tipe">Скорость </span>' + oMonster.speed + '</div>'+
			'<hr>'+
			stats+
			'<hr>'+
			skill+
			vulnerable+
			immune+
			conditionImmune+
			senses+
			passive+
			languages+
			cr+
			'<hr>'+
			trait+
			"</div></div><!-- left end --><div class='right'><div class='inner'>"+
			action+
			legendary+
			lair+
			local+
			spells+
			reaction+
			add+
			"</div></div>"+
			'</div>';
		return ret;
	}


	function createMonstersIndex() {
		var monsters = "";
		try{
			allMonsters.forEach(function(item) {
				monsters += createCard(item);
			});
			$(".monsterContainer").html(monsters);
			$("#info_text").hide();
		} catch (err) {
			$("#info_text p").first().append("<br>[ОШИБКА]: Не могу загрузить базу монстров! {createMonstersIndex}");
			return false;
		}
	}
	function showFiltered(oParams) {

		var sName = oParams.sName || "";
		var aLevels = oParams.aLevels || [];
		var aTypes = oParams.aTypes || [];
		var aSubTypes = oParams.aSubTypes || [];
		var aSources = oParams.aSources || [];
		var aSize = oParams.aSize || [];
		var sClass = oParams.sClass || "monster";
    var fHidden = oParams.fHidden;
		var sSort = oParams.sSort;

		$(".monsterContainer").empty();
		var monsters = "";

		filteredMonsters = []; //arrDiff(filteredMonsters, aHiddenMonsters);
		try{
			allMonsters.forEach(function(el) {
				filteredMonsters.push(el);
			});
		} catch(err) {
			$("#info_text p").first().append("<br>[ОШИБКА]: Не могу загрузить базу монстров! {showFiltered}");
			return false;
		}


		// name
		if (sName) {
      var aName = sName.split(",").map(item => item.trim().toLowerCase());
			filteredMonsters = filteredMonsters.filter(function(monster){
        for (i=0; i<aName.length; i++) {
          if (monster.name.toLowerCase().trim().indexOf(aName[i].replace(/_+/g, " "))>=0) {
            return true;
          }
        }	
        return false;
			});
		}

		// level
		if(aLevels && aLevels.length>0 && aLevels.length<99) {
			filteredMonsters = filteredMonsters.filter(function(monster){
				for(var i = 0; i < aLevels.length; i++) {
					if(aLevels[i].toLowerCase().trim() == monster.cr.toLowerCase().trim()) {
						return true;
					}
				}
				return false;
			});
		}

		// types
		if(aTypes && aTypes.length>0 && aTypes.length<99) {
			filteredMonsters = filteredMonsters.filter(function(monster){
				for(var i = 0; i < aTypes.length; i++) {
					if(aTypes[i].replace(/_+/g, " ").toLowerCase().trim() == monster.sType.toLowerCase().trim()) {
						return true;
					}
				}
				return false;
			});
		}
		// subtypes
		if(aSubTypes && aSubTypes.length>0 && aSubTypes.length<99) {
			filteredMonsters = filteredMonsters.filter(function(monster){
				for(var i = 0; i < aSubTypes.length; i++) {
					if(monster.aSubtypes.indexOf(aSubTypes[i].replace(/_+/g, " ").toLowerCase().trim()) >= 0) {
						return true;
					}
				}
				return false;
			});
		}

		// sizes
		if(aSize && aSize.length>0 && aSize.length<99) {
			filteredMonsters = filteredMonsters.filter(function(monster){
				for(var i = 0; i < aSize.length; i++) {
					if(aSize[i].toLowerCase().trim() == monster.size.toLowerCase().trim()) {
						return true;
					}
				}
				return false;
			});
		}

		//source
		if(aSources && aSources.length>0 && aSources.length<9) {
			filteredMonsters = filteredMonsters.filter(function(spell){
				for(var i = 0; i < aSources.length; i++) {
					if(aSources[i].toLowerCase().trim() == spell.source.toLowerCase().trim()) {
						return true;
					}
				}
				return false;
			});
		}


		filteredMonsters = fHidden? arrDiff(filteredMonsters, aHiddenMonsters) : filteredMonsters;

		// sort
    if(sSort) {
      switch (sSort) {
        case "alpha" :
            filteredMonsters.sort(function(a, b) {
              if (a.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") < b.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") )
                return -1;
              if (a.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") > b.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") )
                return 1;
              return 0
            });
          break;
        default :
            filteredMonsters.sort(function(a, b) {
              if (translateCR(a.cr)+a.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") < translateCR(b.cr)+b.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") )
                return -1;
              if (translateCR(a.cr)+a.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") > translateCR(b.cr)+b.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") )
                return 1;
              return 0
            });
      }
    }


		for (var i in filteredMonsters) {
			if(filteredMonsters[i]) {
				var fLocked = filteredMonsters[i].locked? true: false;
				var tmp = createCard(filteredMonsters[i], fLocked, sClass);
				if (tmp)
					monsters += tmp;
			}
		}

		$(".monsterContainer").html(monsters);
		createLockedMonstersArea();
		//$("#before_spells").hide();
		$("#info_text").hide();
		LasyLoadImages();
	}

	function filterMonsters(oParams){
		var sName = $("#NameInput input").val();
		var aLevels = [];
		$("#levelToggle .toggle_box_content input:checkbox:checked").each(function(i, el){
			aLevels.push(el.value);
		});

		var aTypes = [];
		$("#TypeToggle .toggle_box_content input:checkbox:checked").each(function(i, el){
			aTypes.push(el.value);
		});

		var aSubTypes = [];
		$("#SubTypeToggle .toggle_box_content input:checkbox:checked").each(function(i, el){
			aSubTypes.push(el.value);
		});

		var aSources = [];
		$("#SourceCombobox .combo_box_content input:checkbox:checked").each(function(i, el){
			aSources.push(el.value);
		});

		var aSize = [];
		$("#SizeCombobox .combo_box_content input:checkbox:checked").each(function(i, el){
			aSize.push(el.value);
		});

    var sSort = $("#SortSelect .label").attr("data-selected-key");

		var sClass = getCardView();

		var fHidden = (aHiddenMonsters.length>0)? true: false;

		//setConfig("schoolOpen", $("#SchoolCombobox").attr("data-content-open"));
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			showFiltered({
				sName: sName,
				aLevels: aLevels,
				aTypes: aTypes,
				aSubTypes: aSubTypes,
				aSources: aSources,
				aSize: aSize,
				sClass: sClass,
				fHidden: fHidden,
        sSort: sSort
				});
		}, nTimerSeconds/4);

	}

	function colectMonstersParams() {
		//monsterLevels[]
		//monsterTypes[]
		var tmpMonsterTypes = {};
		try{
			allMonsters.forEach(function(el) {
				// level
				if(monsterLevels.indexOf(el.cr)<0) {
					monsterLevels.push(el.cr);
				}

				// types
				var sTypeString = el.type;
				var sTypeTest = sTypeString.match(/^([^(]+)(\([^)]+\))?/);
				var sType = (sTypeTest[1] || "").trim().toLowerCase();
				var aSubtype = (sTypeTest[2]|| "").replace(/[)(]+/g, "").split(",").map(function(el){return el.trim().toLowerCase()});

				if(sType) {
					if(!tmpMonsterTypes[sType]){
						tmpMonsterTypes[sType] = {};
					}
					if(aSubtype.length>0) {
						aSubtype.forEach(function(el){
							if(el.length>0)
								tmpMonsterTypes[sType][el] = "";
						});
					}
				}

				el.sType = sType;
				if(aSubtype.length>0)
					el.aSubtypes = aSubtype;
			});
		} catch (err) {
			$("#info_text p").first().append("<br>[ОШИБКА]: Не могу загрузить базу монстров! {colectMonstersParams}");
			return false;
		}

		// transform monster object to array
		for (var type in tmpMonsterTypes) {
			var aSubtype = [];
			for (var subtype in tmpMonsterTypes[type]) {
				aSubtype.push({
					"title": subtype,
					"key": subtype
				});
			}
			var oType = {
				"title": type,
				"key": type
			}
			if(aSubtype.length > 0){
				aSubtype.sort(function(a, b) {
					if(a.title > b.title)
						return 1;
					if(a.title < b.title)
						return -1;
					return 0;
				});

				oType.subtype = aSubtype;
			}
			monsterTypes.push(oType);
		}
		monsterTypes.sort(function(a, b) {
			if(a.title > b.title)
				return 1;
			if(a.title < b.title)
				return -1;
			return 0;
		});

		// sorting monsters levels
		monsterLevels.sort(function(a, b) {
			if(eval(a) < eval(b))
				return -1
			if(eval(a) > eval(b))
				return 1
			return 0
		});
	}

	function createButtons() {
		var bHome = "<a href='/' class='bt flexChild' title='На главную страницу'><i class='fa fa-home'></i></a>";
		var bInfo = "<a href='#' class='bt flexChild' id='bInfo' title='Справка'><i class='fa fa-question-circle'></i></a>";
		var bPrint = "<a href='#' class='bt flexChild' id='bPrint' title='Распечатать'><i class='fa fa-print' aria-hidden='true'></i></a>";
		$(".p_side").append("<div class='mediaWidth flexParent'>" + bHome + bInfo + bPrint + "</div>");
	}

	function createLabel(text) {
		return "<div class='filterLabel'>"+text+"</div>";
	}
	function createSizeCombobox(isOpen){

		var aSizes = [
			{
				"title": "Крошечный",
				"key": "T"
			},
			{
				"title": "Маленький",
				"key": "S"
			},
			{
				"title": "Средний",
				"key": "M"
			},
			{
				"title": "Большой",
				"key": "L"
			},
			{
				"title": "Огромный",
				"key": "H"
			},
			{
				"title": "Колоссальный",
				"key": "G"
			}
		]

		if(isOpen == undefined)
			isOpen = false;
		var s1=createComboBox(aSizes, {
			id: "SizeCombobox",
			title: "Размер",
			checkAll: true,
			isOpen: isOpen
			});
		$(".p_side").append("<div class='mediaWidth'>" + s1 + "</div>");
	}

	function createSourceCombobox(isOpen) {
		if(isOpen == undefined)
			isOpen = false;
		var s1=createComboBox(monsterSources, {id: "SourceCombobox", title: "Источники", checkAll: true, isOpen: isOpen});
		$(".p_side").append("<div class='mediaWidth'>" + s1 + "</div>");
	}

	function createViewSegmented() {
		var aViews = [
			{
				key: "text",
				title: "<i class='fa fa-align-justify' aria-hidden='true'></i> Текст",
				selected: true
			},
			{
				key: "card",
				title: "<i class='fa fa-th-large' aria-hidden='true'></i> Карточки"
			}
		];
		var s1=createSegmentedButton(aViews, {id: "ViewSegmented"});
		var label = createLabel("Вид");
		$(".p_side").append("<div class='mediaWidth'>" + label + s1 + "</div>");
	}

	function createTypeToggle() {
		var label = createLabel("Типы");
		var s1=createToggle(monsterTypes, {id: "TypeToggle", title: "Типы", checkAll: true});
		$(".p_side").append("<div class='mediaWidth max_width_2'>" + label + s1 + "</div>");

	}

	function createSubTypeToggle() {
		var label = createLabel("Подтипы");
		var s1=createToggle(monsterTypes, {id: "SubTypeToggle", title: "Подтипы", checkAll: true, subtypes: "only"});
		$(".p_side").append("<div class='mediaWidth max_width_2'>" + label + s1 + "</div>");

	}
	function createNameFilter() {
		var ret=createInput({id: "NameInput"});
		var label = createLabel("Название");
		$(".p_side").append("<div class='mediaWidth'>" + label + ret + "</div>");
	}

	function createLevelToggle(){
		var label = createLabel("Класс Сложности");
		var s1 = createToggle(monsterLevels, {"id": "levelToggle"});
		$(".p_side").append("<div class='mediaWidth max_width_2'>"  + label +  s1 + "</div>");
	}

	function createHiddenMonstersList(){
		if(aHiddenMonsters.length < 1){
			$("#HiddenMonsters").parent().remove();
			return;
		}
		if(!$("#HiddenMonsters").length>0){
			var label = createLabel("Скрытые монстры");
			$(".p_side").append("<div class='mediaWidth'>" + label + "<div id='HiddenMonsters'></div></div>");
		}
		var listHiddenMonsters = aHiddenMonsters.map(function(item){
			return "<a href='#' title='Вернуть на место' class='bUnhideMonster' data-name='"+item+"'>"+item +"</a>";
		}).join(" ");

		var bReturnAll = "<a href='#' class='bReturnUnvisible'>Вернуть все обратно</a>";
		$("#HiddenMonsters").html(bReturnAll + listHiddenMonsters);
	}

	function createLockedMonstersArea(){
		var aLocked = [];
		for (var i in aLockedMonsters){
			aLocked.push(i);
		}
		var sClass = getCardView();
		var aResult = [];
		var l = aLocked.length;
		if(l>0){
			for (var i=0; i<allMonsters.length; i++) {
				for (var j=0; j< l; j++) {
					if(allMonsters[i].name.toLowerCase() == aLocked[j].toLowerCase()) {
						aResult.push(allMonsters[i]);
					}
				}
			}

			if($("#lockedMonstersArea").length<1){
				$(".p_cont").prepend("<div id='lockedMonstersArea'><span class='bUnlockAll'>Открепить все</span><span class='topHeader'></span><div class='content row'></div><span class='bottomHeader'></span></div>");

			}
			$("#lockedMonstersArea .content").html(aResult.sort(function(a, b) {

				if (translateCR(a.cr)+a.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") < translateCR(b.cr)+b.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") )
				return -1;
				if (translateCR(a.cr)+a.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") > translateCR(b.cr)+b.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") )
				return 1;

				return 0
			}).map(function(el){return createCard(el, true, sClass)}));

			//COUNTER
			$("#lockedMonstersArea .topHeader").html("("+l+")");
			$(".monsterContainer").addClass("noprint");
		} else {
			$("#lockedMonstersArea").remove();
			$(".monsterContainer").removeClass("noprint");
		}
	}

  function createSortSelect() {
    var src = [
      {
        name: "alpha_level",
        title: "По уровню и алфавиту"
      },
      {
        name: "alpha",
        title: "По алфавиту"
      }
    ];

    var classSelect = createSelect(src, {id: "SortSelect", selected_key: "alpha_level", width: "100%"});
    var label = createLabel("Сортировка");
    $(".p_side").append("<div class='mediaWidth'>" + label + classSelect + "</div>");
  }

	function createSidebar() {
		$(".p_side").empty();

		// menu buttons
		createButtons();

		// name
		createNameFilter();

		// collect data for level & type
		colectMonstersParams();

		// level
		createLevelToggle();

		// type
		createTypeToggle();

		createSubTypeToggle();

		//size
		createSizeCombobox();

		//source
		createSourceCombobox();

		// view
		createViewSegmented()

    //sort
    createSortSelect();

		$(".p_side").fadeIn();
	}

	function setSubtypeToggleEnable() {
		var aTypes = [];
		var aSubTypes = [];
		$("#TypeToggle .toggle_box_content input:checkbox:checked").each(function(i, el){
			aTypes.push(el.value);
		});
		//console.dir(aTypes);
		//console.dir(monsterTypes);
		if(aTypes.length>0){
			$("#SubTypeToggle input[type='checkbox']").each(function () {
				$(this).attr("disabled", true);
			});
			for (var t in monsterTypes) {
				aTypes.forEach(function(el) {
					if(monsterTypes[t].key == el) {
						if(monsterTypes[t].subtype){
							monsterTypes[t].subtype.forEach(function (item) {
								$("#SubTypeToggle input[type='checkbox']").each(function () {
									if($(this).attr('value') == item.key){
										$(this).removeAttr("disabled");
									}
								})
							})
						}
					}
				})

			}
		} else{
			$("#SubTypeToggle input[type='checkbox']").each(function () {
				$(this).removeAttr("disabled");
			});
		}
	}

	/// handlers

	// close Mod Win
	$("body").on("click", ".bCloseInfoWin", function() {
		$("#dbg").fadeOut();
		hideInfoWin();
	});

	// hide DBG
	$("body").on("click", "#dbg", function() {
		$(this).fadeOut();
		hideInfoWin();
	});


	// custom Combobox
	$("body").on('click', ".combo_box_title, .combo_box_arrow", function(){
		var el = $(this).closest(".combo_box").find(".combo_box_content");
		if(el.is(":visible"))
		{
			el.slideUp();
			el.next(".combo_box_arrow").find(".arr_down").show();
			el.next(".combo_box_arrow").find(".arr_up").hide();
			el.parent().attr("data-content-open", false);
		}
		else
		{
			el.slideDown();
			el.next(".combo_box_arrow").find(".arr_down").hide();
			el.next(".combo_box_arrow").find(".arr_up").show();
			el.parent().attr("data-content-open", true);
		}
	});// get item

	function onSelectItemPress(src) {
		var d_root='', d_parent='', trig=true;

		var attrFor = src.attr("for"); // $("input#"+attrFor)
		var oComboBox = src.closest(".combo_box");
		var sComboBoxId = oComboBox.attr("id");
		d_root = $("#"+sComboBoxId+" input#"+attrFor).attr("data-root");
		d_parent = $("#"+sComboBoxId+" input#"+attrFor).attr("data-parent");
		if($("#"+sComboBoxId+" input#"+attrFor).prop("checked"))
			{
			trig=false;
			}
		$("#"+sComboBoxId+" input#"+attrFor).prop("checked", trig);
		/**/
		if(d_root!='' && d_root!=undefined) {
			$("#"+sComboBoxId+" input[type=checkbox][data-parent="+d_root+"]").each(function(){
				$(this).prop( "checked", trig );
			});
		}
		/**/
		if(d_parent!='' && d_parent!=undefined && trig==false) {
			$("#"+sComboBoxId+" input[type=checkbox][data-root="+d_parent+"]").prop( "checked", trig);

		}


		function make_val(ex, ad, dp){
			var ret = '';
			if(dp!=undefined) {
				ad = dp + " " + ad;
			}
			if(ex!=undefined && ex!=""){
				ret = ex+", "+ad;
			} else {
				ret = ad;
			}
			return ret;
		}

		/**/
		var d_root='';
		var before_root='';
		var d_parent='';
		var txt='';
		var value='';
		var title=''
		$("#"+sComboBoxId+" .combo_box_title").html("");
		$("#"+sComboBoxId+" .combo_box_title").attr('data-val',"");
		$("#"+sComboBoxId+" input[type=checkbox]:checked").each(function(){
			d_root='';
			d_parent='';
			d_parent=$(this).attr("data-parent");
			d_root=$(this).attr("data-root");

			title=$("#"+sComboBoxId+" .combo_box_title").html();
			value=$("#"+sComboBoxId+" .combo_box_title").attr('data-val');

			if(title!="" && title.charAt(title.length-1)!="(") {
				$("#"+sComboBoxId+" .combo_box_title").append(", ");
			}
			// обычный пункт
			if(d_parent==undefined && d_root==undefined)
				{
				txt = $(this).next("label").html().replace("<br>", " | ");
				title_value = $("#"+sComboBoxId+" .combo_box_title").attr("data-val");
				value = $(this).attr('value');
				dp = $(this).attr('data-parent');
				value = make_val(title_value, value, dp);
				//$(".combo_box_title").append(txt).attr("data-val", value);
				$("#"+sComboBoxId+" .combo_box_title").attr("data-val", value);
				}
			// если root
			if(d_root!=undefined)
				{
					// если есть отмеченные потомки
				if($("#"+sComboBoxId+" input[type=checkbox][data-parent="+d_root+"]:checked").length>0)
					{
					txt=$(this).next("label").text()+" (";
					//$(".combo_box_title").append(txt);

					before_root=d_root;
					}
				}
			// если parent
			if(d_parent!=undefined)
				{

					txt=$(this).next("label").text();
					title_value = $("#"+sComboBoxId+" .combo_box_title").attr("data-val");
					value = $(this).attr('value');
					dp = $(this).attr('data-parent');
					value = make_val(title_value, value, dp);
					var ind = $("#"+sComboBoxId+" input[type=checkbox][data-parent="+d_parent+"").index(this);
					if(ind==$("#"+sComboBoxId+" input[type=checkbox][data-parent="+d_parent+"").length-1 && d_parent==before_root){
						txt+=")";
					}

					$("#"+sComboBoxId+" .combo_box_title").append(txt).attr("data-val", value);
				}
			});

			if($("#"+sComboBoxId+" .combo_box_title").html()=='')
				$("#"+sComboBoxId+" .combo_box_title").html(src.closest(".combo_box").attr('data-text'));

		/*/
		var bg = $("#selector").find("input:checked + label[data-bg] ").attr("data-bg");
		var leng = $("#selector").find("input:checked + label[data-bg] ").length;
		$("#selector").find("input:checked + label[data-bg] ").each(function(){
			if ($(this).attr("data-bg") != bg){
				leng = 0;
			}
		});
		if(bg && leng>0) {
			$("body").attr("class", bg);
		} else {
			$("body").attr("class", "");
		}
		/**/

		// bg /
		return false;
	}

	$("body").on('click', ".combo_box input", function(event){
		return false;
	});

	$("body").on('click', ".combo_box label", function(){
		onSelectItemPress($(this));
		return false;
	});

	// custom Input
	$("body").on('click', ".customInput .cross", function(){
		$(this).parent().find("input").val("");
		$(this).parent().focusout();
	});
  //custom Select
  $("body").on("click", ".customSelect .label", function() {
    if($(this).next(".list").css('display') == 'none') {
    $(this).parent().focus();
    }
    $(this).next(".list").fadeToggle();
  });
  $("body").on("focusout", ".customSelect", function() {
    $(this).find(".list").fadeOut();
  });
  $("body").on("click", ".customSelect .option", function() {
    var key = $(this).attr("data-key");
    var text = $(this).html().replace("<br>", " | ");
    $(this).closest(".customSelect").find(".label").attr("data-selected-key", key).text(text);
    $(this).parent("ul").fadeOut();
    $(this).closest(".customSelect").focusout();
    $(this).closest(".customSelect").blur();
    //$("#toFocus").focus();
  });

	// filters

	// name select
	$("body").on('focusout', "#NameInput", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			updateHash();
			filterMonsters();
		}, nTimerSeconds);
	});
	$("body").on('keyup', "#NameInput input", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			updateHash();
			filterMonsters();
		}, nTimerSeconds*3);
	});


	// level select
	$("body").on('click', "#levelToggle label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
      updateHash();
			filterMonsters();
		}, nTimerSeconds);
	});

	// type select
	$("body").on('click', "#TypeToggle label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
      updateHash();
			setSubtypeToggleEnable();
			filterMonsters();
		}, nTimerSeconds);
	});

	// subtype select
	$("body").on('click', "#SubTypeToggle label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
      updateHash();
			filterMonsters();
		}, nTimerSeconds);
	});

	// source combobox
	$("body").on('click', "#SourceCombobox label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
      updateHash();
			filterMonsters();
		}, nTimerSeconds);
	});
	$("body").on('click', "#SourceCombobox .combo_box_title, #SourceCombobox .combo_box_arrow", function(){
		setConfig("sourceOpen", $("#SourceCombobox").attr("data-content-open"));
	});
	// size combobox
	$("body").on('click', "#SizeCombobox label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
      updateHash();
			filterMonsters();
		}, nTimerSeconds);
	});
	$("body").on('click', "#SizeCombobox .combo_box_title, #SizeCombobox .combo_box_arrow", function(){
		setConfig("sizeOpen", $("#SizeCombobox").attr("data-content-open"));
	});

  // sort select
  $("body").on('focusout', "#SortSelect", function(){
    clearTimeout(oTimer);
    oTimer = setTimeout(function(){
      updateHash();
      filterMonsters();
    }, nTimerSeconds);
  });

	//

	// show all moncters
	$("body").on('click', "#showAllMonsters", function(){
		setConfig("infiIsShown", true);
		filterMonsters();
		hideInfoWin();
		hideDBG();
		return false;
	});

	//info_textbInfo
	$("body").on('click', "#bInfo", function(){
		var sInfo = $("#info_text").html();
		showDBG();
		showInfoWin(sInfo);
		return false;
	});


	//hide monsters
	$("body").on('click', ".hide_monster", function(){
		var sName = $(this).closest("[class^='monster']").attr("data-name");

		$(this).hide();
		// update hidden Monsters array
		aHiddenMonsters.push(sName);

		// show list of hidden Monsters
		createHiddenMonstersList();

		// show Monsters without hidden
		filterMonsters({fHidden: true});

		return false;
	})
	// unhide monsters
	$("body").on('click', ".bUnhideMonster", function(){
		var sName = $(this).attr("data-name")
		// update hidden spells array
		aHiddenMonsters.splice(aHiddenMonsters.indexOf(sName), 1);

		// show list of hidden spells
		createHiddenMonstersList();

		// show spells without hidden
		filterMonsters({fHidden: true});

		return false;
	})

  // show/hide beautifull description
  $("body").on("click", ".sh_beautifullDescription", function() {
    $(this).next(".beautifullDescriptionInner").toggle();
    return false;
  });
	$("body").on("click", ".bReturnUnvisible", function() {
		aHiddenMonsters = [];// show list of hidden spells
		createHiddenMonstersList();

		// show spells without hidden
		filterMonsters({fHidden: true});

		return false;
	});

	// lock spells
	$("body").on('click', ".lock_monster", function(){
		var sName = $(this).closest("[class^='monster']").attr("data-name");

		aLockedMonsters[sName] = "";

		// show locked
		createLockedMonstersArea();

		return false;
	})

	// unlock spells
	$("body").on('click', ".unlock_monster", function(){
		var sName = $(this).closest("[class^='monster']").attr("data-name");

		delete aLockedMonsters[sName];

		// show locked
		createLockedMonstersArea();

		return false;
	})
	$("body").on('click', "#lockedMonstersArea .topHeader", function(){
		$(this).next(".content").slideToggle();
		$(this).next(".content").next(".bottomHeader").fadeToggle();
	});
	$("body").on('click', ".bUnlockAll", function(){
		aLockedMonsters = [];
		// show locked
		createLockedMonstersArea();
	});

	// print
	$("body").on('click', "#bPrint", function(){
		window.print();

		return false;
	});

	// view
	$("body").on('change', "#ViewSegmented input", function() {
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterMonsters();
		}, nTimerSeconds);
	});


	// monster type inf oclose
	$("body").on('click', "#monsterTypeInfoWindow .cross", function() {
    hideDBG();
		hideMonsterTypeInfo();
	});
	
	// images lasy loading
	function LasyLoadImages() {
		if(oImageLoadingTimer) {
			clearTimeout(oImageLoadingTimer);
		}
		oImageLoadingTimer = setTimeout(function(){
			var aImages = $(".lasy_img");//document.getElementByClassName("lasy_img");
			aImages.each(function(){
				var oImg = $(this);
				if(!oImg.attr("src")){
					if(oImg.isInViewport()){
						var sSrc=oImg.attr('data-src');
						oImg.attr("src", sSrc);
						oImg.removeClass("lasy_img");
					}
				}
			});
		}, 200);
	}
	window.onscroll = LasyLoadImages;

// url filters
	function updateHash() {
    var aFilters = [];
    // text
    var sName = $("#NameInput input").val();
    
    //select
		var sSort = $("#SortSelect .label").attr("data-selected-key");

    //combobox
    var aSources = $("#SourceCombobox .combo_box_title").attr("data-val");
			if(aSources) aSources = aSources.split(",").map(function(item){return item.trim()});
    var aSizes = $("#SizeCombobox .combo_box_title").attr("data-val");
			if(aSizes) aSizes = aSizes.split(",").map(function(item){return item.trim()});
    
    //buttos
    var aCr=[];
    $("#levelToggle input:checked").each(function(){aCr.push( $(this).attr('value'))})
    if(aCr.length>0){
      aFilters.push("cr="+aCr.join(",").replace(/\s+/g, "_"));
    }
    var aTypes=[];
    $("#TypeToggle input:checked").each(function(){aTypes.push( $(this).attr('value'))})
    if(aTypes.length>0){
      aFilters.push("type="+aTypes.join(",").replace(/\s+/g, "_"));
    }
    var aSubTypes=[];
    $("#SubTypeToggle input:checked").each(function(){aSubTypes.push( $(this).attr('value'))})
    if(aSubTypes.length>0){
      aFilters.push("subtype="+aSubTypes.join(",").replace(/\s+/g, "_"));
    }
    
    //segmented
    var aView=[];
    $("#ViewSegmented input:checked").each(function(){aView.push( $(this).attr('value'))})
    if(aView.length>0 && aView[0]!='text'){
      aFilters.push("view="+aView.join(",").replace(/\s+/g, "_"));
    }
    
    //filters
    if(sName && sName.length>0) {
      aFilters.push("q="+sName.replace(/\s+/g, "_"));
    }
    if(aSources && aSources.length>0 && $("#SourceCombobox .combo_box_content input").length > aSources.length) {
			aFilters.push("source="+aSources.join(","));
		}
    if(aSizes && aSizes.length>0 && $("#SizeCombobox .combo_box_content input").length > aSizes.length) {
			aFilters.push("size="+aSizes.join(","));
		}
		if(sSort && sSort.length>0 && sSort!="alpha_level") {
      aFilters.push("sort="+sSort.replace(/\s+/g, "_"));
		}
    if(aFilters.length>0) {
      var sHash = aFilters.join("&");
      window.location.hash = sHash;
    } else {
      removeHash();
    }
	}
  function getHash(){
    $('html, body').animate({scrollTop:0}, 'fast');

    var sHash = window.location.hash.slice(1); // /archive#q=spell_name
    sHash = decodeURIComponent(sHash);
    if(sHash && !/[^А-Яа-яЁё\w\d\/&?|_=,-]/.test(sHash)) {
      var sName = sHash.match(/\bq=([А-Яа-яЁё\/\w\d_,-]+)/);
      var sSort = sHash.match(/\bsort=([\w]+)/);
      var sMonsterType = sHash.match(/\bmonsterType=([А-Яа-яЁё\/\w\d_-]+)/);
      var sType = sHash.match(/\btype=([А-Яа-яЁё\/\w\d_-]+)/);
      var sSubType = sHash.match(/\bsubtype=([А-Яа-яЁё\/\w\d_-]+)/);
      var sSize = sHash.match(/\bsize=([А-Яа-яЁё\/\w\d_]+)/);
      var sSources = sHash.match(/\bsource=([\w,_]+)/);
      var sCr = sHash.match(/\bcr=([\w\d\\\/,_]+)/);
      var sView = sHash.match(/\bview=([\w\d\\\/,_]+)/);
      if(sName && sName[1]) {
      	$("#NameInput input").val(sName[1].replace(/[_]+/g," "));
      }
      if(sMonsterType && sMonsterType[1]) {
        showMonsterTypeInfo(sMonsterType[1]);
      }
      if(sCr && sCr[1]) {
        var aCr = sCr[1].split(",");
        aCr.forEach(function(i){
          $("#levelToggle input[type=checkbox]").each(function(){
            if($(this).attr("value") == i.trim()) {
              $(this).prop('checked', true);
            }
          })
        });
      }
      if(sType && sType[1]) {
        var aType = sType[1].split(",");
        aType.forEach(function(i){
          $("#TypeToggle input[type=checkbox]").each(function(){
            if($(this).attr("value") == i.trim()) {
              $(this).prop('checked', true);
            }
          })
        });
      }
      if(sSubType && sSubType[1]) {
        var aSubType = sSubType[1].split(",");
        aSubType.forEach(function(i){
          $("#SubTypeToggle input[type=checkbox]").each(function(){
            if($(this).attr("value") == i.trim()) {
              $(this).prop('checked', true);
            }
          })
        });
      }
      if(sSize && sSize[1]) {
      	var aSize = sSize[1].split(",");

      	$("#SizeCombobox .combo_box_content input[type='checkbox']").each(function(){
      		if(aSize.indexOf($(this).val())>-1) {
      			$(this).prop('checked', true);
      		} else {
      			$(this).prop('checked', false);
      		}
      	});
      	$("#SourceCombobox .combo_box_title").attr("data-val", aSize[1])
      }
      if(sSources && sSources[1]) {
      	var aSources = sSources[1].split(",");

      	$("#SourceCombobox .combo_box_content input[type='checkbox']").each(function(){
      		if(aSources.indexOf($(this).val())>-1) {
      			$(this).prop('checked', true);
      		} else {
      			$(this).prop('checked', false);
      		}
      	});
      	$("#SourceCombobox .combo_box_title").attr("data-val", sSources[1])
      }
      if(sView && sView[1]) {
        $("#ViewSegmented input").each(function(){
          $(this).prop('checked', false);
          if($(this).attr("value") == sView[1]) {
            $(this).prop('checked', true);
          }
        });
      }
      if(sSort && sSort[1]) {
        $("#SortSelect .label").attr("data-selected-key", sSort[1]).html($("#SortSelect li[data-key='"+sSort[1]+"']").html());
      }
      else {
      	/*/
        $('html, body').animate({
          scrollTop: $("#"+sHash).offset().top
        }, 200);
        /**/
      }
    } else {
      removeHash();
      //hideClerFilter();
    }
    filterMonsters();
  }

  function removeHash() {
    history.pushState("", document.title, window.location.pathname + window.location.search);
    return false;
  }
  //window.onhashchange = getHash;

  function showMonsterTypeInfo(sName) {
    if($("#monsterTypeInfoWindow").lengt >0) {
      $("#monsterTypeInfoWindow").remove();
    }
    var oData = monsterTypesInfo.filter(function(item){
      return item.name == sName
    });
    if (oData.length > 0) {
      var sTitle = "<h1 class='title'>"+oData[0].title+"</h1>";
      var sCross = "<a class='cross'>✖</a>";
      var sImg = (oData[0].img)? "<img class='img' src='"+oData[0].img+"'>" : "";
      var sInfo = "<div class='info'>"+oData[0].info+"</div>";
      var oWin = "<div class='display: none' id='monsterTypeInfoWindow'>"+sTitle+sCross+sImg+sInfo+"</div>";
      showDBG();
      $("body").append(oWin);
      $("#monsterTypeInfoWindow").fadeIn();
    }
  }

  function hideMonsterTypeInfo() {
    $("#monsterTypeInfoWindow").fadeOut();
  }


function startCatalog() {
	console.log("Try to start...");
	// $.when(createSidebar()).done(
		// function(){
			// $("#showAllMonsters").slideDown();
			// if(getViewPortSize("width") > 600){
				// if(getConfig("infiIsShown")==true)
					// getHash();
			// } else{
        // getHash();
      // }
		// }
	// );
  createSidebar();
  getHash();
}
var nMaxTry = 3;
	try {
		if(typeof allMonsters) {
			console.log("Start will be successfull");
		}
		startCatalog();
	} catch(err) {
			console.log("Start was unsuccessfull, try after 4 seconds.");
			setTimeout(startCatalog, 4000);
	}

});
