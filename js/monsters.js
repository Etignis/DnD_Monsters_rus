$(window).load(function(){
	var f_type=1;
	// перемешивание
	function shuffle(o){
    for(var j, x, k = o.length; k; j = Math.floor(Math.random() * k), x = o[--k], o[k] = o[j], o[j] = x);
    return o;
};
/*
list = list.split(";");		
		list = shuffle(list);
*/
function randd(min, max) {    
    //return 3;//
	var rnd = Math.floor(arguments.length > 1 ? (max - min + 1) * Math.random() + min : (min + 1) * Math.random());
	console.log("rand num: "+rnd);
	return rnd;
}
function is_array (a) {
    return (typeof a == "object") && (a instanceof Array);
}
Array.prototype.shuffle = function() {
    for (var i = this.length - 1; i > 0; i--) {
        var num = Math.floor(Math.random() * (i + 1));
        var d = this[num];
        this[num] = this[i];
        this[i] = d;
    }
    return this;
}
// parameters from URL
function getParamsURL(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
function find_type(){
	console.log("f find_type");
	//$("body").css('opacity', '0.6');
	var pars=getParamsURL()["type"];
	if (pars === undefined || pars=='') 
		{
		if($("#ch_vw_2").prop('checked'))
			type=1;
		else
			type=0;
		}
		else
		type = pars;
	//console.log(pars);
	if(type==1)
	{
		$(".pagebreak").remove();
		$("#ch_vw_1").prop('checked', false);
		$("#ch_vw_2").prop('checked', true);
		console.log("ch 1 1 1 1");
		var f_num=1;
		if($(".monster").length>0)
			{
			$(".monster").each(function(){
				$(this).addClass("monster_card").removeClass("monster");
				//console.log("f_num: "+f_num);
				if($(this).is(':visible'))
					f_num*=-1;
				if(f_num>0)
					{
					//$(this).after("<div class='pagebreak'></div>");
					}
			});
			}
		else
			{
			$(".monster_card").each(function(){
				//console.log("f_num: "+f_num);
				if($(this).is(':visible'))
					f_num*=-1;
				if(f_num>0)
					{
					$(this).after("<div class='pagebreak'></div>");
					}
			});
			}
	}
	//if(type==0)
	else
	{
		$("#ch_vw_2").prop('checked', false);
		$("#ch_vw_1").prop('checked', true);
		console.log("ch 2 2 2 2 2 ");
		$(".monster_card").each(function(){
			$(this).addClass("monster").removeClass("monster_card");
		});
	}
	//$("body").css('opacity', '1');
	$('#load').fadeOut();
}
// Константы //
//var IMF_RF="<img src='img/i_rf.png' class='i_rf' style='width: 16px'>";
//var IMF_RF="<span style='width: 16px; height: 16px; background: url(img/i_rf.png) center center no-repeat; background-size: cover; display: inline-block;'></span>";
//var IMF_QW="<img src='img/i_qw.png' class='i_qw' style='width: 16px'>";
var IMF_RF="<i class='fa  fa-refresh'></i>";
var IMF_QW="<i class='fa fa-question-circle'></i>";
var str_ch="", str_ml="";
//////////////
	function filter_ch(){
		$(".challenge input[type=checkbox]:checked").attr("disabled", true);
		str_ch="";
		$(".challenge input[type=checkbox]:checked").each(function(){
			str_ch+=$(this).next("label").text()+",";
		});
		console.log("ch string: " + str_ch)
		if(str_ch=='' && str_ml=='')
			{
			$(".monster, .monster_card").show();	
			}
		else
		{
			var arr_ch = str_ch.split(",");
			$(".monster, .monster_card").each(function(){
				$(this).hide();
				var cr = parseInt($(this).find(".cr_num").text());
				for(var i=0; i< arr_ch.length; i++)
					{
					if(parseInt(arr_ch[i])==parseInt(cr))
						$(this).show();	
					}
			});			
		}	
		$(".challenge input[type=checkbox]:checked").removeAttr("disabled");
		//find_type();
	}
	function filter_mn(){
		str_ml="";
		$(".monsters input[type=checkbox]:checked").each(function(){
			str_ml+=$(this).next("label").text()+",";
		});
		if(str_ch=='' && str_ml=='')
		{
		$(".monster, .monster_card").show();	
		}
		else
		{
			var arr_ml = str_ml.split(",");
			$(".monster, .monster_card").each(function(){
				$(this).hide();
				var ml = $(this).find(".name").text();
				for(var i=0; i< arr_ml.length; i++)
					{
					if(arr_ml[i]==ml)
						$(this).show();	
					}
			});			
		}
		find_type();
	}
	function make_generator(){
		var challenge = "<div class='challenge block'><h2>Класс Сложности:</h2>"+
			"<input type='checkbox' id='ch_ch_0'><label for='ch_ch_0' class='ch_lb'>0</label>"+
			"<input type='checkbox' id='ch_ch_1'><label for='ch_ch_1' class='ch_lb'>1/8</label>"+
			"<input type='checkbox' id='ch_ch_2'><label for='ch_ch_2' class='ch_lb'>1/4</label>"+
			"<input type='checkbox' id='ch_ch_3'><label for='ch_ch_3' class='ch_lb'>1/2</label>"+
			"<input type='checkbox' id='ch_ch_4'><label for='ch_ch_4' class='ch_lb'>1</label>"+
			"<input type='checkbox' id='ch_ch_5'><label for='ch_ch_5' class='ch_lb'>2</label>"+
			"<input type='checkbox' id='ch_ch_6'><label for='ch_ch_6' class='ch_lb'>3</label>"+
			"<input type='checkbox' id='ch_ch_7'><label for='ch_ch_7' class='ch_lb'>4</label>"+
			"<input type='checkbox' id='ch_ch_8'><label for='ch_ch_8' class='ch_lb'>5</label>"+
			"<input type='checkbox' id='ch_ch_9'><label for='ch_ch_9' class='ch_lb'>6</label>"+
			"<input type='checkbox' id='ch_ch_10'><label for='ch_ch_10' class='ch_lb'>7</label>"+
			"<input type='checkbox' id='ch_ch_11'><label for='ch_ch_11' class='ch_lb'>8</label>"+
			"<input type='checkbox' id='ch_ch_12'><label for='ch_ch_12' class='ch_lb'>9</label>"+
			"<input type='checkbox' id='ch_ch_13'><label for='ch_ch_13' class='ch_lb'>10</label>"+
			"<input type='checkbox' id='ch_ch_14'><label for='ch_ch_14' class='ch_lb'>11</label>"+
			"<input type='checkbox' id='ch_ch_15'><label for='ch_ch_15' class='ch_lb'>12</label>"+
			"<input type='checkbox' id='ch_ch_16'><label for='ch_ch_16' class='ch_lb'>13</label>"+
			"<input type='checkbox' id='ch_ch_17'><label for='ch_ch_17' class='ch_lb'>14</label>"+
			"<input type='checkbox' id='ch_ch_18'><label for='ch_ch_18' class='ch_lb'>15</label>"+
			"<input type='checkbox' id='ch_ch_19'><label for='ch_ch_19' class='ch_lb'>16</label>"+
			"<input type='checkbox' id='ch_ch_20'><label for='ch_ch_20' class='ch_lb'>17</label>"+
			"<input type='checkbox' id='ch_ch_21'><label for='ch_ch_21' class='ch_lb'>18</label>"+
			"<input type='checkbox' id='ch_ch_22'><label for='ch_ch_22' class='ch_lb'>19</label>"+
			"<input type='checkbox' id='ch_ch_23'><label for='ch_ch_23' class='ch_lb'>20</label>"+
			"<input type='checkbox' id='ch_ch_24'><label for='ch_ch_24' class='ch_lb'>21</label>"+
			"<input type='checkbox' id='ch_ch_25'><label for='ch_ch_25' class='ch_lb'>22</label>"+
			"<input type='checkbox' id='ch_ch_26'><label for='ch_ch_26' class='ch_lb'>23</label>"+
			"<input type='checkbox' id='ch_ch_27'><label for='ch_ch_27' class='ch_lb'>24</label>"+
		"</div>";
		
		var arr_challenge = [0]; // уровень вызова
		var arr_size = []; // размер
		var arr_size_etalon = [
			"Крошечный",
			"Маленький",
			"Средний",
			"Большой",
			"Огромный",
			"Колоссальный"
		];
		var arr_type = []; // тип

		$(".monster, .monster_card").each(function(){
			var cr = $(this).find(".cr_num").text().trim(); // уровень вызова
			var size = $(this).find(".size").text().trim(); // размер
			var type = $(this).find(".type").text().trim(); // тип
				type = /^[А-Яа-яЁёA-Za-z]+/.exec(type)[0].trim();
			var subtype = $(this).find(".type").text().trim(); // подтип
				subtype = /([А-Яа-яЁёA-Za-z]+)/.exec(type)[0].trim();
			
			var f_challenge_is=0; // флаг вызова
			var f_size_is=0; // флаг вызова
			var f_type_is=0; // флаг типа
			var f_subtype_is=0; // флаг подтипа
			
			// вызов
			for(i=0; i<arr_challenge.length; i++)
				{
				if(arr_challenge[i]==cr)
					{
					f_challenge_is=1;
					break;					
					}					
				}
			if(f_challenge_is==0)
				{
				arr_challenge[arr_challenge.length]=cr;	
				}
				
				/*/
			// размер
			for(i=0; i<arr_size.length; i++)
				{
				if(arr_size[i]==size)
					{
					f_size_is=1;
					break;					
					}					
				}
			if(f_size_is==0)
				{
				arr_size[arr_size.length]=size;	
				}
			/**/

			// тип
			for(i=0; i<arr_type.length; i++)
				{
				if(arr_type[i]==type)
					{
					f_type_is=1;
					break;					
					}					
				}
			if(f_type_is==0)
				{
				arr_type[arr_type.length]=type;	
				}
			
			// подтип
			if(subtype) {
			for(i=0; i<arr_subtype.length; i++)
				{
				if(arr_subtype[i]==subtype)
					{
					f_subtype_is=1;
					break;					
					}					
				}
			if(f_subtype_is==0)
				{
				arr_subtype[arr_subtype.length]=subtype;	
				}
			}
		});		
		
		// уровень вызова
		for (var j = 0, len = arr_challenge.length - 1; j < len; j++) 
			{
			swapped = 0;
			var i = 0;
			while (i < len) 
				{
				if (parseFloat(eval(arr_challenge[i])) > parseFloat(eval(arr_challenge[i + 1]))) 
					{
					var c = arr_challenge[i];
					arr_challenge[i] = arr_challenge[i + 1];
					arr_challenge[i + 1] = c;
					swapped = 1;
					}
				i++;
				}
			
			if(swapped==0)
				break;
			}
		
		/*/
		// размер
		for (var j = 0, len = arr_size.length - 1; j < len; j++) 
			{
			swapped = 0;
			var i = 0;
			while (i < len) 
				{
				if (0) 
					{
					var c = arr_size[i];
					arr_size[i] = arr_size[i + 1];
					arr_size[i + 1] = c;
					swapped = 1;
					}
				i++;
				}
			
			if(swapped==0)
				break;
			}

		/**/	
		filter_challenge_out='';
		arr_challenge.forEach(function(item, i, arr_challenge) {			
		  filter_challenge_out+="<input type='checkbox' id='ch_ch_"+i+"'><label for='ch_ch_"+i+"' class='ch_lb'>"+item+"</label>";	
		});
		
		filter_size_out='';
		arr_size_etalon.forEach(function(item, i) {	
			var font_size = "";
			if(item.length > 9) {
				font_size = 100 - (item.length - 9) * 5;
				font_size = " style='font-size: " + font_size + "%' ";
			}
		  filter_size_out+="<input type='checkbox' id='ch_sz_"+i+"'><label for='ch_sz_"+i+"' class='ch_lb' " + font_size + ">"+item+"</label>";	
		});
		
		filter_type_out='';
		arr_type.forEach(function(item, i) {	
			var font_size = "";
			if(item.length > 9) {
				font_size = 100 - (item.length - 9) * 5;
				font_size = " style='font-size: " + font_size + "%' ";
			}
		  filter_type_out+="<input type='checkbox' id='ch_tp_"+i+"'><label for='ch_tp_"+i+"' class='ch_lb' " + font_size + ">"+item+"</label>";	
		});
		
		filter_subtype_out='';
		arr_subtype.forEach(function(item, i) {	
			var font_size = "";
			if(item.length > 9) {
				font_size = 100 - (item.length - 9) * 5;
				font_size = " style='font-size: " + font_size + "%' ";
			}
		  filter_subtype_out+="<input type='checkbox' id='ch_sbt_"+i+"'><label for='ch_sbt_"+i+"' class='ch_lb' " + font_size + ">"+item+"</label>";	
		});
		
			
			challenge="<div class='challenge block'><h2>Класс Сложности:</h2>"+filter_challenge_out+"</div>";
			size="<div class='size block'><h2>Размер:</h2>"+filter_size_out+"</div>";
			type="<div class='type block'><h2>Тип и подтип:</h2>"+filter_type_out+filter_subtype_out+"</div>";	
		var monsters = "<div class='monsters block' style='display: none'>"+
			"<input type='checkbox' id='ch_mn_1'><label for='ch_mn_1' class='ch_mn' data-mn='Гигантский паук (Giant Spider)'>Гигантский паук (Giant Spider)</label>"+
			"<input type='checkbox' id='ch_mn_2'><label for='ch_mn_2' class='ch_mn' data-mn='Паук (Spider)'>Паук (Spider)</label>"+
			"<input type='checkbox' id='ch_mn_3'><label for='ch_mn_3' class='ch_mn' data-mn='Рой крыс (Swarm of Rats)'>Рой крыс (Swarm of Rats)</label>"+
			"<input type='checkbox' id='ch_mn_4'><label for='ch_mn_4' class='ch_mn' data-mn='Крыса (Rat)'>Крыса (Rat)</label>"+
			"<input type='checkbox' id='ch_mn_5'><label for='ch_mn_5' class='ch_mn' data-mn='Летучая мышь (Bat)'>Летучая мышь (Bat)</label>"+
			"<input type='checkbox' id='ch_mn_6'><label for='ch_mn_6' class='ch_mn' data-mn='Гигантская летучая мышь (Giant Bat)'>Гигантская летучая мышь (Giant Bat)</label>"+
			"<input type='checkbox' id='ch_mn_7'><label for='ch_mn_7' class='ch_mn' data-mn='Черный Пудинг (Black Pudding)'>Черный Пудинг (Black Pudding)</label>"+
			"<input type='checkbox' id='ch_mn_8'><label for='ch_mn_8' class='ch_mn' data-mn='Желатиновый куб (Gelatinous Cube)'>Желатиновый куб (Gelatinous Cube)</label>"+
			"<input type='checkbox' id='ch_mn_9'><label for='ch_mn_9' class='ch_mn' data-mn='Охряное желе'>Охряное желе</label>"+
			"<input type='checkbox' id='ch_mn_10'><label for='ch_mn_10' class='ch_mn' data-mn='Фиолетовая плесень (Violet Fungus)'>Фиолетовая плесень (Violet Fungus)</label>"+
			"<input type='checkbox' id='ch_mn_11'><label for='ch_mn_11' class='ch_mn' data-mn='Капитан Бандитов (Bandit Captain)'>Капитан Бандитов (Bandit Captain)</label>"+
			"<input type='checkbox' id='ch_mn_12'><label for='ch_mn_12' class='ch_mn' data-mn='Бандит (Thug)'>Бандит (Thug)</label>"+
			"<input type='checkbox' id='ch_mn_13'><label for='ch_mn_13' class='ch_mn' data-mn='Культист (Cultist)'>Культист (Cultist)</label>"+
			"<input type='checkbox' id='ch_mn_14'><label for='ch_mn_14' class='ch_mn' data-mn='Анкег (Ankheg)'>Анкег (Ankheg)</label>"+
			"<input type='checkbox' id='ch_mn_15'><label for='ch_mn_15' class='ch_mn' data-mn='Разбуженное Дерево (Awakened Tree)'>Разбуженное Дерево (Awakened Tree)</label>"+
			"<input type='checkbox' id='ch_mn_16'><label for='ch_mn_16' class='ch_mn' data-mn='Ползущий Падальшик (Carrion Crawler)'>Ползущий Падальшик (Carrion Crawler)</label>"+
			"<input type='checkbox' id='ch_mn_17'><label for='ch_mn_17' class='ch_mn' data-mn='Фанатик (Cult Fanatic)'>Фанатик (Cult Fanatic)</label>"+
			"<input type='checkbox' id='ch_mn_18'><label for='ch_mn_18' class='ch_mn' data-mn='Эттеркап (Ettercap)'>Эттеркап (Ettercap)</label>"+
			"<input type='checkbox' id='ch_mn_19'><label for='ch_mn_19' class='ch_mn' data-mn='Вурдалак (Ghast)'>Вурдалак (Ghast)</label>"+
			"<input type='checkbox' id='ch_mn_20'><label for='ch_mn_20' class='ch_mn' data-mn='Мимик (Mimic)'>Мимик (Mimic)</label>"+
			"<input type='checkbox' id='ch_mn_21'><label for='ch_mn_21' class='ch_mn' data-mn='Нотик (Nothic)'>Нотик (Nothic)</label>"+
			"<input type='checkbox' id='ch_mn_22'><label for='ch_mn_22' class='ch_mn' data-mn='Перитон (Peryton)'>Перитон (Peryton)</label>"+
			"<input type='checkbox' id='ch_mn_23'><label for='ch_mn_23' class='ch_mn' data-mn='Огонек (Will-o'-Wisp)'>Огонек (Will-o'-Wisp)</label>"+
		"</div>";
		var lists = "<div class='lists block' style='display: none'><h2>Выборка:</h2>"+
			"<input type='checkbox' id='ch_ml_1'><label for='ch_ml_1' class='ml_1'>Простые монстры</label>"+
		"</div>"
		var view = "<div class='view block'><h2>Вид:</h2>\
			<input type='checkbox' id='ch_vw_1' class='ch_vw' checked><label for='ch_vw_1' class='vw_1'><i class='fa fa-align-justify'></i> Текст</label>\
			<input type='checkbox' id='ch_vw_2' class='ch_vw'><label for='ch_vw_2' class='vw_2'><i class='fa fa-th-large'></i> Карточки</label>\
			</div>";
		var hidden_m = "<div class='hidden block' style='display: none'><h2>Скрытые:</h2></div>";
		var f_name="<div class='s_name s_block flt'>"+
						"<span class='n_zero'>Название: </span>"+
						"<input type='text' class='f_name s_sp'>"+
					"</div>";
		var panel='<div class="panl block">\
		<a href="/" class="bt"><i class="fa fa-home"></i></a>\
		<a href="/message/?theme=dndmonsters" class="bt" target="_blanc">Написать отзыв или предложение</a>\
		<a href="#" class="bt" id="info"><i class="fa fa-question-circle"></i></a></div>';
		var generator=panel + challenge + size + type + f_name +view + hidden_m+  lists + monsters ;
		$("#panel").html(generator);
	}
	$.ajax({
        type: "GET",
        url: "data/all_monters_notabenoid.xml",
        dataType: "xml",
        success: xmlParser
    });
	
function monster_filter(name){
	console.log("monster_filter")
		tmp1=0, tmp2=0;
		$(".monster, .monster_card").show();
		var atr="";
		var atr2='';
		var f_atr2=0;
		
		// имя
		if(name!=undefined && name!='')
		{
			atr+= "[data-name*='"+name+"']";
		}
		
		if(atr!='') {	// if name
			$(".monster, .monster_card").hide();
			$(".monster"+atr+", .monster_card"+atr).show();
		}
		
		// сложность
		var str_ch="";
		if($(".challenge input[type=checkbox]:checked").length>0) {
			$(".challenge input[type=checkbox]:not(:checked)").each(function(){
				str_ch+=$(this).next("label").text()+",";
				});	
		}
		if(str_ch!='') {	
			var arr_ch = str_ch.split(",");		
			$(".monster, .monster_card").each(function(){ 
				var cr = String($(this).find(".cr_num").text());
				for (var i=0; i < arr_ch.length; i++) {
					var tmp_str = cr.trim();
					while (tmp_str.length > 1 && cr[0] == 0) {
						tmp_str = tmp_str.slice(1);
					}
					if (String(arr_ch[i]) == String(tmp_str) || tmp_str == arr_ch[i])
						$(this).hide();	
				}	
			});
		}
		
		// размер
		str_ch="";
		if($(".size input[type=checkbox]:checked").length>0) {
			$(".size input[type=checkbox]:not(:checked)").each(function(){
				str_ch+=$(this).next("label").text()+",";
				});	
		}
		if(str_ch!='') {	
			var arr_ch = str_ch.split(",");		
			$(".monster, .monster_card").each(function(){ 
				var monster_size = String($(this).find(".size").text()).trim();
				for(var i=0; i< arr_ch.length; i++) {	
					var size = arr_ch[i].trim();
					if(monster_size == size)
						$(this).hide();	
				}	
			});
		}
		
		// тип
		str_ch="";
		if($(".type input[type=checkbox]:checked").length>0) {
			$(".type input[type=checkbox]:not(:checked)").each(function(){
				str_ch+=$(this).next("label").text()+",";
				});	
		}
		if(str_ch!='') {	
			var arr_ch = str_ch.split(",");		
			$(".monster, .monster_card").each(function(){ 
				var monster_type = String($(this).find(".type").text()).trim();
					monster_type = /^[А-Яа-яЁёA-Za-z]+/.exec(monster_type)[0].trim();
				for(var i=0; i< arr_ch.length; i++) {	
					var type = arr_ch[i].trim();
					if(monster_type == type)
						$(this).hide();	
				}	
			});
		}
		
	}	
function get_filter(){
		var nm=$(".f_name").val().toLowerCase();		
		monster_filter(nm);
	}
	
function count_mod(num){
	var mod=Math.floor((num-10)/2);
	if(mod>0)
		mod="+"+mod;
	num = num+" ("+mod+")";
	return num;
}

function c_string(clas, s_clas, title, cont){
	//'<div class="vulnerable"><span class="i2-tipe">Уязвимость </span>' + $(this).find("vulnerable").text() + '</div>'+
	var string ='';
	if(cont!='')
		string = '<div class="'+clas+' i4-tipe"><span class="'+s_clas+'">'+title+' </span>'+cont+'</div>';
	return string;
}

function xmlParser(xml) {
    //$('#load').fadeOut();
	console.log("start xml-parsing");
	var data_id=0;
	var to_hidden='';
    $(xml).find("monster").each(function () {
		console.log("monster in work...");
/*
        $("#result").append('<div class="book"><div class="title">' + $(this).find("Title").text() + '</div><div class="description">' + $(this).find("Description").text() + '</div><div class="date">Published ' + $(this).find("Date").text() + '</div></div>');
*/		
		var size = '';
		size = $(this).find("size").text();
		switch(size)
		{
			case "T": size="Крошечный"; break;
			case "S": size="Маленький"; break;
			case "M": size="Средний"; break;
			case "L": size="Большой"; break;
			case "H": size="Огромный"; break;
			case "G": size="Колоссальный"; break;
		}
		size='<span class="size">' + size + ' </span>'
		var trait = '';
		$(this).find("trait").each(function(){
			trait+="<div class='trait i4-tipe'>"+
				"<span class='i2-tipe'>"+$(this).find("name").text()+"</span>"+
				$(this).find("text").text()+
			"</div>";
		});
		var action = '';
		$(this).find("action").each(function(){
			action+="<div class='action i4-tipe'>"+
				"<span class='i2-tipe'>"+$(this).find("name").text()+"</span>"+
				$(this).find("text").text()+
			"</div>";
		});
		if(action!='')			
			action="<div class='actions i3-tipe'>Действия</div>"+action;
		var legendary = '';
		$(this).find("legendary").each(function(){
			legendary+="<div class='legendary i4-tipe'>"+
				"<span class='i2-tipe'>"+$(this).find("name").text()+"</span>"+
				$(this).find("text").text()+
			"</div>";
		});
		if(legendary!='')			
			legendary="<div class='legendary i3-tipe'>Легендарные Действия</div>"+legendary;			
		var spells = '';
		$(this).find("spells").each(function(){
			if($(this).text()!='')
				{
				spells+="<div class='spells'>"+
					"<span class='name'>"+$(this).find("name").text()+"</span>"+
					$(this).find("text").text()+
				"</div>";
				}
		});
		//console.log("spells: "+spells);
		if(spells!='')			
			spells="<div class='spellist i3-tipe'>Заклинания</div>"+spells;	
		var stats = '';
		var str = parseInt($(this).find("str").text());
		var dex = parseInt($(this).find("dex").text());
		var con = parseInt($(this).find("con").text());
		var inl = parseInt($(this).find("int").text());
		var wis = parseInt($(this).find("wis").text());
		var cha = parseInt($(this).find("cha").text());
		stats = '<div class="stats"">'+
				'<span class="str"><span class="i-tipe">STR </span>' + count_mod(str) + '</span>'+
				'<span class="dex"><span class="i-tipe">DEX </span>' + count_mod(dex) + '</span>'+
				'<span class="con"><span class="i-tipe">CON </span>' + count_mod(con) + '</span>'+
				'<span class="int"><span class="i-tipe">INT </span>' + count_mod(inl) + '</span>'+
				'<span class="wis"><span class="i-tipe">WIS </span>' + count_mod(wis) + '</span>'+
				'<span class="cha"><span class="i-tipe">CHA </span>' + count_mod(cha) + '</span>'+
			'</div>';
		var skill = c_string("skill", "i2-tipe", "Способность", $(this).find("skill").text());
		var vulnerable = c_string("vulnerable", "i2-tipe", "Уязвимость", $(this).find("vulnerable").text());
		var immune = c_string("immune", "i2-tipe", "Иммунитет", $(this).find("immune").text());
		var conditionImmune = c_string("conditionImmune", "i2-tipe", "Иммунитет к состояниям", $(this).find("conditionImmune").text());
		var senses = c_string("senses", "i2-tipe", "Чувства", $(this).find("senses").text());
		var passive = c_string("passive", "i2-tipe", "Пассивное восприятие", $(this).find("passive").text());
		var languages = c_string("languages", "i2-tipe", "Язык", $(this).find("languages").text());
		var name= $(this).find("name").eq(0).text();
		
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
			experience = expa[$(this).find("cr").text()].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
		} catch (err) {
			
		}
		experience = "<span style='color: #999;'> ("+experience+" XP)</span>";
		var cr = c_string("cr", "i2-tipe", "Сложность", "<span class='cr_num'>"+$(this).find("cr").text()+"</span>" + experience);
		
		$("#result").append('<div class="monster" data-id="'+data_id+'" data-name="'+name.toLowerCase()+'"><button class="hide_monster">Скрыть Х</button>'+
			"<div class='left'><div class='inner'>"+
			'<div class="name">' + name + '</div>'+
			'<div>'+
				size+
				'<span class="type">' + $(this).find("type").text() + '</span>'+
				'<span class="alignment">' + $(this).find("alignment").text() + '</span>'+
			'</div>'+
			'<hr>'+	
			'<div class="ac"><span class="i-tipe">AC </span>' + $(this).find("ac").text() + '</div>'+
			'<div class="hp"><span class="i-tipe">HP </span>' + $(this).find("hp").text() + '</div>'+
			'<div class="speed"><span class="i-tipe">Скорось </span>' + $(this).find("speed").text() + '</div>'+
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
			"</div></div>"+
			'</div>');
        $(".book").fadeIn(1000);
		to_hidden+="<a href='#' class='hidden_m' data-id='"+data_id+"'>"+name+"</a>";
		data_id++;
    });
	console.log("end xml-parsing");
	//$("#result").html("");
	make_generator();
	$("#panel .hidden").append(to_hidden);
	$(".load").hide();
	//$("#result").wrapInner("<div class='page_list'></div>");
	find_type();
	$("#before_monsters").hide();
   };
	function make_side(){
	}
	//make_generator();
	$("body").on("click", "#dbg", function(){
		$("#dbg").hide();
		$(".mod_win").hide();
	});
	$("body").on("click", ".hide_monster", function(){
		$(this).parent().hide();
		var id = $(this).parent().attr("data-id");
		$("#panel .hidden").show();
		$(".hidden_m[data-id='"+id+"']").css("display", "block");
	});
	$("body").on("click", ".hidden_m", function(){		
		var id = $(this).attr("data-id");
		$(".monster[data-id='"+id+"'], .monster_card[data-id='"+id+"']").show();
		$(this).hide();
		//$(".hidden_m[data-id='"+id+"']").css("display", "block");
		if($(".hidden_m:visible").length<1)
			$("#panel .hidden").hide();
		return false;
	});
	$(".ml_1").on("click", function(){
		console.log("secect list");
		$("#panel .monsters input[type=checkbox]").each(function(){
			//console.log($(this).attr("id"));
			if($("#ch_ml_1").prop("checked"))
			{
				console.log("unckeck!");
				$(this).prop('checked', false);
			}
			else
			{
				console.log("ckeck!");
				$(this).prop('checked', true);
			}
		});
	});
	
	// фильтр по разнм параметрам (одна функция для всех)
	$("body").on('click',".ch_lb", function(){
		var fr=$(this).attr("for");
		if($("#"+fr).prop("checked"))
			{
			$("#"+fr).prop('checked', false);	
			}
		else
			{
			$("#"+fr).prop('checked', true);	
			}
		get_filter();	
		return false;		
	});
	
	
	$(".ch_mn").on('click', function(){
		var fr=$(this).attr("for");
		if($("#"+fr).prop("checked"))
			{
			$("#"+fr).prop('checked', false);	
			}
		else
			{
			$("#"+fr).prop('checked', true);	
			}
		filter_mn();	
		return false;		
	});
	$(".ml_1").on('click', function(){
		var fr=$(this).attr("for");
		if($("#"+fr).prop("checked"))
			{
			$("#"+fr).prop('checked', false);	
			}
		else
			{
			$("#"+fr).prop('checked', true);	
			}
		filter_mn();	
		return false;		
	});
	$("body").on('click',".ch_vw", function(){
		//alert(1);
	$('#load').show();
		$(".ch_vw").prop('checked', false);
		$(this).prop('checked', true);
		find_type();
		//return false;		
	});
	// ввод в фильтр
	$("body").on('keyup',".flt input", function(){
		console.log('keyup');
		if($(this).val().length==1)
			{
			setTimeout(function(){get_filter();console.log('timeout');}, 500);
			}
		else
			get_filter();
	});
	// при нажатии кнопки с вопросом
	$("body").on("click", "#info", function(){
		if($("#dbg").length<1)
		{
			$("body").append("<div id='dbg'></div>");
		}
		$("#dbg").show();
		if($(".mod_win").length<1)
		{
			$("body").append("<div class='mod_win'></div>");
		}
		$(".mod_win").show();
		var info="<div class='m_head'>Справка</div>"+
		"<p> Список монстров из Monster Manual D&d 5</p>"+
		"<p> Можно отфильтровать выборку по Классу Сложности.</p>"+
		"<p> Данные можно отобразить в двух видах. По умолчанию показывается в текстовом виде, близком тому, как выглядит в книге. Второй вариант - карточки - монстры отображаются на карточках, на левой стороне основная информация, на правой его возможные действия. Такой вид удобен для печати. При переключении видов требуется НЕМНОГО ПОДОЖДАТЬ.</p>"+
		"<br>"+
		"<p>Версия 0.2 [28.01.2016]<br>"+
		"Стабильная версия<br>";
		$(".mod_win").html(info);
	});
	// убираем затемнение при нажатии на него
	$("body").on("click", "#dbg", function(){
		$("#dbg").hide();
		$(".mod_win").hide();
	});
}); 
