const DateTime = luxon.DateTime;

const PROJECT = 1;
const OWNER = 2;
const TASK = 3;
const START = 4;
const END = 5;
const DEPENDENCIES = 6;
const PROGRESS = 7;
const NOTES = 8;

function buildProject(index, rows) {
    var project = null;
    var i = index;

    if( rows[i][PROJECT] ) {
        project = {
            "id": rows[index][0],
            "name": rows[index][PROJECT],
            "tasks": []
        }
        for( var r=i+1; r<rows.length; r++){
            var row = rows[r];
            if( row[PROJECT] ) break;  // new project
            var task = {
                "taskId": row[0],
                "owner": row[OWNER],
                "task": row[TASK],
                "start": row[START],
                "end": row[END],
                "dependencies": row[DEPENDENCIES],
                "progress": row[PROGRESS],
                "notes": row[NOTES]
            }
            project.tasks.push( task );
        }
    }
    return project;
}

function parseWorksheet(worksheet){
    console.log('Reading worksheet...');
    try {

        var allRows = [];
        worksheet.eachRow(function (row, rowNumber) {
            var values = row.values;
            values[0] = rowNumber;
            allRows.push( values );
        });

        // pull out projects
        var projects = [];
        var i = 1;
        while( i < allRows.length ){
            var project = buildProject( i, allRows );
            projects.push( project);
            i += (project.tasks.length + 1);

            console.log( JSON.stringify( project, null, 4) );
        }

        localStorage.setItem('projects', JSON.stringify(projects) );
        

    } catch (err) {
        console.log('Could not read this file: ' + err.message, true);
    }
}

var tasks = [
    { id: 3, text: "Fullam", type: "project", open: true, owner: "" },
    { id: 4, text: "Survey", start_date: "16-11-2026", duration: 1, parent: 3, progress: 0, open: true, owner: "jim" },
    { id: 5, text: "Floorplan Review", start_date: "02-12-2026", duration: 1, parent: 3, progress: 0, open: true, owner: "skylar" },
    { id: 6, text: "Material Selection", start_date: "07-12-2026", duration: 1, parent: 3, progress: 0, open: true, owner: "" },
    { id: 7, text: "Pricing Set", start_date: "14-12-2026", duration: 1, parent: 3, progress: 0, open: true, owner: "" },
    { id: 8, text: "Contractor Bidding", start_date: "15-12-2026", duration: 30, parent: 3, progress: 0, open: true, owner: "" },
    { id: 9, text: "Final Review", start_date: "16-01-2027", type: "milestone", parent: 3, progress: 0, open: true, owner: "" },
    { id: 10, text: "Permit Set", start_date: "21-01-2027", duration: 1, parent: 3, progress: 0, open: true, owner: "" },
    { id: 11, text: "Order Millwork", start_date: "22-01-2027", duration: 1, parent: 3, progress: 0, open: true, owner: "" },
    { id: 12, text: "Millwork Delivery", start_date: "01-02-2027", duration: 5, parent: 3, progress: 0, open: true, owner: "" },
    { id: 13, text: "Construction", start_date: "10-02-2027", duration: 30, parent: 3, progress: 0, open: true, owner: "" }
]

function getGanttData(){
    var data = {
        "tasks": [],
        "links": []
    };
    var projects = getProjects();
    for( var p=0; p<projects.length; p++){
        var project = projects[p];
        var d = {
            "id": project.id,
            "text": project.name,
            "type": "project",
            "open": true,
            "owner": ""
        };
        data.tasks.push(d);
        for( var t=0; t<project.tasks.length; t++){
            var task = project.tasks[t];
            var dtask = {
                "id": task.taskId,
                "text": task.task,
                "open": true,
                "owner": task.owner,
                "progress": task.progress
            }
            var dtStart = DateTime.fromISO( task.start );
            dtask.start = dtStart.toFormat('LL-dd-yyyy');
            if( task.end ) {
                if( Number.isInteger(task.end) ) {
                    // then duration
                    dtask.end = task.end;
                } else {
                    // try a date
                    dtEnd = DateTime.fromISO( task.end );
                    // calc duration
                    var diff = dtEnd.diff(dtStart, 'days');
                    dtask.end = diff.values.days;
                }
            } else {
                task.duration = 1;
            }
            data.tasks.push( dtask );

            // TODO: links
        }
    }
    return data;
}

function getProjects(){
    var projects = localStorage.getItem("projects");

    return JSON.parse(projects);
}

function navigate(url) {
    window.location.href = url;
}