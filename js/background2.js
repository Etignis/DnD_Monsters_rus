$(document).ready(function(){
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

function toCase(str, choice) {
    var strPub = { // правила для окончаний
        "а": ["ы", "е", "у", "ой", "е"],
        "(ш/ж/к/ч)а": ["%и", "%е", "%у", "%ой", "%е"],
        "б/в/м/г/д/л/ж/з/к/н/п/т/ф/ч/ц/щ/р/х": ["%а", "%у", "%а", "%ом", "%е"],
        "и": ["ей", "ям", "%", "ями", "ях"],
        "ый": ["ого", "ому", "%", "ым", "ом"],
        "й": ["я", "ю", "я", "ем", "е"],
        "о": ["а", "у", "%", "ом", "е"],
        "с/ш": ["%а", "%у", "%", "%ом", "%е"],
        "ы": ["ов", "ам", "%", "ами", "ах"],
        "ь": ["я", "ю", "я", "ем", "е"],
        "уль": ["ули", "уле", "улю", "улей", "уле"],
        "(ч/ш/д/т)ь": ["%и", "%и", "%ь", "%ью", "%и"],
        "я": ["и", "е", "ю", "ей", "е"]
    },
    cases = { // номера для падежей, не считая Именительный
        "р": 0,
        "д": 1,
        "в": 2,
        "т": 3,
        "п": 4
    },
    exs = { // исключения, сколько символов забирать с конца
        "ц": 2,
        "ок": 2
    },
    lastIndex,reformedStr,forLong,splitted,groupped,forPseudo;
    for(var i in strPub){
        if(i.length > 1 && str.slice(-i.length) == i){ // для окончаний, длиной >1
            lastIndex = i;
            reformedStr = str.slice(0, -lastIndex.length);
            break;
        }
        else if(/[\(\)]+/g.test(i)){ // фича: группировка окончаний
            i.replace(/\(([^\(\)]+)\)([^\(\)]+)?/g, function(a, b, c){
                splitted = b.split("/");
                for(var o = 0; o < splitted.length; o++){
                    groupped = splitted[o] + c;
                    strPub[groupped] = strPub[i];
                    if(str.slice(-groupped.length) == groupped){
                        for(var x = 0, eachSplited = strPub[groupped];x < eachSplited.length; x++){
                            eachSplited[x] = eachSplited[x].replace("%", splitted[o]);
                        }
                        reformedStr = str.slice(0, -groupped.length);
                        forPseudo = groupped;
                    }
                }
            })
        }
        else{ // дефолт
            lastIndex = str.slice(-1);
            reformedStr = str.slice(0, -(forPseudo || lastIndex).length);
        }
        if(/\//.test(i) && !(/[\(\)]+/g.test(i)) && new RegExp(lastIndex).test(i))forLong = i; // группированные окончания, разделающиеся слешем
        for(var o in exs){ // поиск исключений
            if(str.slice(-o.length) == o)reformedStr = str.slice(0, -exs[o]);
        }
    }
    return reformedStr + strPub[(forPseudo || forLong || lastIndex)][cases[choice]].replace("%", lastIndex)
}

function randd(min, max) {    
    //return 3;//
	var rnd = Math.floor(arguments.length > 1 ? (max - min + 1) * Math.random() + min : (min + 1) * Math.random());
	console.log("rand num: "+rnd);
	return rnd;
};

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

var step_next=0, f_siblings=0, f_cryme=0, f_spy=0, f_end=0;
// Константы //



//var IMF_RF="<img src='img/i_rf.png' class='i_rf' style='width: 16px'>";
//var IMF_RF="<span style='width: 16px; height: 16px; background: url(img/i_rf.png) center center no-repeat; background-size: cover; display: inline-block;'></span>";
//var IMF_QW="<img src='img/i_qw.png' class='i_qw' style='width: 16px'>";

var IMF_RF="<i class='fa  fa-refresh'></i>";
var IMF_QW="<i class='fa fa-question-circle'></i>";
//////////////
	
	function make_generator(){
		
		generator="<button class='bt' id='go'>Сгенерировать случайную предысторию</button><button id='start_helper' class='bt'>Запустить генерацию по шагам</button><a class='bt' href='http://www.youknowwho.ru/message/?theme=dndwhoopee' target='_blank'>Написать отзыв или предложение</a><a class='bt' href='http://youknowwho.ru/dnd/file/Random_Background.pdf' target='_blank'>Скачать источник-PDF</a>";
		$("#panel").html(generator);	
		
	}
	function add_info_spoiler(){
		$(".description").after("<a href='#' class='info_toggle'>Скрыть описание</a>").before("<a href='#' class='info_toggle'>Скрыть описание</a>");
		//$(".info_toggle").eq(0).trigger('click');
	}
	
	function d(max){
		return randd(1, max);
	}
	function milestone(name,text,img,stat)
	{
		var ret;
		if(stat!="end")
			stat="more";
		if($("div[data-name='"+name+"']").length<1)
		{
			ret="<div class='milestone "+img+" "+stat+"' data-name='"+name+"'><b>"+name+"</b><br>"+text+"</div>"
			$("#result").append(ret);
		}
		else
		{
			$("div[data-name='"+name+"']").append("<br>"+text);
		}
	}
	function space(string)
	{
		return " "+space+" ";
	}

	////////////////////////////
	////////////////////////////

	function _parents(mod){
		ret = "";
		rand=d(20)
		string_0_1="Вы";
		
		if(rand==1 && mod!=1 && mod!=2)
			{
			string_2_1="выросли";
			string_2_2="среди зверей.";	
			
			str1 = string_2_1.split("|");
		    str2 = string_2_2.split("|");
		
			str1 = shuffle(str1);
			str2 = shuffle(str2);
			
			f_siblings = 1;
			
			ret=string_0_1+" "+str1[0]+" "+str2[0];
			}
		if(rand==2 && mod!=1 && mod!=2)
			{
				/*
			string_3_2="приемный ребенок.";	
			
		    str2 = string_3_2.split("|");
		
			str2 = shuffle(str2);
			
			ret=string_0_1+" "+str2[0];
			*/
			ret=_parents(1);
			ret+="<br>"+_parents(2);
			}
			
		else
			{
			string_1_11="родились|появились на свет";
			string_1_12="выросли|воспитывались";
			string_1_2="в бедной семье.|в семье преступника.;crime|в семье палача.|в семье телохранителя.|в семье шпиона.;spy|в семье солдата.|в семье лекаря.|в семье крестьянина.|в семье дипломата.|в семье гробовщика.|в семье священника.|в семье юриста.|в семье ученого (учителя).|в семье ремесленника (деятеля искусств)|в семье торговца.|в семье аристократа.|в семье великого героя.";
			
			str1=string_1_11+"|"+string_1_12;
			if(mod==1)
				str1=string_1_11;
			if(mod==2)
				str1=string_1_12;
			
			str1 = str1.split("|");
		    str2 = string_1_2.split("|");
		
			str1 = shuffle(str1);
			str2 = shuffle(str2);
			
			nxt=str2[0].split(";");
			par=nxt[0];
			next=nxt[1];
			
			ret2="";
			if(window.next !== undefined && mod!=1)
			{
				str2[0]=par;
				// вызов функции
				if(next=="crime")
					f_crime=1;
				if(next=="spy")
				{
					f_spy=1;
					
				}
				
			}
			
			ret=string_0_1+" "+str1[0]+" "+str2[0]+" "+ret2;
			}
		
		
	
		step_next="siblings";
		return ret;
	}
	
	function _parent_p(){
		ret = "";
		rand=d(20)
		string_0_1="Отец: ";
		next="";
		
		if(rand==0)
			{
			
			}
		
		else
			{
			string_1_1="";
			string_1_2="из бедной семьи.|преступник.;crime|палач.|телохранитель.|шпион.;spy|солдат.|лекарь.|крестьянин.|дипломат.|гробовщик.|священник.|юрист.|ученый (учитель).|ремесленник (деятель искусств)|торговец.|аристократ.|великий герой.";
			
			str1 = string_1_1.split("|");
		    str2 = string_1_2.split("|");
		
			str1 = shuffle(str1);
			str2 = shuffle(str2);
			
			nxt=str2[0].split(";");
			par=nxt[0];
			next=nxt[1];
			
			ret2="";
			if(window.next !== undefined)
			{
				str2[0]=par;
				// вызов функции
				if(next=="crime")
					f_crime=1;
				if(next=="spy")
				{
					f_spy=1;
					
				}
			}
			
			ret=string_0_1+" "+str1[0]+" "+str2[0]+" "+ret2;
			}
		
		
	step_next="siblings";
		return ret;
	}
	
	function _parent_m(){
		ret = "";
		rand=d(20)
		string_0_1="Мать: ";
		
		if(rand==0)
			{
			
			}
		
		else
			{
			string_1_1="";
			string_1_2="из бедной семьи.|преступник.;crime|палач.|телохранитель.|шпион.;spy|солдат.|лекарь.|крестьянинка.|дипломат.|гробовщик.|жрица.|юрист.|ученая (учитель).|ремесленница (деятельница искусств)|торговка.|аристократка.|великая героиня.";
			
			str1 = string_1_1.split("|");
		    str2 = string_1_2.split("|");
		
			str1 = shuffle(str1);
			str2 = shuffle(str2);
			
			nxt=str2[0].split(";");
			par=nxt[0];
			next=nxt[1];
			
			ret2="";
			if(window.next !== undefined)
			{
				str2[0]=par;
				// вызов функции
				if(next=="crime")
					f_crime=1;
				if(next=="spy")
				{
					f_spy=1;
					
				}
			}
			
			ret=string_0_1+" "+str1[0]+" "+str2[0]+" "+ret2;
			}
		
		
	step_next="siblings";
		return ret;
	}
	
	function _siblings(mod)
	{
		//console.log("mod: "+mod);
		var ret = "";
		rand=d(20);
		
		if(f_siblings==1)
		{
			ret = "У вас нет ни братьев, ни сетер.";
			
		}
		if(rand==20 && mod!=1)
		{
			var str_1="Вы разлучёны с семьёй в молодости. Но вы выяснили, что";
			str_2 = _siblings(1);
			 //foo.slice(0, 1).toUpperCase() + foo.slice(1);
			 console.log("sdf: "+str_2.trim().slice(0, 1).toLowerCase());
			str_2 = str_2.trim().slice(0, 1).toLowerCase() + str_2.slice(1);
			
			ret= str_1+" "+str_2
		}
		else
		{
			var str_1_1="У вас есть однояйцевый близнец.|У вас есть младшая сестра.|У вас есть младший брат.|У вас есть старшая сестра.|У вас есть старший брат.|У вас есть две сестры.|У вас есть два брата.|У вас есть  старшая сестра и сводный брат.|У вас есть две сводные сестры.|У вас есть младший брат-бастард.|Вы — бастард, у вас есть две сестры и два брата.|У ваших родителей кроме вас ещё три ребёнка.|У вас есть два сводных брата или сестры, у каждого разные родители.|У ваших родителей кроме вас ещё шесть детей (вы — младший).|У вас есть однояйцевый близнец и младший брат|У вас есть разнояйцовый близнец.|У ваших родителей кроме вас четыре ребёнка (вы — старший).";
			
			str1 = str_1_1.split("|");
		
			str1 = shuffle(str1);
			//console.log("arr: "+str1.length);
			//console.log("ret: "+str1[0]);
			
			ret = str1[0];
			//console.log("ret2: "+ret);
		}
		//console.log("qwe "+ret);
		return ret;
	}
	function _away(mod)
	{
		//console.log("mod: "+mod);
		var ret = "";
		rand=d(20);
		
		if(rand==6)
		{
			var evil = _evil(1);
			ret = "Ваш дом был уничтожен "+evil+". ";
			if(randd(0,1))
			{
				ret+="Ваша жизнь искателя приключений начинается.";
				f_end=1;
			}
			else
			{
				// месть
			}
		}
		if(rand==7)
		{
			ret="Вы сбежали, чтобы устроиться в цирк.";
			
			// цирк
		}
		if(rand==8)
		{
			ret="Вы сбежали от жестокого члена семьи, который хотел использовать вас для чего-то жуткого.";
			
			// цв бегах
		}
		if(rand==9)
		{
			ret="Вы сбежали с любимым человеком.";
			
			// 12
		}
		if(rand==10)
		{
			var r= rand(0,1);
			if(f_siblings==1) // сиблингов нет
			{
				if(r==1)
				{
					ret="Вы узнали, что у вас есть единоутробный брат, и отправились на его поиски. ";
				}
				else
				{
					ret="Вы узнали, что у вас есть единоутробная сестра, и отправились на её поиски. ";
				}
			}
			else 
			{
				if(r==1)
				{
					ret="Вы отправились на поиски брата.";
				}
				else
				{
					ret="Вы отправились на поиски сестры.";
				}
			}
			
			
			// 11
		}
		if(rand==11)
		{
			ret="Большая часть вашей семьи умерла от чумы.";
			
			// 31
			if(randd(0,1))
			{
				ret+="Ваша жизнь искателя приключений начинается.";
				f_end=1;
			}
			else
			{
				// 17
			}
			
		}
		if(rand==12)
		{
			ret="Вас похитили и поработили.";
			
			// 16
		}
		if(rand==13)
		{
			ret="Вас захватили пираты.";
			
			// 34
		}
		if(rand==14)
		{
			ret="Ваша семья разорилась. Вам пришлось покинуть дом, чтобы совершать преступления ради выживания.";
			
			// 15
			
			// 26
		}
		if(rand==15)
		{
			ret="Вы ушли из города с караваном, чтобы посмотреть мир.";
			
			// 20
			
		}
		if(rand==16)
		{
			
			if(randd(0,1))
			{
				ret="Вы отправились на поиски фамильных ценностей.";
				
			}
			else
			{
				ret="Вы отправились на поиски древнего мощного предмета.";
			}
			
			// 11
			
		}
		if(rand==17)
		{
			ret="Вы были прокляты и покинули дом, чтобы не навлечь беду на семью.";
			
			// 7
			
		}
		else
		{
			ret = "Вас отправили на попечение.";
			// куда
		}
		console.log("qwe "+ret);
		return ret;
	}
	
	////////////////////////////
	////////////////////////////
	
	////////////////
	
	function start_wisard()
	{
		var dice="", next="", mod="0";
		
		//_1_birth(next, mod);
		//_1_birth();
		
		
		
	}
	///////
	
	function start_helper(){
		$("#helper").html("<div><b>Информация о происхождении</b><br>Вы хотите узнать об <a href='#' class='_0_parents_2' >обоих родителях</a> или о <a href='#'  class='_0_parents' >семье в общем</a>?</div>")
	}
	// родители 
	$("body").on("click", "a._0_parents", function(){
		data="<span class='parents'>"+_parents()+"</span>";
		$("#helper").html("<div><b>Информация о семье</b><br>"+data+"</div><a href='#' class='_0_parents'>Перегенерировать</a><br><a href='#' class='n_siblings'>Дальше ></a>")
	});
	
	$("body").on("click", "a._0_parents_2", function(){
		data1="<span class='parent_p'>"+_parent_p()+"</span><a href='#' class='_0_parent_p'>Перегенерировать</a><br>";
		data2="<span class='parent_m'>"+_parent_m()+"</span><a href='#' class='_0_parent_m'>Перегенерировать</a>";
		$("#helper").html("<div><b>Информация о семье</b><br>"+data1+data2+" </div><br><a href='#' class='n_siblings'>Дальше ></a>")
	});
	$("body").on("click", "a._0_parent_p", function(){
		data=_parent_p();
		$(".parent_p").html(data);
	});
	$("body").on("click", "a._0_parent_m", function(){
		data=_parent_m();
		$(".parent_m").html(data);
	});
	
	// сиблинги
	
	$("body").on("click", "a.n_siblings", function(){
		var data;
		if($(".parent_p").length>0)
		{
			data=$(".parent_p").text() + " "  + $(".parent_m").text();
		}
		else
		{
			data = $(".parents").text();
		}
		milestone("Происхождение",data,"i1", "more");
		
		data="<span class='siblings'>"+_siblings()+"</span>";
		$("#helper").html("<div><b>Информация о братьях и сестрах</b><br>"+data+"</div><a href='#' class='_0_siblings'>Перегенерировать</a><br><a href='#' class='n_away'>Дальше ></a>");
	});
	
	$("body").on("click", "a._0_siblings", function(){
		data=_siblings();
		$("#helper").html("<div><b>Информация о братьях и сестрах</b><br>"+data+"</div><a href='#' class='_0_siblings'>Перегенерировать</a><br><a href='#' class='n_away'>Дальше ></a>")
	});

	// уход
	$("body").on("click", "a.n_away", function(){
		var data;
		
		data = $(".siblings").text();
		milestone("Происхождение",data,"i1", "more");
		/*
		data=_siblings();
		$("#helper").html("<div><b>Информация о братьях и сестрах</b><br>"+data+"</div><a href='#' class='_0_siblings'>Перегенерировать</a><br><a href='#' class='n_siblings'>Дальше ></a>");
		*/
	});
	
	/////
	
	
	$("body").on("click", "#go", function(){
		
		//var tbl="";
		$("#result").html("");
		//tbl+="";
		start_wisard();
		//$("#result").append(joy_result);
			
	});
	
	$("body").on("click", "#start_helper", function(){
		
		//var tbl="";
		$("#result").html("");
		$("#helper").html("");
		//tbl+="";
		start_helper();
		//$("#result").append(joy_result);
			
	});
	make_generator();
	add_info_spoiler();
	//$("#go").click();
	
	//alert($(".info_toggle").eq(0).text());
	$(".info_toggle").eq(0).click();
	
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
		
				
		$(".mod_win").html(info);
	});
	$("body").on("click", "#dbg", function(){
		$("#dbg").hide();
		$(".mod_win").hide();
	});
	$("body").on("click", "a.regen", function(){
		var type=$(this).parent().attr("data-rel");
		if(type=='parent')
			family(1);
		return false;
	});
	$("body").on("click", ".info_toggle", function(){
		console.log("info toggler");
		if($(this).text()=="Скрыть описание")
		{
			$(".info_toggle").text("Показать описание").hide();
			$(".description").slideUp();
			$(".info_toggle").eq(0).show();
		}
		else
		{
			$(".info_toggle").text("Скрыть описание");
			$(".description").slideDown();
			$(".info_toggle").show();
		}
		
		return false;
	});
	
}); 