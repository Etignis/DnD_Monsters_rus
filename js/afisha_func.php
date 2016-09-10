<?php session_start();
define('TT_KEY', true);
require_once("../../db.php");
require_once("afisha_class.php");
require_once("../../funk/fff.php");
$SiteURL='http://'.$_SERVER['HTTP_HOST'];

// добавить спектакль в афишу
if($_POST[stat]=='add')                                     
 {
 $out=0;
 
 $id=$_POST[a_play];
 $date=$_POST[a_date];
 $time=$_POST[a_time];
 $text=$_POST[a_text];
  $text = preg_replace("~(\r\n|\n|\r)~", '<br>', $text);	 
  $text = str_replace(' ', '&nbsp;', $text);
  
 $new_ai= new afisha_item(); 
  
 $out=$new_ai->add($id, $date, $time, $text);
  
 echo $out;
 }

// удалить спектакль из афиши 
if($_POST[stat]=='del')                                     
 {
 $out=0;
 
 $item_id=$_POST[item_id];
 
 $del_ai= new afisha_item(); 
  
 $out=$del_ai->del($item_id);
  
 echo $out;
 }
 
// сохранение редактирования
if($_POST[stat]=='save_edit')
 {
 $out=0;
 
 $id      = $_POST[a_id];
 $play_id = $_POST[a_play];
 $date    = $_POST[a_date];
 $time    = $_POST[a_time];
 $text    = $_POST[a_text];
  $text = preg_replace("~(\r\n|\n|\r)~", '<br>', $text);	  
 // $text = str_replace(' ', '&nbsp;', $text); 
 
 $new_ai= new afisha_item(); 
  
 $out=$new_ai->save($id, $play_id, $date, $time, $text);
  
 echo $out;
 }
 
// перезагрузка афиши
if($_POST[stat]=='reload')
 {
 $ret=new afisha();          // создаем экземпляр
 echo $ret->show();          // печатаем
 } 
?>