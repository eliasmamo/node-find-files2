    var FindFiles = require("node-find-files2");

    var d = new Date()
    d.setDate(d.getDate() - 1);

    var finder = new FindFiles({
        rootFolder : "/Users",
        fileModifiedDate : d
    });

//    //  Alternate Usage to acheive the same goal, but you can use any of the properties of the fs.stat object or the path to do your filtering
//    var finder = new node_find_files({
//        rootFolder : "/Users",
//        filterFunction : function (path, stat) {
//            return (stat.mtime > d) ? true : false;
//        }
//    });

    finder.startSearch()
        .done((data) => console.log(data.path + ' - ' + data.stat.mtime))
        .catch((error) => console.log('Global Error ' + err));
