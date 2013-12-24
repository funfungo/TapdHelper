$(document).ready(function () {

    var file_list = [];
    var proj = "";
    var el_ = document.getElementById("JS-Tapd");

    el_.addEventListener('dragenter', handleDragEnter, false);
    el_.addEventListener('dragover', handleDragOver, false);
    el_.addEventListener('dragleave', handleDragLeave, false);
    el_.addEventListener('drop', handleDrop, false);

    function handleDragEnter(event) {
        this.classList.add('over');
        console.log("handleDragEnter");
    }

    function handleDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        console.log("handleDragOver");
    }

    function handleDrop(event) {
        event.stopPropagation();
        event.preventDefault();
        console.log("handleDrop");

        var item_length = event.dataTransfer.items.length;

        //遍历文件
        _.each(event.dataTransfer.items, function (file, index) {
            if (file.type === "text/html") {
                chrome.fileSystem.getDisplayPath(file.webkitGetAsEntry(), function (path) {
                    //路径中需要包括 f2e_proj

                    //截取为 /proj-xxx/html/xxx 格式
                    path = path.substring(path.indexOf("f2e_proj"));

                    //获取项目名 proj-xxxx
                    var newproj = path.substring(9, path.indexOf("html")).replace(/\\/g, '');

                    //重设项目名
                    if (proj !== "" && proj !== newproj) {
                        file_list = [];
                        proj = newproj;
                        setComment("");
                    } else {
                        proj = newproj;
                    }


                    //截取为 html/xxx 格式
                    path = path.substring(proj.length + 10).replace(/\\/g, '/');

                    file_list = _.union(file_list, path);

                    if (index == item_length - 1) {
                        generatorComment();
                    }
                });
            }
        });

        return false;
    }

    function handleDragLeave() {
        this.classList.remove('over');
        console.log("handleDragLeave");
    }

    function generatorComment() {

        //获取资源分发情况
        var cdn = [];
        if (document.getElementById("R-Beta").checked) {
            cdn.push("Beta")
        }

        if (document.getElementById("R-Gamma").checked) {
            cdn.push("Gamma")
        }

        if (document.getElementById("R-IDC").checked) {
            cdn.push("IDC")
        }

        var tpl = '<p># 构建已完成，新增 CSS 已经上传 ';

        _.each(cdn, function (item) {
            tpl += item + ", ";
        });

        tpl = tpl.substr(0, tpl.length - 2);

        tpl += '</p><p>## SVN URL： </p>' +
            'http://tc-svn.tencent.com/paipai/paipai_mobiledesign_rep/f2e_proj/trunk/' + proj + "<br>" +
            '<p>## HTML文件</p>';

        _.each(file_list, function (file) {
            tpl += file + "<br>";
        });

        tpl += '<p>## 预览地址</p>';

        _.each(file_list, function (file) {
            tpl += "http://svn.tmt.io/" + proj + "/" + file + "<br>";
        });

        setComment(tpl);

        $(".JS-Proj").html("[" + proj + "]");
    }

    function setComment(tpl) {
        $("#JS-Tapd").html(tpl);
    }

    //各种事件绑定
    $("#JS-Copy").click(function () {
        var copyDiv = document.getElementById("JS-Tapd");
        copyDiv.unselectable = "off";
        copyDiv.focus();
        document.execCommand('SelectAll');
        document.execCommand("copy");
    });

    $(".JS-Ctrl label").click(function () {
        if (file_list.length === 0) {
            return;
        }
        generatorComment();
    })

});