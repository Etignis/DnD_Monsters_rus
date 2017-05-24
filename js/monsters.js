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

window.onload = function(){
	var monsterLevels = [];
	var monsterTypes = [];

	var oTimer; // for TimeOut (filtering)
	var nTimerSeconds = 100;
	
	var aHiddenSpells = [];
	var aLockedSpells = {};
	var filteredSpells = [];
	
	var oSource = {};
	
	function arrDiff(arr1, arr2) {
		var arr3 = arr2.map(function(item){return item.en});
		return arr1.filter(
			function(item){ 
				return (arr3.indexOf(item.en.name)>=0)? false: true;
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
	
	function createToggle(src, params) {
		var ret = '';
		var id =  params.id? "id='"+params.id+"'": "";
		var mode = params.mode || "fix";
		
		var modeClass = " class='mode_"+mode+"' ";
			
		for (var i =0; i < src.length; i++) {
			var type = src[i];
			var sOptionValue, sOptionLabel;
			if(typeof type == "number" || typeof type == "string") {
				sOptionValue = sOptionLabel = type;
			} else {
				sOptionValue = type.key;
				sOptionLabel = type.title;
			}
			
			ret+="<input type='checkbox' value='"+sOptionValue+"' id='tg_"+sOptionValue+"'><label for='tg_"+sOptionValue+"' "+modeClass+" data-hierarchy='root'>"+sOptionLabel+"</label>";
			
		}
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
		
	function createCard(spell, lang, sClass, sLockedSpell) {
		if (spell[lang] || (lang="en", spell[lang])) {
			var o = spell[lang];
			var s_name = o.name;
			var s_ritual = o.ritual? " ("+o.ritual+")" : "";
			var s_castingTime = o.castingTime;
			var s_range = pretifyString(o.range);
			var s_components = o.components;
			var s_duration = pretifyString(o.duration.replace(/концентрация/ig, "конц-я"));
			var s_materials = o.materials;
			var s_text = o.text;
			var s_level = o.level;
			var s_source = o.source? o.source : spell.en.source? spell.en.source: "";
			var st_castingTime, st_range, st_components, st_duration;
			switch (lang){		
				case "ru": 
					s_level = s_level>0? s_level + " круг" : "Трюк"; 
					st_castingTime = "Время накладывания";
					st_range = "Дистанция";
					st_components = "Компоненты";
					st_duration = "Длительность";
					break;	
				default: 
					s_level = s_level>0? s_level + " lvl" : "Cantrip";
					st_castingTime = "CASTING TIME";
					st_range = "RANGE";
					st_components = "COMPONENTS";
					st_duration = "DURATION";	
			}
			var s_school = o.school;
			var sNeedHelp = (spell.ru && spell.ru.needHelp)? "Как лучше перевести?" : "";
			
			var sClassName = classSpells[sClass]? classSpells[sClass].title[lang] : false;
			var bHideSpell = '<span class="bHideSpell" title="Скрыть заклинание (будет внизу панели фильтров)"><i class="fa fa-eye-slash" aria-hidden="true"></i></span>';			
			var bLockSpell = sLockedSpell? '<span class="bUnlockSpell" title="Открепить обратно"><i class="fa fa-unlock-alt" aria-hidden="true"></i></span>' : '<span class="bLockSpell" title="Закорепить заклинане (не будут действовать фильтры)"><i class="fa fa-lock" aria-hidden="true"></i></span>';			
			
			sLockedSpell = sLockedSpell? " lockedSpell " : "";
			
			var sNameRu;
			try{
				spell.ru.name.length;
				sNameRu  = spell.ru.name;
			} catch (err) {
				console.log("!: "+spell.en.name);
				sNameRu = spell.en.name;
			}
			
			var title = spell.en.name;
			if (lang=='en') {
				title = (spell.ru && spell.ru.name)?spell.ru.name: spell.en.name;
			}
			
			ret = '<div class="cardContainer '+sClass+ sLockedSpell +'" data-level="' + spell.en.level + '" data-school="' + spell.en.school + '" data-name="' + spell.en.name + '" data-name-ru="' + sNameRu + '" data-lang="' + lang + '" data-class="' + sClass + '">'+
				'<div class="spellCard">'+
					'<div class="content">'+
						bLockSpell +
						bHideSpell +
						'<h1 title="'+title+(sNeedHelp?" ("+sNeedHelp+")":"")+'">' + s_name + s_ritual + '</h1>'+
						'<div class="row">'+
							'<div class="cell castingTime">'+
								'<b>'+st_castingTime+'</b>'+
								'<span>' + s_castingTime + '</span>'+
							'</div>'+
							'<div class="cell range">'+
								'<b>'+st_range+'</b>'+
								'<span>' + s_range + '</span>'+
							'</div>'+
						'</div>'+
						'<div class="row">'+
							'<div class="cell components">'+
								'<b>'+st_components+'</b>'+
								'<span>' + s_components + '</span>'+
							'</div>'+
							'<div class="cell duration">'+
								'<b>'+st_duration+'</b>'+
								'<span>' + s_duration + '</span>'+
							'</div>'+
						'</div>'+
						'<div class="materials">' + s_materials + '</div>'+
						'<div class="text">' + s_text + '</div>	'+	
						(sClassName? '<b class="class">' + sClassName + '</b>' : "")+
						'<b class="school">' + s_level + ", " + s_school + (s_source?" <span title=\"Источник: "+ oSource[o.source]+"\">("+s_source+")</span>":"")+'</b>'+
					'</div>'+
				'</div>'+
			'</div>';
			return ret;
		} else {
			console.log("not found: ");
			console.dir(spell);
		}
	}
	
	
	function createSpellsIndex() {
		var spells = "";
		allSpells.forEach(function(item) {
			spells += createCard(item);
		});
		$(".spellContainer").html(spells);
		$("#before_spells").hide();
		$("#info_text").hide();
	}
	function showFiltered(oParams) {
		var sName = oParams.sName;
		var sClass = oParams.sClass;
		var sSubClass = oParams.sSubClass;
		var sSubSubClass = oParams.sSubSubClass;
		var nLevelStart = oParams.nLevelStart;
		var nLevelEnd = oParams.nLevelEnd;
		var aSchools = oParams.aSchools;
		var aSources = oParams.aSources;
		var sLang = oParams.sLang;
		
		var fHiddenSpells = (aHiddenSpells.length>0)? true: false;
		var fLockedSpells = (aLockedSpells.length>0)? true: false;
		
		$(".spellContainer").empty();
		var spells = "";
		

		filteredSpells = []; //arrDiff(filteredSpells, aHiddenSpells);
		
		
		//class
		var aSpells = [];
		if(sClass) {
			if(classSpells[sClass]) {
				aSpells = aSpells.concat(classSpells[sClass].spells);
				if(classSpells[sClass].subclasses && classSpells[sClass].subclasses[sSubClass]) {
					if(classSpells[sClass].subclasses[sSubClass].spells)
						aSpells = aSpells.concat(classSpells[sClass].subclasses[sSubClass].spells);
					if(classSpells[sClass].subclasses[sSubClass].subclasses && classSpells[sClass].subclasses[sSubClass].subclasses[sSubSubClass]) {
						aSpells = aSpells.concat(classSpells[sClass].subclasses[sSubClass].subclasses[sSubSubClass].spells);
					}
				}
				aSpells.forEach(function(spellName){
					var fFind = false;
					for (var i = 0; i<allSpells.length; i++){

						if(allSpells[i].en.name == spellName) {
							filteredSpells.push(allSpells[i]);
							fFind = true;
							break;
						}
					}
					if(!fFind){
						//console.log(spellName);
					}
				})
			}	else {
				filteredSpells = allSpells;
			} 
		} else {
			filteredSpells = allSpells;
		}
		
		// level
		/**/
		if(nLevelStart && nLevelEnd) {
			filteredSpells = filteredSpells.filter(function(spell){
				return !(spell.en.level < nLevelStart || spell.en.level > nLevelEnd);
			});
		}
		/**/
		
		
		//school		
		if(aSchools && aSchools.length>0 && aSchools.length<99) {
			filteredSpells = filteredSpells.filter(function(spell){
				for(var i = 0; i < aSchools.length; i++) {
					if(aSchools[i].toLowerCase().trim() == spell.en.school.toLowerCase().trim()) {
						return true;
					}
				}
				return false;
			});
		}
		
		//source		
		if(aSources && aSources.length>0 && aSources.length<9) {
			filteredSpells = filteredSpells.filter(function(spell){
				for(var i = 0; i < aSources.length; i++) {

					if(aSources[i].toLowerCase().trim() == spell.en.source.toLowerCase().trim()) {
						return true;
					}
				}
				return false;
			});
		}
			
		// name
		if (sName) {
			sName = sName.toLowerCase().trim();
			filteredSpells = filteredSpells.filter(function(spell){
				return (spell.en.name.toLowerCase().trim().indexOf(sName)>=0 || (spell.ru && spell.ru.name.toLowerCase().trim().indexOf(sName)>=0));
			});
		}
		
		
		filteredSpells = fHiddenSpells? arrDiff(filteredSpells, aHiddenSpells) : filteredSpells;
		//filteredSpells = fLockedSpells? filteredSpells.concat(aLockedSpells) : filteredSpells;
		if (fLockedSpells) {
			for (var i = 0; i<allSpells.length; i++){	
				for (var j=0; j<aLockedSpells.length; j++){
					if(allSpells[i].en.name == aLockedSpells[j].en) {
						filteredSpells.push(allSpells[i]);
						break;
					}
				}
			}
		}
			
		// sort
		filteredSpells.sort(function(a, b) {
			if(a[sLang] && b[sLang]) {
				if (a[sLang].level+a[sLang].name.toLowerCase().trim() < b[sLang].level+b[sLang].name.toLowerCase().trim() )
					return -1;
				if (a[sLang].level+a[sLang].name.toLowerCase().trim() > b[sLang].level+b[sLang].name.toLowerCase().trim() )
					return 1;
			}
			return 0
		});
					
		for (var i in filteredSpells) {
			if(filteredSpells[i]) {
				var fLocked = filteredSpells[i].locked? true: false;
				var tmp = createCard(filteredSpells[i], sLang, sClass, fLocked)
				if (tmp)
					spells += tmp;
			} 
		}

		$(".spellContainer").html(spells);
		$("#before_spells").hide();
		$("#info_text").hide();
	}
	
	function filterSpells(oParams){
		var sName = $("#NameInput input").val();
		var sClass = $("#ClassSelect .label").attr("data-selected-key");
		var sSubClass = $("#SubClassSelect .label").attr("data-selected-key");
		var sSubSubClass = $("#SubSubClassSelect .label").attr("data-selected-key");
		var nLevelStart = $("#LevelStart .label").attr("data-selected-key");
		var nLevelEnd = $("#LevelEnd .label").attr("data-selected-key");
		var aSchools = $("#SchoolCombobox .combo_box_title").attr("data-val");
			if(aSchools) aSchools = aSchools.split(",").map(function(item){return item.trim()});
		var aSources = $("#SourceCombobox .combo_box_title").attr("data-val");
			if(aSources) aSources = aSources.split(",").map(function(item){return item.trim()});
		var sLang = $("#LangSelect .label").attr("data-selected-key");
		
		var fHidden = (aHiddenSpells.length>0)? true: false;
		
		setConfig("language", sLang);
		//setConfig("schoolOpen", $("#SchoolCombobox").attr("data-content-open"));
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			showFiltered({
				sName: sName, 
				sClass: sClass, 
				sSubClass: sSubClass, 
				sSubSubClass: sSubSubClass, 
				nLevelStart: nLevelStart, 
				nLevelEnd: nLevelEnd, 
				aSchools: aSchools, 
				aSources: aSources,
				sLang: sLang,
				fHidden: fHidden
				});
		}, nTimerSeconds/4);		
		
	}
	
	function colectMonstersParams() {
		//monsterLevels[]
		//monsterTypes[]
		var tmpMonsterTypes = {};
		
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
			
		});
		
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
				oType.subtype = aSubtype;
			}
			monsterTypes.push(oType);
		}
		
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
		/*/
		sourceList.forEach(function(el) {			
			oSource[el.key] = el.en;
		});
		/**/
	}
	
	function createTypeToggle() {	

		var s1=createToggle(monsterTypes, {id: "SourceCombobox", title: "Типы", checkAll: true});
		$(".p_side").append("<div class='mediaWidth'>" + s1 + "</div>");
		/*/
		sourceList.forEach(function(el) {			
			oSource[el.key] = el.en;
		});
		/**/
	}
	function createNameFilter() {
		var ret=createInput({id: "NameInput"});
		var label = createLabel("Название");
		$(".p_side").append("<div class='mediaWidth'>" + label + ret + "</div>");		
	}
	
	function createLevelToggle(){
		var label = createLabel("Класс Сложности");
		var s1 = createToggle(monsterLevels, {"id": "levelToggle"});
		$(".p_side").append("<div class='mediaWidth'>"  + label +  s1 + "</div>");
	}
	
	function createHiddenSpellsList(){
		if(aHiddenSpells.length < 1){
			$("#HiddenSpells").parent().remove();
			return;
		}
		if(!$("#HiddenSpells").length>0){
			var label = createLabel("Скрытые заклинания");
			$("#LangSelect").parent().after("<div class='mediaWidth'>" + label + "<div id='HiddenSpells'></div></div>");
		}
		var listHiddenSpells = aHiddenSpells.map(function(item){
			return "<a href='#' title='Вернуть на место' class='bUnhideSpell' data-name='"+item.en+"'>"+item.ru +" ("+ item.en+") </a>";
			}).join(" ");
			
		var bReturnAll = "<a href='#' class='bReturnUnvisible'>Вернуть все обратно</a>";
		$("#HiddenSpells").html(bReturnAll + listHiddenSpells);			
	}
	
	function createLockedSpellsArea(){
		var aLocked = [];
		for (var i in aLockedSpells){
			aLocked.push(i);
		}
		var aResult = [];
		var l = aLocked.length;
		if(l>0){
			for (var i=0; i<allSpells.length; i++) {
				for (var j=0; j< l; j++) {
					if(allSpells[i].en.name == aLocked[j]) {
						aResult.push(allSpells[i]);
						aResult[aResult.length-1].lang = aLockedSpells[aLocked[j]].lang;
						aResult[aResult.length-1].class = aLockedSpells[aLocked[j]].class;
					}
				}
			}
			
			if($("#lockedSpellsArea").length<1){
				$(".p_cont").prepend("<div id='lockedSpellsArea'><span class='bUnlockAll'>Открепить все</span><span class='topHeader'></span><div class='content row'></div><span class='bottomHeader'></span></div>");

			}
			$("#lockedSpellsArea .content").html(aResult.sort(function(a, b) {
				if(a.lang && b.lang) {
					if (a[a.lang].level+a[a.lang].name.toLowerCase().trim() < b[b.lang].level+b[b.lang].name.toLowerCase().trim() )
						return -1;
					if (a[a.lang].level+a[a.lang].name.toLowerCase().trim() > b[b.lang].level+b[b.lang].name.toLowerCase().trim() )
						return 1;
				}
				return 0
			}).map(function(el){return createCard(el, el.lang, el.class, true)}));	
			
			//COUNTER
			$("#lockedSpellsArea .topHeader").html("("+l+")");
			$(".spellContainer").addClass("noprint");
		} else {
			$("#lockedSpellsArea").remove();
			$(".spellContainer").removeClass("noprint");
		}
	}
	
	function createSidebar() {
		// menu buttons
		createButtons();
		
		// name
		createNameFilter();		
		
		// collect data for level & type
		colectMonstersParams();
		
		// level
		createLevelToggle();	
		
		//size
		createSizeCombobox();
		
		// type
		createTypeToggle();
		
		//source
		createSourceCombobox();	
		
		// view
		//createViewSelect();
		
		$(".p_side").fadeIn();	
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
			filterSpells();
		}, nTimerSeconds);		
	});
	$("body").on('keyup', "#NameInput input", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterSpells();
		}, nTimerSeconds*3);		
	});
	// class select
	$("body").on('focusout', "#ClassSelect", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterSpells();
			var sClass = $("#ClassSelect .label").attr("data-selected-key");
			createSubClassSelect(sClass);
		}, nTimerSeconds);		
	});
	// sub class select
	$("body").on('focusout', "#SubClassSelect", function(){
		clearTimeout(oTimer);
		
		oTimer = setTimeout(function(){
			filterSpells();
			var sClass = $("#ClassSelect .label").attr("data-selected-key");
			var sSubClass = $("#SubClassSelect .label").attr("data-selected-key");
			createSubSubClassSelect(sClass, sSubClass);
		}, nTimerSeconds);		
	});
	// sub sub class select
	$("body").on('focusout', "#SubSubClassSelect", function(){
		clearTimeout(oTimer);
		
		oTimer = setTimeout(function(){
			filterSpells();			
		}, nTimerSeconds);		
	});
	
	// level select
	$("body").on('focusout', "#LevelStart", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterSpells();
		}, nTimerSeconds);		
	});
	$("body").on('focusout', "#LevelEnd", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterSpells();
		}, nTimerSeconds);		
	});
	// school combobox
	$("body").on('click', "#SchoolCombobox label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterSpells();
		}, nTimerSeconds);		
	});
	$("body").on('click', "#SchoolCombobox .combo_box_title, #SchoolCombobox .combo_box_arrow", function(){
		setConfig("schoolOpen", $("#SchoolCombobox").attr("data-content-open"));	
	});
	
	// source combobox
	$("body").on('click', "#SourceCombobox label", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterSpells();
		}, nTimerSeconds);		
	});
	$("body").on('click', "#SourceCombobox .combo_box_title, #SourceCombobox .combo_box_arrow", function(){
		setConfig("sourceOpen", $("#SourceCombobox").attr("data-content-open"));	
	});
	
	// lang select
	$("body").on('focusout', "#LangSelect", function(){
		clearTimeout(oTimer);
		oTimer = setTimeout(function(){
			filterSpells();
		}, nTimerSeconds);		
	});
	
	// show all moncters
	$("body").on('click', "#showAllMonsters", function(){
		setConfig("infiIsShown", true);
		filterSpells();	
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
	$("body").on('click', ".bHideSpell", function(){
		var sName = $(this).closest(".cardContainer").attr("data-name");
		var sNameRu = $(this).closest(".cardContainer").attr("data-name-ru");
		
		$(this).hide();
		// update hidden spells array
		aHiddenSpells.push({en: sName, ru: sNameRu}); 
		
		// show list of hidden spells
		createHiddenSpellsList();
		
		// show spells without hidden
		filterSpells({fHidden: true});
	})
	// unhide spells
	$("body").on('click', ".bUnhideSpell", function(){
		var sName = $(this).attr("data-name")
		// update hidden spells array
		aHiddenSpells.splice(aHiddenSpells.map(function(el){return el.en}).indexOf(sName), 1); 
		
		// show list of hidden spells
		createHiddenSpellsList();
		
		// show spells without hidden
		filterSpells({fHidden: true});
		
		return false;
	})
	$("body").on("click", ".bReturnUnvisible", function() {
		aHiddenSpells = [];// show list of hidden spells
		createHiddenSpellsList();
		
		// show spells without hidden
		filterSpells({fHidden: true});
		
		return false;
	});
	
	// lock spells
	$("body").on('click', ".bLockSpell", function(){
		var sName = $(this).closest(".cardContainer").attr("data-name");
		var sNameRu = $(this).closest(".cardContainer").attr("data-name-ru");
		var sLang = $(this).closest(".cardContainer").attr("data-lang");
		var sClass= $(this).closest(".cardContainer").attr("data-class");
		
		
		aLockedSpells[sName] = {
			ru: sNameRu,
			lang: sLang,
			class: sClass
			};
		
		// show locked
		createLockedSpellsArea();
	})
	
	// unlock spells
	$("body").on('click', ".bUnlockSpell", function(){
		var sName = $(this).closest(".cardContainer").attr("data-name");
		
		delete aLockedSpells[sName];
		
		// show locked
		createLockedSpellsArea();
	})
	$("body").on('click', "#lockedSpellsArea .topHeader", function(){
		$(this).next(".content").slideToggle();
		$(this).next(".content").next(".bottomHeader").fadeToggle();
	});
	$("body").on('click', ".bUnlockAll", function(){
		aLockedSpells = [];
		// show locked
		createLockedSpellsArea();
	});
	
	$("body").on('click', "#bPrint", function(){
		window.print();
		
		return false;
	});
		
	
	$.when(createSidebar()).done(
		function(){
			$("#showAllMonsters").slideDown();
			if(getViewPortSize("width") > 600){
				if(getConfig("infiIsShown")==true)
					filterSpells();

			}
		}
	);
}; 