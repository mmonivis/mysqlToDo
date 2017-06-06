var express = require('express');
var router = express.Router();

// Import our custom "config" node module.
// It holds a single object that has our MySQL credentials.
var config = require('../config/config');
// Include the MySQL module. We got this via npm
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: config.host,
	user: config.userName,
	password: config.password,
	database: config.database
});

// We are now connected (after this line!)
connection.connect();
// now we can write some awesome querys

/* GET home page. */
router.get('/', function(req, res, next) {
	var message = req.query.msg;
	if(message == "added"){
		message = "Your task was added!";
	}else if(message == "updated"){
		message = "Your task was updated!";
	}else if(message == "deleted"){
		message = "Your task was deleted!";
	}
	var selectQuery = "SELECT * FROM tasks";
	connection.query(selectQuery,(error,results)=>{
		res.render('index', {
			message: message,
			taskArray: results
		});
	});
});

// Add a post route "addItem" to handle the form submission.
router.post('/addItem',(req,res)=>{
	// res.json(req.body) // Helpful for us to visualize what we
	var newTask = req.body.newTask;
	var dueDate = req.body.newTaskDate;
	// We know what they submitted from the form. It comes to this route inside
	// req.body.NAMEOFFIELD. Now we need to insert it into MySQL.
	var insertQuery = "INSERT INTO tasks (taskName, taskDate) VALUES('"+newTask+"','"+dueDate+"')";
	// res.send(insertQuery);
	connection.query(insertQuery,(error,results)=>{
		if(error) throw error;
		res.redirect('/?msg=added');
	});
});

router.get('/delete/:id',(req,res)=>{
	var idToDelete = req.params.id;
	var deleteQuery = "DELETE FROM tasks WHERE id = " + idToDelete;
	connection.query(deleteQuery,(error,results)=>{
		res.redirect('/?msg=deleted');
	})
	// res.send(idToDelete);
});

// Make a new route to handle the edit page. It will be /edit/IDTOEDIT
router.get('/edit/:id',(req,res)=>{
	var idToEdit = req.params.id;
	var selectQuery = "SELECT * FROM tasks WHERE id = ?";
	connection.query(selectQuery, [idToEdit], (error, results)=>{
		res.render('edit',{
			task: results[0]
		});
	});
});

router.post('/editItem',(req,res)=>{
	var newTask = req.body.newTask;
	var newTaskDate = req.body.newTaskDate;
	var idToEdit = req.query.id;
	var updateQuery = "UPDATE tasks SET taskName = ?, taskDate = ? WHERE id = ?";
	connection.query(updateQuery, [newTask,newTaskDate,idToEdit], (error,results)=>{
		res.redirect('/?msg=updated');
	});
});

module.exports = router;
