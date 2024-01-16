document.addEventListener('DOMContentLoaded', function () {
    // Initialize Golden Layout
    var config = {
        content: [{
            type: 'row',
            content: [{
                type: 'component',
                componentName: 'fileBrowserComponent',
                title: 'Browser'
            }]
            // Add other components as needed
        }]
    };
    var layout = new GoldenLayout(config, document.getElementById('layout-container'));

    layout.registerComponent('editorComponent', function (container, state) {
        var id = state.id;
        container.getElement().html('<div id="' + id + '" class="editor-view"></div>');
    });

    layout.registerComponent('graphComponent', function (container, state) {
        var id = state.id;
        container.getElement().html('<div id="' + id + '" class="graph-view"></div>');
    });

    layout.registerComponent('outputComponent', function (container, state) {
        var id = state.id;
        container.getElement().html('<div id="' + id + '" class="output-view"></div>');
    });

    // Registering file browser component
    layout.registerComponent('fileBrowserComponent', function (container, state) {
        // Create the file list
        var $fileList = $('<ul id="file-list"></ul>');

        // Button for creating a new file
        var $createFileButton = $('<button>').text('New File').click(function () {
            createNewItem('file');
        });

        // Button for creating a new directory
        var $createDirectoryButton = $('<button>').text('New Directory').click(function () {
            createNewItem('directory');
        });

        // Append the buttons and the file list to the container
        container.getElement().append($createFileButton, $createDirectoryButton, $fileList);

        listFiles(); // Call to populate the file list
    });



    layout.init();

    function addComponent(componentName, id, filePath) {
        // Check if a component with the same id already exists
        var exists = layout.root.getItemsById(id).length > 0;

        if (!exists) {
            var newItemConfig = {
                title: filePath,
                type: 'component',
                componentName: componentName,
                componentState: { id: id, filePath: filePath },
                id: id  // Assigning the id to the component
            };
            layout.root.contentItems[0].addChild(newItemConfig);
        } else {
            console.log('Component already open:', componentName + "-" + filePath);
        }
    }

    // List files function
    function listFiles() {
        var userId = 'user1'; // Replace with actual user identification logic
        $.ajax({
            url: '/api/list-files',
            data: { user_id: userId },
            type: 'GET',
            success: function (response) {
                if (response.success && Array.isArray(response.files)) {
                    updateFileBrowserUI(response.files);
                } else {
                    console.error('Error: Invalid format of files data.');
                }
            },
            error: function (error) {
                console.error('Error fetching files:', error);
            }
        });
    }


    function updateFileBrowserUI(files) {
        var $fileList = $('#file-list');
        $fileList.empty(); // Clear existing list

        files.forEach(function (file) {

            var $listItem = $('<li>');

            // Create a span for the file name
            var $fileName = $('<span>').text(file).css('margin-right', '10px');

            // Create buttons with modified click handlers
            var fileId = file.replace(/\s+/g, '-').toLowerCase(); // Create a unique ID for the file
            var editorId = 'editor-' + fileId;
            var graphId = 'graph-' + fileId;
            var outputId = 'output-' + fileId;

            var $editButton = $('<button>').text('E').addClass('file-btn').click(function () {
                addComponent('editorComponent', editorId, file);
                var editor = ace.edit(editorId);
                editor.session.setMode("ace/mode/latex");
                editor.setTheme("ace/theme/monokai");
            
                // Fetch file content and set it as the editor content
                fetch('/get-file?user_id=yourUserId&file_name=' + encodeURIComponent(file), {
                    method: 'GET',
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        editor.getSession().setValue(data.content);
                    } else {
                        console.log("Failed to load the file: " + data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            
                // Add change event handler to update the file when the editor content changes
                editor.getSession().on('change', function() {
                    var content = editor.getSession().getValue();
            
                    fetch('/update-file', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            'user_id': 'yourUserId',  // Replace with actual user ID
                            'file_name': file,  // Use the file name from the click handler
                            'new_content': content
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log("The file was saved!");
                        } else {
                            console.log("Failed to save the file: " + data.message);
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                });
            });

            var $graphButton = $('<button>').text('G').addClass('file-btn').click(function () {
                addComponent('graphComponent', graphId, file);
            });

            var $outputButton = $('<button>').text('O').addClass('file-btn').click(function () {
                addComponent('outputComponent', outputId, file);
            });

            var $removeButton = $('<button>').text('R').addClass('file-btn').click(function () {
                removeItem(file);
            });

            $listItem.append($fileName, $editButton, $graphButton, $outputButton, $removeButton);
            $fileList.append($listItem);
        });

    }
    // function to remove a file or directory
    function removeItem(fileName) {
        var userId = 'user1'; // Replace with actual user identification logic
        if (confirm("Are you sure you want to delete " + fileName + "?")) {
            $.ajax({
                url: '/api/remove-item',
                type: 'POST',
                data: {
                    user_id: userId,
                    file_name: fileName
                },
                success: function (response) {
                    console.log(response.message);
                    listFiles(); // Refresh the file list
                },
                error: function (error) {
                    console.error('Error removing item:', error);
                }
            });
        }
    }


    // Function to create a new file or directory
    function createNewItem(type) {
        var userId = 'user1'; // Replace with actual user identification logic
        var itemName = prompt("Enter the name of the new " + (type === 'file' ? "file" : "directory") + ":");

        if (!itemName) {
            alert("Name is required.");
            return;
        }

        $.ajax({
            url: '/api/add-' + type,
            type: 'POST',
            data: {
                user_id: userId,
                file_name: type === 'file' ? itemName : undefined,
                dir_name: type === 'directory' ? itemName : undefined
            },
            success: function (response) {
                console.log(response.message);
                listFiles(); // Refresh file list
            },
            error: function (error) {
                console.error('Error creating ' + type + ':', error);
            }
        });
    }
    



});
