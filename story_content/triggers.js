function ExecuteScript(strId)
{
  switch (strId)
  {
      case "6EMVkaWhNzY":
        Script1();
        break;
      case "6UvSuEoOTHW":
        Script2();
        break;
      case "5zDRvyvFnGs":
        Script3();
        break;
      case "6Rpwd8ZnVZE":
        Script4();
        break;
      case "6BbIU90hRm9":
        Script5();
        break;
  }
}

window.InitExecuteScripts = function()
{
var player = GetPlayer();
var object = player.object;
var once = player.once;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
var update = player.update;
var pointerX = player.pointerX;
var pointerY = player.pointerY;
var showPointer = player.showPointer;
var hidePointer = player.hidePointer;
var slideWidth = player.slideWidth;
var slideHeight = player.slideHeight;
};
