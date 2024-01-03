document.addEventListener('DOMContentLoaded', function () {
    // Initialize Golden Layout
    var config = {
        content: [{
            type: 'row',
            isClosable: false,
            content: []
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

    layout.init();

    function addComponent(componentName, id, filePath) {
        var newItemConfig = {
            title: filePath,
            type: 'component',
            componentName: componentName,
            componentState: { id: id, filePath: filePath }
        };
        layout.root.contentItems[0].addChild(newItemConfig);
    }

    // List files function
    function listFiles() {
        var userId = 'user1'; // Replace with actual user identification logic
        $.ajax({
            url: '/api/list-files',
            data: { user_id: userId },
            type: 'GET',
            success: function (files) {
                updateFileBrowserUI(files);
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
            });
            
            var $graphButton = $('<button>').text('G').addClass('file-btn').click(function () {
                addComponent('graphComponent', graphId, file);
            });
            
            var $outputButton = $('<button>').text('O').addClass('file-btn').click(function () {
                addComponent('outputComponent', outputId, file);
            });

            $listItem.append($fileName, $editButton, $graphButton, $outputButton);
            $fileList.append($listItem);
        });
    }

    // Initial file listing
    listFiles();
});
