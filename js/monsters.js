var TENTACULUS_APP_VERSION = "2.0.0";

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

window.onload = function(){
	var monsterLevels = [];
	var monsterTypes = [];
	var aHiddenMonsters = [];

	var oTimer; // for TimeOut (filtering)
	var nTimerSeconds = 100;

	var aHiddenMonsters = [];
	var aLockedMonsters = {};
	var filteredMonsters = [];

	var oSource = {};

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

		function getOption(el) {
			var sOptionValue, sOptionLabel;
			if(typeof el == "number" || typeof el == "string") {
				sOptionValue = sOptionLabel = el;
			} else {
				sOptionValue = el.key;
				sOptionLabel = el.title;
			}

			return "<input type='checkbox' value='"+sOptionValue+"' id='tg_"+sOptionValue+"'><label for='tg_"+sOptionValue+"' "+modeClass+" data-hierarchy='root'>"+sOptionLabel+"</label>";
		}
		var aItems = [];
		var oItems = [];
		for (var i =0; i < src.length; i++) {
			var type = src[i];


			if (subtypes == "only") {
				for (var sbt in type.subtype) {
					//aItems.push(type.subtype[sbt]);
					oItems[type.subtype[sbt].key]=type.subtype[sbt];
					//ret+= getOption(type.subtype[sbt]);
				}
			} else {
				//aItems.push(type);
				var key = (typeof type == "number" || typeof type == "string")? type: type.key;
				oItems[key] = type;
				//ret+= getOption(type);
			}

		}
		/*/
		aItems.forEach(function(el) {
			ret+= getOption(el);
		});
		/*/
		/**/
		for(var i in oItems) {
			//ret+= getOption(oItems[i]);
			aItems.push(i);
		}
		aItems.sort(function (a, b) {
			if(ToNormalFraction(a) < ToNormalFraction(b))
				return -1;
			if(ToNormalFraction(a) > ToNormalFraction(b))
				return 1;
			return 0;
		})
		aItems.forEach(function(el) {
			ret+= getOption(el);
		})
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

	function createCard(oMonster, sLockedSpell, sClass) {
		var size = '';
		size = oMonster.size;
		if (sClass == undefined || sClass == "") {
			sClass = "monster";
		}
		switch(size)
		{
			case "T": size="Крошечный"; break;
			case "S": size="Маленький"; break;
			case "M": size="Средний"; break;
			case "L": size="Большой"; break;
			case "H": size="Огромный"; break;
			case "G": size="Колоссальный"; break;
		}
		size='<span class="size">' + size + '</span>';

		var trait = '';
		if(Array.isArray(oMonster.trait)) {
			for(var i in oMonster.trait){
				trait+="<div class='trait i4-tipe'>"+
					"<span class='i2-tipe'>"+oMonster.trait[i].name.trim()+"</span>"+
					oMonster.trait[i].text+
				"</div>";
			}
		}
		else if(typeof oMonster.trait == "object") {
			trait+="<div class='trait i4-tipe'>"+
				"<span class='i2-tipe'>"+oMonster.trait.name.trim()+"</span>"+
				oMonster.trait.text+
			"</div>";
		}

		var reaction = '';
		if(Array.isArray(oMonster.reaction)) {
			for(var i in oMonster.reaction){
				reaction+="<div class='reaction i4-tipe'>"+
					"<span class='i2-tipe'>"+oMonster.reaction[i].name.trim()+"</span>"+
					oMonster.reaction[i].text+
				"</div>";
			}
		}
		else if(typeof oMonster.reaction == "object") {
			reaction+="<div class='reaction i4-tipe'>"+
				"<span class='i2-tipe'>"+oMonster.reaction.name.trim()+"</span>"+
				oMonster.reaction.text+
			"</div>";
		}

		var action = '';
		if(Array.isArray(oMonster.action)) {
			for(var i in oMonster.action){
				action+="<div class='action i4-tipe'>"+
					"<span class='i2-tipe'>"+oMonster.action[i].name.trim()+"</span>"+
					oMonster.action[i].text+
				"</div>";
			}
		}
		else if(typeof oMonster.action == "object") {
			action+="<div class='action i4-tipe'>"+
				"<span class='i2-tipe'>"+oMonster.action.name.trim()+"</span>"+
				oMonster.action.text+
			"</div>";
		}
		if(action!='')
			action="<div class='actions i3-tipe'>Действия</div>"+action;

		var legendary = '';
		if(Array.isArray(oMonster.legendary)) {
			for(var i in oMonster.legendary){
				legendary+="<div class='legendary i4-tipe'>"+
					"<span class='i2-tipe'>"+oMonster.legendary[i].name.trim()+"</span>"+
					oMonster.legendary[i].text+
				"</div>";
			}
		}
		else if(typeof oMonster.legendary == "object") {
			legendary+="<div class='legendary i4-tipe'>"+
				"<span class='i2-tipe'>"+oMonster.legendary.name.trim()+"</span>"+
				oMonster.legendary.text+
			"</div>";
		}
		if(legendary!='')
			legendary="<div class='legendary i3-tipe'>Легендарные Действия</div>"+legendary;

		var spells = '';
		if(Array.isArray(oMonster.spells)) {
			for(var i in oMonster.spells){
				spells+="<div class='spells'>"+
					"<span class='i2-tipe'>"+oMonster.spells[i].name.trim()+"</span>"+
					oMonster.spells[i].text+
				"</div>";
			}
		}
		else if(typeof oMonster.spells == "object") {
			spells+="<div class='spells'>"+
				"<span class='i2-tipe'>"+oMonster.spells.name.trim()+"</span>"+
				oMonster.spells.text+
			"</div>";
		}

		//console.log("spells: "+spells);
		if(spells!='')
			spells="<div class='spellist i3-tipe'>Заклинания</div>"+spells;
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
		var expa = {
			"0": "0 - 10",
			"1/8": "25",
			"1/4": "50",
			"1/2": "100",
			"1": "200",
			"2": "450",
			"3": "700",
			"4": "1100",
			"5": "1800",
			"6": "2300",
			"7": "2900",
			"8": "3900",
			"9": "5000",
			"10": "5900",
			"11": "7200",
			"12": "8400",
			"13": "10000",
			"14": "11500",
			"15": "13000",
			"16": "15000",
			"17": "18000",
			"18": "20000",
			"19": "22000",
			"20": "25000",
			"21": "33000",
			"22": "41000",
			"23": "50000",
			"24": "62000",
			"25": "75000",
			"26": "90000",
			"27": "105000",
			"28": "120000",
			"29": "135000",
			"30": "155000"
		};

		var experience = "?";
		try{
			experience = expa[oMonster.cr].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
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
				sImage = '<div class="image" style="float: right;"><img src="img/monsters/' + oMonster.image + '" style="max-width: 350px"></div>';
			} else if(oMonster.image.src && oMonster.image.type) {
				sImage = '<div class="image '+oMonster.image.type+'"  style="float: right;"><img src="img/monsters/' + oMonster.image.src + '" style="max-width: 350px"></div>';
			}
		}

		var ret = '<div class="' + sClass + '" data-name="'+name.toLowerCase()+'">'+
		oHide+
		oLock+
			"<div class='left'><div class='inner'>"+
			'<div class="name">' + name + '</div>'+
			'<div>'+
				size+
				'<span class="type">' + oMonster.type + '</span>'+
				'<span class="alignment">' + oMonster.alignment + '</span>'+
			'</div>'+
			'<hr>'+
			sImage+
			sFiction+
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
			"</div></div><div class='right'><div class='inner'>"+
			action+
			legendary+
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
			sName = sName.toLowerCase().trim();
			filteredMonsters = filteredMonsters.filter(function(monster){
				return (monster.name.toLowerCase().trim().indexOf(sName)>=0);
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
					if(aTypes[i].toLowerCase().trim() == monster.sType.toLowerCase().trim()) {
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
					if(monster.aSubtypes.indexOf(aSubTypes[i].toLowerCase().trim()) >= 0) {
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
		filteredMonsters.sort(function(a, b) {

			if (translateCR(a.cr)+a.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") < translateCR(b.cr)+b.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") )
				return -1;
			if (translateCR(a.cr)+a.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") > translateCR(b.cr)+b.name.toLowerCase().replace(/\s+|\([^)(]+\)/g, "") )
				return 1;

			return 0
		});

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
				fHidden: fHidden
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

	// filters

	// name select
	$("body").on('focusout', "#NameInput", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterMonsters();
		}, nTimerSeconds);
	});
	$("body").on('keyup', "#NameInput input", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterMonsters();
		}, nTimerSeconds*3);
	});


	// level select
	$("body").on('click', "#levelToggle label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterMonsters();
		}, nTimerSeconds);
	});

	// type select
	$("body").on('click', "#TypeToggle label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			setSubtypeToggleEnable();
			filterMonsters();
		}, nTimerSeconds);
	});

	// subtype select
	$("body").on('click', "#SubTypeToggle label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterMonsters();
		}, nTimerSeconds);
	});

	// source combobox
	$("body").on('click', "#SourceCombobox label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
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
			filterMonsters();
		}, nTimerSeconds);
	});
	$("body").on('click', "#SizeCombobox .combo_box_title, #SizeCombobox .combo_box_arrow", function(){
		setConfig("sizeOpen", $("#SizeCombobox").attr("data-content-open"));
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
	// unhide spells
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




function startCatalog() {
	console.log("Try to start...");
	$.when(createSidebar()).done(
		function(){
			$("#showAllMonsters").slideDown();
			if(getViewPortSize("width") > 600){
				if(getConfig("infiIsShown")==true)
					filterMonsters();
			}
		}
	);
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

};
