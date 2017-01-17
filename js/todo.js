
$(document).ready(function() {
    $(".titleWidgets a").click(function() {	

    	//clear the form
    	document.getElementById("addTaskForm").reset();

 	  	// change visibility of div Task pane and overlay
 	  	turnTaskOverlayPane("visible");
    });
    loadToDo();
});

function taskObject(title, description)
{
	this.title = title;
	this.desc = description;
	this.date = new Date(); // TODO sanitize
	this.status = "new";
}

function turnTaskOverlayPane(status)
{
	var elPane = document.getElementsByClassName("overlayPane");
    elPane[0].style.visibility = status;
	
    var eltask = document.getElementsByClassName("addTaskPane");
    eltask[0].style.visibility = status;
}

function loadToDo()
{
	// display list if exists
	if (sessionStorage.getItem("theTaskList"))
	{
		//document.getElementById("taskListView").innerHTML = null;
		//console.log(sessionStorage.getItem("theTaskList"));
		//console.log("not inside");
		document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");
	}
	//otherwise, prompt to add stuff
	else
	{
		//console.log("inside");
		//document.getElementById("taskListView").innerHTML = "Hello! Please add new tasks from the + above";
	}
}

$("#addTaskForm").submit(function(e){
    return false; // for preventing default page reload on submit behavior
});

// Clicking on overlay pane for exiting

$(".overlayPane").click(function(){
    turnTaskOverlayPane("hidden");
    //e.style.visibility = "hidden"; ??-research
}); // TODO: add same for escape key

// On task (li) mouseover display remove, details, done anchors
$('#taskList').on('mouseover','li',function(){
	var $allAnchor = $(this).find('a');
	$allAnchor.css('display','block');
});

$('#taskList').on('mouseout','li',function(){
	var $allAnchor = $(this).find('a');
	$allAnchor.css('display','none');
});

$('#taskList').on('click','.listItemDel',function(e){
	e.preventDefault();
	$(this).parent().remove();
	// remove item from localStorage too
	sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);
});



function processForm(submitType)
{
	// change overlay visibility off
	turnTaskOverlayPane("hidden");
	
	//console.log(submitType);
	
	if (submitType == "Cancel")
	{
		
	}
	else
	{
		// get form elements for new task entry
		var elTaskTitle = document.getElementById("taskTitle");
		var elTaskDesc = document.getElementById("taskDesc");

		// input validation and handling
		// for blank

		// store the elements in the object
		var taskObj = new taskObject(elTaskTitle.value,elTaskDesc.value,new Date(),"new");

		// put the elements in local storage
		// save individual element per task -> object
		sessionStorage.setItem(taskObj.title,taskObj); // key = task title, value = task object

		var listItem = document.createElement("li");
		
		listItem.innerHTML = '<span class="drag"> : </span>' + taskObj.title + ' <a class="listItemDetail" style="display: none;" href="#"> MORE </a><a class="listItemDone" style="display: none;" href="#"> DONE </a><a class="listItemDel" style="display: none;" href="#"> X </a>';
		//var listItem = '<li><span class="drag"> : </span><input class="listItem" value=' + taskObj.title + '><a class="listItemDetail" style="display: none;" href="#"> MORE </a><a class="listItemDone" style="display: none;" href="#"> DONE </a><a class="listItemDel" style="display: none;" href="#"> X </a></li>';

		document.getElementById("taskList").appendChild(listItem);

		// save entire list with key theTaskList, overwriting for all new entries with same name
		// saves iterating the storage on refresh
		sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);		

		// append a task list node to the div taskListView ul element

		//var liNode = document.createElement("li");
		//var textNode = document.createTextNode(task1.title);
		//var textNode = document.createTextNode(task.title);

		//liNode.appendChild(textNode);

		//document.getElementById("taskList").appendChild(liNode);
	}
}

