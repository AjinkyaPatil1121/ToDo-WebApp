
$(document).ready(function() {
    $(".titleWidgets a").click(function() {	

    	// clear the form
    	document.getElementById("addTaskForm").reset();

    	// clear the initial message from taskList
    	if ( document.getElementById("taskList").firstChild === document.getElementById("initialToDoMessage") )
    	{
    		//console.log("firstchild == p");
    		document.getElementById("initialToDoMessage").remove();
    	}
 	  	// change visibility of div Task pane and overlay
 	  	turnTaskOverlayPane("visible");
    });

    document.getElementById("searchTextField").value = "";
    // on reload mark active tab to be VA and call its filterB.refreshView
  	document.getElementById("viewAllButton").className = "filterButtonActive";
    filterButton("View All");
});

// the Todo task object
function taskObject(title, description)
{
	this.title = title;
	this.desc = description;
	this.date = new Date(); // TODO sanitize
	this.status = "new";
}


// utility for showing/removing overlays
function turnTaskOverlayPane(status)
{
	var elPane = document.getElementsByClassName("overlayPane");
    elPane[0].style.visibility = status;
	
    var eltask = document.getElementsByClassName("addTaskPane");
    eltask[0].style.visibility = status;
}

// load the Todo List items or prompt to add stuff
function loadToDo()
{
	// display list if exists
	if (sessionStorage.getItem("theTaskList") && sessionStorage.getItem("theTaskList").trim() !== "")
	{
		//document.getElementById("taskListView").innerHTML = null;
		//console.log(sessionStorage.getItem("theTaskList"));
		//console.log("not inside");
		//console.log("inside loadToDo if");
		//console.log(sessionStorage.getItem("theTaskList"));
		document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");
	}
	//otherwise, prompt to add stuff
	else
	{
		//console.log("inside loadToDo else");
		document.getElementById("taskList").innerHTML = "<p id='initialToDoMessage'> Hello! Please add new tasks from the + above </p>";
	}
}

$("#addTaskForm").submit(function(e){
    return false; // for preventing default page reload on submit behavior
});

// Clicking on overlay pane for exiting

$(".overlayPane").click(function(){
    turnTaskOverlayPane("hidden");
    loadToDo();
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

// List Item done click handler
$('#taskList').on('click','.listItemDone',function(e){
	e.preventDefault();

	var taskText = $(this).parent().find("span").text();

	$(this).parent().remove();
	// call refreshView with task title, task status and what tab is active
	
	var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
							: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
							: ( $('#pendingButton').attr('value') ) );
						
	//console.log(activeFilter);
	// task was set to done, refreshView with 'taskTitle' to be marked 'done' at this 'tab'
	refreshView (taskText, "done", activeFilter);
});

// List item not done click handler
$('#taskList').on('click','.listItemNotDone',function(e){
	e.preventDefault();

	var taskText = $(this).parent().find("span").text();

	$(this).parent().remove();
	// call refreshView with task title, task status and what tab is active
	
	var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
							: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
							: ( $('#pendingButton').attr('value') ) );
						
	//console.log(activeFilter);
	// task was set to done, refreshView with 'taskTitle' to be marked 'done' at this 'tab'
	refreshView (taskText, "new", activeFilter);
});

// Task delete X/Del button/achor press
$('#taskList').on('click','.listItemDel',function(e){
	e.preventDefault();
		
	// remove item from localStorage too
	//console.log($(this).parent().find("span").text());
	sessionStorage.removeItem($(this).parent().find("span").text());

	// remove the li in the UI
	$(this).parent().remove();

	// set the ul taskList in session to be whatever is left after removing li
	sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);

	loadToDo();// for when all items have been deleted, show the initial message in p
});

// search text field event handler

function processSearch()
{
	var taskToSearch = document.getElementById("searchTextField").value;
	//console.log(taskToSearch);
	var listItems = document.getElementById("taskList").childNodes;

	// search session storage for taskToSearch string
	// if exists 
		// hide all other elements
	if (sessionStorage.getItem(taskToSearch) && taskToSearch !== "")
	{
		if (listItems.length !== 0)
		{				
			//console.log(listItems);
			//console.log(listItems[0].childNodes[0].innerText); // got from firefox console
			for (var i = 0; i < listItems.length; i++)
			{
				if (listItems[i].childNodes[0].innerText === taskToSearch) // span @ childNodes[0]
				{
					// undo hidden from before if any set
					listItems[i].removeAttribute("hidden");
				}
				else
				{
					listItems[i].setAttribute("hidden","true");
				}
			}
		}
	}
	// otherwise
		// alert no such element
	else
	{
		alert("No such task found!");
	}

}


function processForm(submitType)
{	
	//console.log(submitType);
	
	if (submitType == "Cancel")
	{
		// change overlay visibility off
		turnTaskOverlayPane("hidden");
		loadToDo();
	}
	else
	{
		// get form elements for new task entry
		var elTaskTitle = document.getElementById("taskTitle");
		var elTaskDesc = document.getElementById("taskDesc");

		// input validation and handling
		// for blank
		if (elTaskTitle.value.trim() === "" || elTaskTitle.value.length > 15)
		{
			var errorText = "Task title cannot be blank and exceed 15 chars";
			document.getElementById("errorMsgCont").innerText = errorText;
		}
		else
		{
			document.getElementById("errorMsgCont").innerText = "";
			// input validated, change overlay visibility off
			turnTaskOverlayPane("hidden");

			// store the elements in the object
			var taskObj = new taskObject(elTaskTitle.value,elTaskDesc.value,new Date(),"new");

			// put the elements in local storage
			// save individual element per task -> object
			sessionStorage.setItem(taskObj.title,JSON.stringify(taskObj)); // key = task title, value = task object

			//console.log(JSON.parse(sessionStorage.getItem(taskObj.title)));

			createActiveTaskItem(taskObj);

			var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
								: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
								: ( $('#pendingButton').attr('value') ) );
							
			refreshView (null, null, activeFilter);
		}
	}
}

function createActiveTaskItem(taskObject)
{
		var listItem = document.createElement("li");
		listItem.className = "taskActive";

		listItem.innerHTML = '<span>'+taskObject.title+'</span>' + '<p class="listItemDesc">'+ taskObject.desc +'</p>' 
		+ ' <a class="listItemDone" style="display: none;" href="#"> DONE </a> '
		+ ' <a class="listItemDel" style="display: none;" href="#"> X </a>';
		//var listItem = '<li><span class="drag"> : </span><input class="listItem" value=' + taskObj.title + '><a class="listItemDetail" style="display: none;" href="#"> MORE </a><a class="listItemDone" style="display: none;" href="#"> DONE </a><a class="listItemDel" style="display: none;" href="#"> X </a></li>';

		//var firstTaskLi = document.getElementById("taskList").firstChild;
		//var taskList = document.getElementById("taskList");
		//taskList.insertBefore()
		document.getElementById("taskList").insertBefore(listItem,document.getElementById("taskList").childNodes[0]);

		// save entire list with key theTaskList, overwriting for all new entries with same name
		// saves iterating the storage on refresh. Saves all task li's
		sessionStorage.setItem("theTaskList", document.getElementById("taskList").innerHTML);		

		//console.log(sessionStorage.getItem("theTaskList"));

		// append a task list node to the div taskListView ul element

		//var liNode = document.createElement("li");
		//var textNode = document.createTextNode(task1.title);
		//var textNode = document.createTextNode(task.title);

		//liNode.appendChild(textNode);

		//document.getElementById("taskList").appendChild(liNode);
}

function createInactiveTaskItem(taskObject)
{
	// create new li with task object
	var listItem = document.createElement("li");
	listItem.className = "taskInactive";

	listItem.innerHTML = '<span>'+taskObject.title+'</span>' + '<p class="listItemDesc">'+ taskObject.desc +'</p>' +
		' <a class="listItemNotDone" style="display: none;" href="#"> NOT DONE </a> '+
		' <a class="listItemDel" style="display: none;" href="#"> X </a> ' ;
		
	// append inactive to the end
	document.getElementById("taskList").appendChild(listItem);

	// update the task list in storage
	sessionStorage.setItem("theTaskList", document.getElementById("taskList").innerHTML);
}

function refreshView (taskTitle,taskStatus,filterTab)
{
	switch (filterTab)
	{
		case "View All":
		{
			if (taskTitle === null && taskStatus === null)
			{
				// for page reload need to get this info from session, since reload removes all list items
				if (sessionStorage.getItem("theTaskList") && sessionStorage.getItem("theTaskList").trim() !== "") // if exists
				{

					document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");

					var activeTaskListItems = document.getElementsByClassName("taskActive");
					var inactiveTaskListItems = document.getElementsByClassName("taskInactive");

					//console.log(activeTaskListItems);
					//console.log(inactiveTaskListItems);

					if (activeTaskListItems.length !== 0)
					{
						for (var i = 0; i < activeTaskListItems.length; i++)
						{
							//activeTaskListItems[i].setAttribute("hidden","false");
							activeTaskListItems[i].removeAttribute("hidden");
						}

					}
					if (inactiveTaskListItems.length !== 0)
					{
						for (var i = 0; i < inactiveTaskListItems.length; i++)
						{
							//inactiveTaskListItems[i].setAttribute("hidden","false");
							inactiveTaskListItems[i].removeAttribute("hidden");
						}
					}

					//console.log(document.getElementById("taskList").innerHTML);
					
					/*if (sessionStorage.getItem("theTaskList") && sessionStorage.getItem("theTaskList").trim() !== "") // if exists
					{*/
					sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);
					//}
				}
				    // load an active session if present
				    // because VA filter was selected
				    // or page reloaded again
			    loadToDo();
			}
			else
			{
				if (taskStatus === "done")
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					//console.log(taskObj);
					taskObj.status = "done";

					// remove the "new" li from ul taskList UI
					//$('#taskList')..remove(); // removed from done callback since its efficient

					createInactiveTaskItem(taskObj); // delegated to separate function

				}
				else // for task status new - being marked as not done
				{
					// find the task object and set status to new
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					//console.log(taskObj);
					taskObj.status = "new";

					// remove the "done" li from ul taskList UI
					//$('#taskList')..remove(); // removed from not done callback since its efficient

					// delegate new task item creation to function
					createActiveTaskItem(taskObj);
				}
			}
			break; // View All case
		}

		case "Completed":
		{
			if (taskStatus === null && taskTitle === null)
			{
				// get list from ul taskList
				var activeTaskListItems = document.getElementsByClassName("taskActive");
				var inactiveTaskListItems = document.getElementsByClassName("taskInactive");
				//console.log(activeTaskListItems);
				//console.log(activeTaskListItems.length);

				// for each element
					// if list item has class taskActive, then hide
				if (activeTaskListItems.length !== 0)
				{	
					for (var i = 0; i < activeTaskListItems.length; i++)
					{
						activeTaskListItems[i].setAttribute("hidden","true");
					}
				}

				if (inactiveTaskListItems.length !== 0)
				{
					for (var i = 0; i < inactiveTaskListItems.length; i++)
					{
						//inactiveTaskListItems[i].setAttribute("hidden","false");
						inactiveTaskListItems[i].removeAttribute("hidden");
					}
				}

				//console.log("nullnullCompleted=="+document.getElementById("taskList").innerHTML);
				// set the ul task list in sessionStorage
				sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);

				// then load the To Do
				loadToDo();
			}
			else
			{
				if (taskStatus === "new") 
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					//console.log(taskObj);
					taskObj.status = "new";

					// remove the "new" li from ul taskList UI
					//$('#taskList')..remove(); // removed from done callback since its efficient

					createActiveTaskItem(taskObj);

					refreshView(null,null,"Completed");

					// TODOinTODO-clicking plus to add more - DONE
					// TODOinTODO-switching to either tabs - DONE

				}
				// no such "done" case for completed tab: Special case for when searching and active tab is completed
				else 
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					//console.log(taskObj);
					taskObj.status = "done";

					createInactiveTaskItem(taskObj);

					refreshView(null,null,"Completed");					
				}
			}
			break;
		}

		case "Pending":
		{
			if (taskStatus === null && taskTitle === null)
			{
				// get list from ul taskList
				var inactiveTaskListItems = document.getElementsByClassName("taskInactive");
				var activeTaskListItems = document.getElementsByClassName("taskActive");
				//console.log(inactiveTaskListItems);
				//console.log(inactiveTaskListItems.length);

				// for each element
					// if list item has class taskinActive, then hide
				if (inactiveTaskListItems.length !== 0)
				{	
					for (var i = 0; i < inactiveTaskListItems.length; i++)
					{
						inactiveTaskListItems[i].setAttribute("hidden","true");
					}
				}

				if (activeTaskListItems.length !== 0)
				{	
					for (var i = 0; i < activeTaskListItems.length; i++)
					{
						activeTaskListItems[i].removeAttribute("hidden");
					}
				}
				//console.log("nullnullActive=="+document.getElementById("taskList").innerHTML);
				// set the ul task list in sessionStorage
				sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);

				// then load the To-Do
				loadToDo();
			}
			else
			{
				if (taskStatus === "done") 
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					//console.log(taskObj);
					taskObj.status = "done";

					createInactiveTaskItem(taskObj);

					refreshView(null,null,"Pending");

				}
				else // no such "new" case for active tab: Special case: can happen thru search field!
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					//console.log(taskObj);
					taskObj.status = "new";

					createActiveTaskItem(taskObj);

					refreshView(null,null,"Pending");				

				}
			}

			break;
		}
	}
}

function filterButton(filterType)
{
	switch (filterType)
	{
		case "View All":
		{
			document.getElementById("viewAllButton").className = "filterButtonActive";
			document.getElementById("completedButton").className = "";
			document.getElementById("pendingButton").className = "";
			refreshView (null,null,"View All");
			break;
		}
		case "Completed":
		{
			document.getElementById("viewAllButton").className = "";
			document.getElementById("completedButton").className = "filterButtonActive";
			document.getElementById("pendingButton").className = "";
			refreshView (null,null,"Completed");
			break;
		}
		case "Pending":
		{
			document.getElementById("viewAllButton").className = "";
			document.getElementById("completedButton").className = "";
			document.getElementById("pendingButton").className = "filterButtonActive";
			refreshView (null,null,"Pending");
			break;
		}
		
	}
}