var serverPath = '/Main/';
var addressBar = $('input[name="current-path"]');
var parentId = $('input[id="folder_parent_id"]');
var uploaderWrapper = $('.uploaders');
var bdy = $(document.body);
var _element = "";
var _previousParent = [];
const updateBtn = $('#update');
const updateIcon = updateBtn.find('> i');
const uploaderSample = $(
    '<div class="uploader">' +
    '    <div class="input-group mb-3">' +
    '        <div class="input-group-prepend">' +
    '            <span class="input-group-text" id="">Upload</span>' +
    '        </div>' +
    '        <div class="custom-file">' +
    '            <input type="file" class="custom-file-input" id="" aria-describedby="">' +
    '            <label class="custom-file-label" for="">' +
    '                <span class="title">Choose File&hellip;</span>' +
    '                <span class="progress">' +
    '                    <span class="progress-bar" role="progressbar"' +
    '                         style="width: 0;"' +
    '                         aria-valuenow="0"' +
    '                         aria-valuemin="0"' +
    '                         aria-valuemax="100">' +
    '                    </span>' +
    '                </span>' +
    '            </label>' +
    '        </div>' +
    '        <div class="input-group-append">' +
    '            <button class="btn btn-outline-danger del-uploader" type="button" id="">' +
    '                <i class="fal fa-times"></i>' +
    '            </button>' +
    '        </div>' +
    '    </div>' +
    '</div>');

function toggle_loader() {
    $('.loader').toggleClass('show');
}

function getCurrentPath() {
    return addressBar.val();
}

function getCurrentParentId() {
    return parentId.val();
}

function simplifyMimeType(mime) {
    if (mime === 'txt' || mime.includes('text')) {
        return 'txt';
    } else if (mime.includes('javascript')) {
        return 'javascript';
    } else if (mime.includes('mp4')) {
        return 'mp4';
    }
    return 'file';
}

function update() {
    // Show Loader
    toggle_loader();
    // SPIN update icon
    updateIcon.toggleClass('fa-spin');
    $.get(serverPath + 'Update?path=' + getCurrentParentId(), function (res) {
        // Hide Loader
        toggle_loader();
        updateIcon.toggleClass('fa-spin');
        if (res) {
            var itemsWrapper = $('#items-wrapper');
            var row = $('<div class="row">');

            if (res.Items.length > 0) {
                if (res.Items[0].FileId == null) {
                    //$('#folder_parent_id').val(res.Items[0].Id); //Assign ParentID
                    $('.new-folder, .upload-file').attr('hidden', true);
                    _previousParent = [];
                }
                else {
                    //$('#folder_parent_id').val(res.Items[0].FileId); //Assign ParentID
                    $('.new-folder, .upload-file').removeAttr('hidden');
                }
            } else {
                if ($('#folder_parent_id').val() == '') {
                    $('.new-folder, .upload-file').removeAttr('hidden');
                }
            }
            
            res.Items.forEach(function (value, index, array) {
                var src = '';
                var path = value['Path'] + '/' + value['Name'];
                var realPath = path.replace('ROOT', '/File-Repository');
                if (value['MimeType'] !== null && value['MimeType'].includes('image')) {
                    src = value['Path'].replace('ROOT', '/File-Repository') + '/' + value['Name'];
                } else {
                    src = '/Assets/img/file-types/' + (value['IsFolder'] ? 'folder' : simplifyMimeType(value['MimeType'])) + '.png';
                }
                row.append(
                    '<div class="col-lg-2">' +
                    '   <div class="item ' + (value['IsFolder'] ? 'folder' : 'file') + '" ' +
                    '           data-uid="' + value['Id'] + '" ' +
                    '           data-name="' + value['Name'] + '"' +
                    '           data-mime-type="' + value['MimeType'] + '" ' +
                    '           data-path="' + path + '" ' +
                    '           data-CDate="' + new Date(parseInt(value['CDate'].substr(6))).toLocaleString() + '" ' +
                    '           data-MDate="' + new Date(parseInt(value['MDate'].substr(6))).toLocaleString() + '">' +
                    '       <div class="img-wrapper">' +
                    '           <img src="' + src + '" class="img-fluid" alt="">' +
                    '       </div>' +
                    '       <div class="title-wrapper">' + value['Name'] + '</div>' +
                    '       <div class="custom-control custom-checkbox">' +
                    '           <input type="checkbox" class="custom-control-input" id="ch-' + value['Id'] + '">' +
                    '           <label class="custom-control-label" for="ch-' + value['Id'] + '"></label>' +
                    '       </div>' +
                    '       <div class="options">' +
                    '           <a href="javascript:void(0);" class="info"><i class="fal fa-info fa-fw"></i></a>' +
                    '           <a href="' + realPath + '" class="download" download><i class="fal fa-download fa-fw"></i></a>' +
                    '           <a href="javascript:void(0);" class="delete"><i class="fal fa-trash-alt fa-fw" ' + (res.Items[0].FileId != null ? "" : "hidden") + '></i></a>' +
                    '           <a href="javascript:void(0);" class="rename"><i class="fal fa-pencil-alt fa-fw"></i></a>' +
                    '       </div>' +
                    '   </div>' +
                    '</div>'
                );
            });
            itemsWrapper.html(row);
        }
    });


    //For File TreeView
    //Re-Initialize
    $('.FileManagerTree').remove();
    _element = "";

    //Start Fetching Data
    $.get(serverPath + 'TreeView', function (result) {
        var row = $('<div class="FileManagerTree">');
        if (result) {

            //Start Populate Initial Parent Node
            row.append(
                '<ul>'+
                '   <li>'+
                '       <a class="parent-item folder" ondblclick="OpenFileDirectory(this);" data-uid="' + result.Id + '" data-path="' + result.FilePath + '" href="#">[Folder] ' + result.FileName + '</a>' +
                        //Populate ChildNode Here If Available
                        populateChild(result.ChildNode) +
                '   </li>'+
                '</ul>'
                );
        }


        //Append To Page for display
        $("#page-wrapper").prepend(row);
    });

    $('.parent-item').unbind();
}

//Populate ChildNode Here
function populateChild(childNode) {
    if (childNode) {
        //Distribute ChildNode Here
        for (var i = 0; i < childNode.length; i++) {
            _element += '<ul>';
            if (childNode[i] != null) {
                _element += '<li><a href="#" ' + (childNode[i].isFolder ? 'class="parent-item folder" ondblclick="OpenFileDirectory(this);"' : '') + ' title="' + childNode[i].Id + '" data-uid="' + childNode[i].Id + '" data-path="' + childNode[i].FilePath + '" >' + (childNode[i].isFolder ? "[Folder] " + childNode[i].FileName : childNode[i].FileName) + '</a>';
                //Now we check if this Child Node has Child
                if (childNode[i].ChildNode.length > 0) {
                    //Call Same Function to populate Child
                    populateChild(childNode[i].ChildNode);
                }
                _element += '</li>';
            }
            _element += '</ul>';
        }
        return _element;
    }
}

function create_new_item(name, isFolder) {
    // make a request to create new folder
    toggle_loader();
    $.post(serverPath + 'Create/',
        {Name: name, Path: getCurrentPath(), IsFolder: isFolder}, function (res) {
            toggle_loader();
            if (res) {
                if (res.message) {
                    alertify.notify(res.message, 'success', 5);
                }
                update();
            }
        });
}

function rename_item(id, name, isFolder) {
    // make a request to create new folder
    toggle_loader();
    $.post(serverPath + 'Rename/',
        {Id: id, Name: name, IsFolder: isFolder}, function (res) {
            toggle_loader();
            if (res && res.Status) {
                alertify.notify(res.Message, 'success', 5);
                update();
            } else {
                alertify.notify(res.Message, 'error', 5);
            }
        });
}

function delete_item(id, name, isFolder) {
    // make a request to create new folder
    toggle_loader();
    $.post(serverPath + 'Delete/',
        {Id: id, IsFolder: isFolder},
        function (res) {
            toggle_loader();
            if (res && res.Status) {
                alertify.notify(res.Message, 'success', 5);
                update();
            } else {
                alertify.notify(res.Message, 'error', 5);
            }
        }
    );
}

function OpenFileDirectory(_this) {
    var item = $(_this);
    _previousParent = [];
    if (item.hasClass('folder')) {
        addressBar.val(item.attr('data-path'));
        _previousParent.push(item.attr("data-uid"));
        parentId.val(_previousParent.join('|'));
        update();
    }
}

function upload(inpFile) {
    var progress = inpFile.parents('.uploader').find('.progress-bar');
    var data = new FormData();
    data.append('Path', getCurrentPath());
    data.append('PostedFile', inpFile.prop('files')[0]);
    data.append('Id', $('#folder_parent_id').val().split('|').reverse()[0]);

    $.ajax({
        url: serverPath + 'Upload',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                // For handling the progress of the upload
                myXhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        var nowPercent = (100 * e.loaded) / e.total;
                        progress.attr('aria-valuenow', e.loaded);
                        progress.css('width', nowPercent + '%');
                    }
                }, false);
            }
            return myXhr;
        },
        success: function (data, textStatus, jqXHR) {
            if (typeof data.error === 'undefined') {
                // Success so call function to process the form
                $(".modal-body").prepend('<p class="upload-badge-success badge-success">&nbsp;Upload Successful!</p>');

                setTimeout(function () {
                    $("#upload-modal").modal('hide');
                    update();
                    $('.upload-badge-success').remove();
                }, 2000);
            } else {
                // Handle errors here
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
        }
    });
}

// Events
$('.new-file').click(function () {
    alertify.prompt('Create A New File', 'File Name (with extension):', 'File01.txt',
        function (evt, value) {
            create_new_item(value, false);
        }, function () {
            alertify.error('Cancel')
        }
    );
});
$('.new-folder').click(function () {
    alertify.prompt('Create A New Folder', 'Folder Name :', 'New Folder',
        function (evt, value) {
            create_new_item(value, true);
        }, function () {
            alertify.error('Cancel')
        }
    );
});
$('#items-wrapper').on('dblclick', '.item', function () {
    var item = $(this);
    if (item.hasClass('folder')) {
        addressBar.val(item.attr('data-path'));
        _previousParent.push(item.attr("data-uid"));
        parentId.val(_previousParent.join('|'));
        update();
    }
});

$('.go-back').click(function () {
    var currentAddress = addressBar.val();
    if (currentAddress === 'ROOT') {
        return;
    }
    currentAddress = currentAddress.split('/');
    currentAddress.pop();
    addressBar.val(currentAddress.join('/'));

    //ParentId
    var currentParentId = parentId.val();
    if (currentParentId === '') {
        return;
    }

    currentParentId = currentParentId.split('|');
    currentParentId.pop();
    parentId.val(currentParentId.join('|'));

    update();
});
updateBtn.click(function () {
    update();
});
$('#new-uploader').click(function () {
    uploaderWrapper.append(uploaderSample.clone());
});
bdy.on('dblclick', '.item.file', function (e) {
    var item = $(this);
    if (item.attr('data-mime-type').includes('image')) {
        window.open(item.attr('data-path').replace('ROOT', '/File-Repository'), '_blank');
    } else {
        window.open(serverPath + 'Edit/' + item.attr('data-uid'), '_blank');
    }
});
bdy.on('click', '.item.file .custom-checkbox', function (e) {
    e.stopPropagation();
});
$('#upload-modal').on('show.bs.modal', function () {
   uploaderWrapper.html(uploaderSample.clone());
});
bdy.on('change', '.uploader .custom-file > input[type="file"]', function (e) {
    var fileName = e.target.files[0].name;
    $(this).siblings('label').find('.title').html(fileName);
});
bdy.on('click', '.del-uploader', function () {
    $(this).parents('.uploader').slideUp(function () {
        $(this).remove();
    });
});
$('#start-upload').click(function () {
    uploaderWrapper.find('input[type="file"]').each(function (key, value) {
        upload($(this));
    });
});

bdy.on('click', 'a.rename', function (e) {
    e.preventDefault();
    var item = $(this).parents('.item');
    alertify.prompt('Rename File/Directory', 'New Name (with extension):',
        item.find('.title-wrapper').html(),
        function (evt, value) {
            rename_item(item.attr('data-uid'), value, item.hasClass('folder'));
        }, function () {
            alertify.error('Cancel')
        }
    );
});
bdy.on('click', 'a.delete', function (e) {
    e.preventDefault();
    var item = $(this).parents('.item');
    var type = item.hasClass('folder') ? 'Folder' : 'File';
    alertify.confirm('Delete ' + type, 'The ' + type + ' <strong>[' + item.find('.title-wrapper').html() + ']</strong> Will Be Deleted!',
        function (evt, value) {
            delete_item(item.attr('data-uid'), value, item.hasClass('folder'));
        }, function () {
            alertify.error('Cancel')
        }
    );
});
bdy.on('click', 'a.info', function (e) {
    e.preventDefault();
    var item = $(this).parents('.item');
    var type = item.hasClass('folder') ? 'Folder' : 'File';
    alertify.alert(type + ' Information',
        '<dl class="dl-horizontal dt-30">' +
        '   <dt>Id</dt>' +
        '   <dd>' + item.attr('data-uid') + '</dd>' +
        '   <dt>Name</dt>' +
        '   <dd>' + item.attr('data-name') + '</dd>' +
        '   <dt>Mime Type</dt>' +
        '   <dd>' + item.attr('data-mime-type') + '</dd>' +
        '   <dt>Path</dt>' +
        '   <dd>' + item.attr('data-path') + '</dd>' +
        '   <dt>Creation Date</dt>' +
        '   <dd>' + item.attr('data-CDate') + '</dd>' +
        '   <dt>Modification Date</dt>' +
        '   <dd>' + item.attr('data-MDate') + '</dd>' +
        '</dl>',
        function (evt, value) {
        }
    );
});
$(document).ready(function () {
    update();
});