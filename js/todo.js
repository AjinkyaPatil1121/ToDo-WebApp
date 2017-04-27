
$(document).ready(function() {
    $(".titleWidgets a").click(function() {	

    	// clear the form
    	document.getElementById("addTaskForm").reset();

    	// clear the initial message from taskList
    	if ( document.getElementById("taskList").firstChild === document.getElementById("initialToDoMessage") )
    	{
    		document.getElementById("initialToDoMessage").remove();
    	}
 	  	// change visibility of div Task pane and overlay
 	  	turnTaskOverlayPane("visible");
 	  	// set focus to task text field
 	  	document.getElementById("taskTitle").focus();
    });

	// scrolling task list without scrollbar visible
	//get taskListView div scroll width without scrollbar
	var taskListViewWidth = document.getElementById("taskListView").scrollWidth; // needs width set in px
	// set the container wrapper div of div taskListView to cover the scrollbars
	document.getElementById("taskListViewWrapper").style.width = taskListViewWidth + "px";

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
		document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");

		// list exists but tabbed lists might be empty
		var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
								: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
								: ( $('#pendingButton').attr('value') ) );
		
		// checking all elements are hidden!
		if (activeFilter == "Pending" && $("#taskList").children(":visible").length === 0)
		{
			document.getElementById("taskList").innerHTML = "<p id='initialToDoMessage'> No active tasks to display! Looks like someones' working hard... </p>";	
		}
		else if (activeFilter == "Completed" && $("#taskList").children(":visible").length === 0){
			document.getElementById("taskList").innerHTML = "<p id='initialToDoMessage'> Nothing here! Looks like you're not working hard... Up and at 'em! </p>";	
		}
	}
	//otherwise, prompt to add stuff
	else
	{
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
	$allAnchor.css('display','inline');
});

$('#taskList').on('mouseout','li',function(){
	var $allAnchor = $(this).find('a');
	$allAnchor.css('display','none');
});

// list done, not done, del hover/mouseover handling
$('#taskList').on('mouseover','.listItemDone',function(){
	$(this).text("DONE?");
	// adds a "space" artifact that separates the boxes for DONE and DEL
});
$('#taskList').on('mouseout','.listItemDone',function(){
	$(this).text("DONE");	
});

$('#taskList').on('mouseover','.listItemNotDone',function(){
	$(this).text("NOT DONE?");
});
$('#taskList').on('mouseout','.listItemNotDone',function(){
	$(this).text("NOT DONE");	
});

$('#taskList').on('mouseover','.listItemDel',function(){
	$(this).text("DEL?");
});
$('#taskList').on('mouseout','.listItemDel',function(){
	$(this).text("DEL");	
});

// List Item done click handler
$('#taskList').on('click','.listItemDone',function(e){
	e.preventDefault();

	var taskText = ($(this).parent()).parent().find("span").text(); // a->div->li

	($(this).parent()).parent().remove();

// to reflect the parent being marked done
	//if (document.getElementById("taskList").firstChild !== document.getElementById("initialToDoMessage"))
	//{ // when adding items, initial message gets removed; when one elem->done->remove->blank->session gets blank by this statement->inner set to blank->create->add to inner->update session
		// hence safe call without this if, cant get initialMessage added to session
		// can also place this inside mark done event handler
		sessionStorage.setItem("theTaskList", document.getElementById("taskList").innerHTML);
	//}

	// call refreshView with task title, task status and what tab is active
	var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
							: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
							: ( $('#pendingButton').attr('value') ) );
						
	// task was set to done, refreshView with 'taskTitle' to be marked 'done' at this 'tab'
	refreshView (taskText, "done", activeFilter);
});

// List item not done click handler
$('#taskList').on('click','.listItemNotDone',function(e){
	e.preventDefault();

	var taskText = ($(this).parent()).parent().find("span").text();

	($(this).parent()).parent().remove();
	
	// to reflect the parent being marked not done
	//if (document.getElementById("taskList").firstChild !== document.getElementById("initialToDoMessage"))
	//{ // when adding items, initial message gets removed; when one elem->done->remove->blank->session gets blank by this statement->inner set to blank->create->add to inner->update session
		// hence safe call without this if, cant get initialMessage added to session
		// can also place this inside mark done event handler
		sessionStorage.setItem("theTaskList", document.getElementById("taskList").innerHTML);
	//}

	// call refreshView with task title, task status and what tab is active
	
	var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
							: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
							: ( $('#pendingButton').attr('value') ) );
						
	// task was set to done, refreshView with 'taskTitle' to be marked 'not done' at this 'tab'
	refreshView (taskText, "new", activeFilter);
});

// Task delete X/Del button/achor press
$('#taskList').on('click','.listItemDel',function(e){
	e.preventDefault();
		
	// remove item from localStorage too

	// this removes all duplicate tasks from session, either block in processForm()-Done! when adding task
	// or handle code for duplicate values
	sessionStorage.removeItem(($(this).parent()).parent().find("span").text());

	// remove the li in the UI
	($(this).parent()).parent().remove();

	// set the ul taskList in session to be whatever is left after removing li
	sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);

	//loadToDo();// for when all items have been deleted, show the initial message in p -> delegated to refreshView which is also a logical step
	var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
							: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
							: ( $('#pendingButton').attr('value') ) ); 

	refreshView (null,null,activeFilter);
});

/*Future: $('#hideSearchDialog').click(function(){
	document.getElementById("searchNotFoundDialog").close();
});*/

/*Future: clickable ellipsis tooltip with a pop out display*/
// For displaying the entire long task desc. enclosed behind ellipsis
$(document).on('mouseenter', '.listItemDesc', function(){ 
	var $t = $(this); 
	var title = $t.attr('title'); 
	if (!title) 
	{ 
		if (this.offsetWidth < this.scrollWidth) 
			$t.attr('title', $t.text());
	} 
	else
	{
		if (this.offsetWidth >= this.scrollWidth && title == $t.text()) 
			$t.removeAttr('title');
	}
});


// task input text field is focused/selected
function taskTextInput(){
	// If error was displayed and user is focusing/clicking on textfield input to take corrective action
	if (document.getElementById("errorMsgCont").innerText !== ""){
		document.getElementById("errorMsgCont").innerText = "";
		document.getElementById("taskTitle").value = "";
	}
}

//Future: onkeyup works with input char by char, and not completely when typed with speed
// also maybe because I setup the algorithm for working on char by char input
// add more handlers(onchange,etc..) or change code here to handle possible different behaviors(typing fast, etc.)
var stringsToSearch = [];

// search text field event handler
function processSearch()
{
	// fetch current task items from storage
	document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");

	var taskToSearch = document.getElementById("searchTextField").value;

	var listItems = document.getElementById("taskList").childNodes;

	// if all characters removed from search box
	if (taskToSearch === "" || taskToSearch.length === 0)
	{
		// make blank
		stringsToSearch = [];

		// refresh the view
		var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
							: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
							: ( $('#pendingButton').attr('value') ) );

		refreshView (null,null,activeFilter);
	}
	// if one character entered, find and display all task items starting with that character
	else if (taskToSearch.length === 1 && listItems.length > 0) {
		for (var i = 0; i < listItems.length; i++)
		{
			if (listItems[i].childNodes[0].innerText[0].toLowerCase() === taskToSearch[0].toLowerCase()){
				
				stringsToSearch.push(listItems[i].childNodes[0].innerText);
				listItems[i].removeAttribute("hidden");
			}
			else{
				listItems[i].setAttribute("hidden","true");
			}
		}
		
		// save whatever changes you made to view
		sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);
		document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");
	}
	// match the next entries in search box to task items put in stringsToSearch and display results
	else if (taskToSearch.length > 1 && listItems.length > 0){
	/*
		// for people typing fast :Future task
		for (var i = 0; i < listItems.length; i++)
		{
			if (listItems[i].childNodes[0].innerText[0] === taskToSearch[0]){
				//console.log(listItems[i]);
				stringsToSearch.push(listItems[i].childNodes[0].innerText);
				//console.log(stringsToSearch);
				listItems[i].removeAttribute("hidden");
			}
			else{
				listItems[i].setAttribute("hidden","true");
			}
		}
		
		// save whatever changes you made to view
		sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);
		document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");
	*/
		for (var i = 0; i < listItems.length; i++)
		{
			if (stringsToSearch.includes(listItems[i].childNodes[0].innerText)) // currently displayed list items
			{
				if (listItems[i].childNodes[0].innerText.length < taskToSearch.length)
				{
					listItems[i].setAttribute('hidden','true');
				}
				else if (listItems[i].childNodes[0].innerText[taskToSearch.length-1].toLowerCase() === taskToSearch[taskToSearch.length-1].toLowerCase()){
					listItems[i].removeAttribute("hidden");
				}
				else{
					listItems[i].setAttribute("hidden","true");
				}
			}
			else{
				listItems[i].setAttribute("hidden","true");	
			}
		}
		// save whatever changes you made to view
		sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);
		document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");
	}

/*	Old working algorithm
	// search session storage for taskToSearch string
		// if exists 
		// hide all other elements

	if (sessionStorage.getItem(taskToSearch) && taskToSearch !== "")
	{
		//console.log("inside the if");
		if (listItems.length !== 0)
		{		
			//console.log("inside the 2nd if");		
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
*/
	// otherwise
		// alert no such element
/*	else
	{
		alert("No task named '"+taskToSearch+"' found!"); // replace with html dialog
/*		var dialog = document.getElementById("searchNotFoundDialog");
		var searchMsg = document.getElementById("searchResultMessage");
		searchMsg.innerText = 'Cannot find task "'+taskToSearch+'" in the ToDo list';
		dialog.showModal();
		//document.getElementById("hideSearchDialog").onclick = function(){dialog.close();};
*/		
/*		document.getElementById("searchTextField").value = "";
		var activeFilter = ( ( $('#viewAllButton').hasClass('filterButtonActive') ) ? $('#viewAllButton').attr('value')
							: ( $('#completedButton').hasClass('filterButtonActive') ) ? $('#completedButton').attr('value')
							: ( $('#pendingButton').attr('value') ) );
							
		refreshView (null, null, activeFilter);
	}
*/

} // Search process handler ends

// Adding a task element from task input form
function processForm(submitType)
{	
	if (submitType == "Cancel")
	{
		// change overlay visibility off
		turnTaskOverlayPane("hidden");
		document.getElementById("errorMsgCont").innerText = "";
		loadToDo(); // After Git commit check found: should be a call to refreshView
	}
	else
	{
		// get form elements for new task entry
		var elTaskTitle = document.getElementById("taskTitle");
		var elTaskDesc = document.getElementById("taskDesc");
		
		// input validation and handling
		// for blank
		// for duplicate entries, when del a task, session.remove removes all duplicates
		if (elTaskTitle.value.trim() === "" || elTaskTitle.value.length > 20)
		{
			var errorText = "Task title cannot be blank and exceed 20 chars";
			document.getElementById("errorMsgCont").innerText = errorText;
		}
		else if (sessionStorage.getItem(elTaskTitle.value))
		{
			var errorText = "Similar task already exists, choose a new name";
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
			// save individual element per task name -> object
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
/*
Future Feature: would need to add IDs to ListItems since typeof data that gets passed 
around is string
function allowDrop(ev) 
{
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
}

function drag(ev) 
{
    ev.dataTransfer.setData("text/html", ev.target); // string representation, so text/html becomes "object HTMLLIItem"
    ev.dataTransfer.dropEffect = "move";
    //console.log("EV target ID=="+ev.target+"<this");
}

function drop(ev)
{
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text/html");
    console.log(data);
    console.log(typeof data); // string
    console.log("target drop point id UL="+ev.target+"<-this");
    document.getElementById("taskList").insertBefore(data,document.getElementById("taskList").childNodes[0]);
    // search for dragging within same element
}
*/

function createActiveTaskItem(taskObject)
{
	var listItem = document.createElement("li");
	listItem.className = "taskActive";
	//listItem.setAttribute("draggable","true");
	//listItem.setAttribute("ondragstart","drag(event)");

	listItem.innerHTML = '<span>'+taskObject.title+'</span>' + '<p class="listItemDesc">'+ taskObject.desc +'</p>' 
	+ ' <div class="taskACont"> <a class="listItemDone" style="display: none;" href="#"> DONE </a> '
	+ ' <a class="listItemDel" style="display: none;" href="#"> DEL </a> </div>';
	//var listItem = '<li><span class="drag"> : </span><input class="listItem" value=' + taskObj.title + '><a class="listItemDetail" style="display: none;" href="#"> MORE </a><a class="listItemDone" style="display: none;" href="#"> DONE </a><a class="listItemDel" style="display: none;" href="#"> X </a></li>';

	//var firstTaskLi = document.getElementById("taskList").firstChild;
	//var taskList = document.getElementById("taskList");
	//taskList.insertBefore()

	// get updated list from session
	// because of initial p messages displayed for usability
	document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");

	// make relevant changes to the list just obtained
	document.getElementById("taskList").insertBefore(listItem,document.getElementById("taskList").childNodes[0]);

	// save entire list with key theTaskList, overwriting for all new entries with same name
	// saves iterating the storage on refresh. Saves all task li's
	sessionStorage.setItem("theTaskList", document.getElementById("taskList").innerHTML);
}

function createInactiveTaskItem(taskObject)
{
	// create new li with task object
	var listItem = document.createElement("li");
	listItem.className = "taskInactive";

	listItem.innerHTML = '<span>'+taskObject.title+'</span>' + '<p class="listItemDesc">'+ taskObject.desc +'</p>' 
	+ ' <div class="taskACont"><a class="listItemNotDone" style="display: none;" href="#"> NOT DONE </a> '
	+ ' <a class="listItemDel" style="display: none;" href="#"> DEL </a> </div>' ;
	
	document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");

	// append inactive to the end
	document.getElementById("taskList").appendChild(listItem);

	// update the task list in storage
	sessionStorage.setItem("theTaskList", document.getElementById("taskList").innerHTML);
}

function refreshView (taskTitle,taskStatus,filterTab)
{
/*	if (sessionStorage.getItem("theTaskList") && sessionStorage.getItem("theTaskList").trim() !== "") // if exists
	{
		document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");
	}
	else{ loadToDo(); return;}
*/
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

					if (activeTaskListItems.length !== 0)
					{
						for (var i = 0; i < activeTaskListItems.length; i++)
						{
							activeTaskListItems[i].removeAttribute("hidden");
						}

					}
					if (inactiveTaskListItems.length !== 0)
					{
						for (var i = 0; i < inactiveTaskListItems.length; i++)
						{
							inactiveTaskListItems[i].removeAttribute("hidden");
						}
					}
					
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
				// ViewAll tab has task items being marked done
				if (taskStatus === "done")
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					taskObj.status = "done";

					// remove the "new" li from ul taskList UI
					//$('#taskList')..remove(); // removed from done callback since its efficient

					createInactiveTaskItem(taskObj); // delegated to separate function

				}
				else // for task status new - being marked as not done in VA tab
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
				document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");
				// get list from ul taskList
				var activeTaskListItems = document.getElementsByClassName("taskActive");
				var inactiveTaskListItems = document.getElementsByClassName("taskInactive");

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
						inactiveTaskListItems[i].removeAttribute("hidden");
					}
				}

				// set the ul task list in sessionStorage
				//if (document.getElementById("taskList").firstChild !== document.getElementById("initialToDoMessage")){
					sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);
				//} not necessary since document.inner=.. is the first line

				// then load the To Do (after making changes and saving to session)
				loadToDo();
			}
			else
			{
				if (taskStatus === "new") 
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					taskObj.status = "new";

					// remove the "new" li from ul taskList UI
					//$('#taskList')..remove(); // removed from done callback since its efficient

					createActiveTaskItem(taskObj);

					refreshView(null,null,"Completed");

				}
				// no such "done" case for completed tab: Special case for when searching and active tab is completed
				else 
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
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
				document.getElementById("taskList").innerHTML = sessionStorage.getItem("theTaskList");
				// get list from ul taskList
				var inactiveTaskListItems = document.getElementsByClassName("taskInactive");
				var activeTaskListItems = document.getElementsByClassName("taskActive");

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

				// set the ul task list in sessionStorage
				//if (document.getElementById("taskList").firstChild !== document.getElementById("initialToDoMessage")){
					sessionStorage.setItem("theTaskList",document.getElementById("taskList").innerHTML);
				//}

				// then load the To-Do
				loadToDo();
			}
			else
			{
				if (taskStatus === "done") 
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
					taskObj.status = "done";

					createInactiveTaskItem(taskObj);

					refreshView(null,null,"Pending");

				}
				else // no such "new" case for active tab: Special case: can happen thru search field!
				{
					// find the task object and set status to done
					var taskObj = JSON.parse(sessionStorage.getItem(taskTitle));
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