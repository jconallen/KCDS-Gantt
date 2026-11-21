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

    if (rows[i][PROJECT]) {
        project = {
            "id": rows[index][0],
            "name": rows[index][PROJECT],
            "tasks": []
        }
        for (var r = i + 1; r < rows.length; r++) {
            var row = rows[r];
            if (row[PROJECT]) break;  // new project
            var task = {
                "taskId": row[0],
                "owner": row[OWNER],
                "task": row[TASK],
                "start": row[START],
                "end": row[END],
                "progress": row[PROGRESS],
                "notes": row[NOTES]
            }
            if (row[DEPENDENCIES]) {
                task.dependencies = '' + row[DEPENDENCIES]
            }
            project.tasks.push(task);
        }
    }
    return project;
}

function parseWorksheet(worksheet) {
    console.log('Reading worksheet...');
    try {

        var allRows = [];
        worksheet.eachRow(function (row, rowNumber) {
            var values = row.values;
            values[0] = rowNumber;
            allRows.push(values);
        });

        // pull out projects
        var projects = [];
        var i = 1;
        while (i < allRows.length) {
            var project = buildProject(i, allRows);
            project.color = COLORS[ projects.length ];
            projects.push(project);
            i += (project.tasks.length + 1);

            console.log(JSON.stringify(project, null, 4));
        }

        localStorage.setItem('projects', JSON.stringify(projects));


    } catch (err) {
        console.log('Could not read this file: ' + err.message, true);
    }
}

const COLORS = [
    "#377EB8",
    "#FF7F00",
    "#4DAF4A",
    "#E41A1C",
    "#984EA3",
    "#A65628",
    "#F781BF",
    "#008C95",
    "#808000",
    "#1F3A93",
    "#D9A400",
    "#006D5B",
    "#E76F51",
    "#6A3D9A",
    "#4682B4",
    "#B35806",
    "#2E8B57",
    "#C51B8A",
    "#64748B",
    "#A50F15"
]

function getGanttData() {
    var data = {
        "tasks": [],
        "links": []
    };
    var projects = getProjects();
    for (var p = 0; p < projects.length; p++) {
        var project = projects[p];
        var d = {
            "id": project.id,
            "text": project.name,
            "type": "project",
            "open": true,
            "owner": "",
            "color": project.color
        };
        data.tasks.push(d);
        for (var t = 0; t < project.tasks.length; t++) {
            var task = project.tasks[t];
            var dtask = {
                "id": task.taskId,
                "text": task.task,
                "open": true,

                "parent": project.id
            }
            if (task.owner) {
                dtask.owner = task.owner;
            } else {
                dtask.owner = "";
            }
            if (task.progress) dtask.progress = task.progress;
            var dtStart = DateTime.fromISO(task.start);
            dtask.start_date = dtStart.toFormat('dd-LL-yyyy');
            if (task.end) {
                if (Number.isInteger(task.end)) {
                    // then duration
                    dtask.end = task.end;
                } else {
                    // try a date
                    dtEnd = DateTime.fromISO(task.end);
                    // calc duration
                    var diff = dtEnd.diff(dtStart, 'days');
                    dtask.duration = diff.values.days;
                }
            } else {
                task.duration = 1;
            }

            if (typeof task.dependencies != 'undefined') {
                var deps = task.dependencies.split(',');
                for (var d = 0; d < deps.length; d++) {
                    var dep = deps[d];
                    var id = task.taskId + d;
                    var link = {
                        "id": id,
                        "target": '' + task.taskId,
                        "source": dep,
                        "type": "0"
                    }
                    data.links.push(link);
                }

            }

            data.tasks.push(dtask);

            // TODO: links
        }
    }
    return data;
}

function getProjects() {
    var projects = localStorage.getItem("projects");

    return JSON.parse(projects);
}

function navigate(url) {
    window.location.href = url;
}