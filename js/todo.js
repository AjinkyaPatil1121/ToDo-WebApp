$(document).ready(function() {
    $(".titleWidgets a").click(function() {	

    	//clear the form
    	document.getElementById("addTaskForm").reset();

 	  	// change visibility of div Task pane and overlay
    	var elPane = document.getElementsByClassName("overlayPane");
    	elPane[0].style.visibility = "visible";

    	var eltask = document.getElementsByClassName("addTaskPane");
    	eltask[0].style.visibility = "visible";

    });
});

$("#addTaskForm").submit(function(e){
    return false; // for preventing default page reload on submit behavior
});

function taskObject(title, description)
{
	this.title = title;
	this.desc = description;
	this.date = new Date(); // TODO sanitize
	this.status = "new";
}

function processForm()
{
	// change overlay visibility
	var elPane = document.getElementsByClassName("overlayPane");
    elPane[0].style.visibility = "hidden";

    var eltask = document.getElementsByClassName("addTaskPane");
    eltask[0].style.visibility = "hidden";
	
	// get form elements
	var elTaskTitle = document.getElementById("taskTitle");
	var elTaskDesc = document.getElementById("taskDesc");

	// input validation and handling

	// store the elements in the object
	var task = new taskObject(elTaskTitle.value,elTaskDesc.value);

	// put the elements in local storage
	sessionStorage.setItem(task.title,task); // key = task title, value = task object

	// append a task list node to the div taskListView ul element

	var liNode = document.createElement("li");
	//var textNode = document.createTextNode(task1.title);
	var textNode = document.createTextNode(task.title);

	liNode.appendChild(textNode);

	document.getElementById("taskList").appendChild(liNode);
}