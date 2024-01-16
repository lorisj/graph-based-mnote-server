from flask import Blueprint, jsonify, request
import os
from werkzeug.utils import secure_filename 
import shutil

file_api = Blueprint('file_api', __name__)

# Ensure base dir exists
BASE_DIR = "./user_files"
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)


@file_api.route('/list-files', methods=['GET'])
def list_files():
    user_id = request.args.get('user_id')  # Retrieve the user ID from request args
    if not user_id:
        return jsonify({"success": False, "message": "User ID is required"}), 400

    user_dir = os.path.join(BASE_DIR, user_id)

    # Check if user directory exists
    if not os.path.exists(user_dir):
        return jsonify({"success": False, "message": "User directory does not exist"}), 404

    # List all files and directories in the user directory
    try:
        files = os.listdir(user_dir)
        return jsonify({"success": True, "files": files})
    except OSError as e:
        return jsonify({"success": False, "message": str(e)}), 500

@file_api.route('/add-file', methods=['POST'])
def add_file():
    user_id = request.form.get('user_id')  # Replace with actual user identification logic
    file_name = request.form.get('file_name')
    if not file_name:
        return jsonify({"success": False, "message": "File name is required"}), 400
    if not user_id:
        return jsonify({"success": False, "message": "User name is required"}), 400

    # Ensure filename is safe
    file_name = secure_filename(file_name)
    user_dir = os.path.join(BASE_DIR, user_id)

    # Check if directory exists, if not, create it
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    file_path = os.path.join(user_dir, file_name)
    if os.path.exists(file_path):
        return jsonify({"success": False, "message": "File already exists"}), 400

    # Create the file
    with open(file_path, 'w') as file:
        file.write('')  # Create an empty file

    return jsonify({"success": True, "message": "File created successfully"})

@file_api.route('/add-directory', methods=['POST'])
def add_directory():
    user_id = request.form.get('user_id')  # Replace with actual user identification logic
    dir_name = request.form.get('dir_name')
    if not dir_name:
        return jsonify({"success": False, "message": "Directory name is required"}), 400

    # Ensure directory name is safe
    dir_name = secure_filename(dir_name)
    user_dir = os.path.join(BASE_DIR, user_id, dir_name)

    if os.path.exists(user_dir):
        return jsonify({"success": False, "message": "Directory already exists"}), 400

    # Create the directory
    os.makedirs(user_dir)

    return jsonify({"success": True, "message": "Directory created successfully"})



@file_api.route('/remove-item', methods=['POST'])
def remove_item():
    user_id = request.form.get('user_id')  # User identification logic
    file_name = request.form.get('file_name')
    
    if not file_name:
        return jsonify({"success": False, "message": "File name is required"}), 400

    item_path = os.path.join(BASE_DIR, user_id, file_name)

    if not os.path.exists(item_path):
        return jsonify({"success": False, "message": "Item does not exist"}), 404

    try:
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)  # Remove directory and all its contents
        else:
            os.remove(item_path)  # Remove a file
        return jsonify({"success": True, "message": "Item removed successfully"})
    except OSError as e:
        return jsonify({"success": False, "message": str(e)}), 500



@file_api.route('/update-file', methods=['POST'])
def update_file():
    user_id = request.form.get('user_id')  # Replace with actual user identification logic
    file_name = request.form.get('file_name')
    new_content = request.form.get('new_content')

    if not user_id or not file_name or new_content is None:
        return jsonify({"success": False, "message": "User ID, file name and new content are required"}), 400

    # Ensure filename is safe
    file_name = secure_filename(file_name)
    user_dir = os.path.join(BASE_DIR, user_id)

    # Check if directory exists
    if not os.path.exists(user_dir):
        return jsonify({"success": False, "message": "User directory does not exist"}), 404

    file_path = os.path.join(user_dir, file_name)

    # Check if file exists
    if not os.path.exists(file_path):
        return jsonify({"success": False, "message": "File does not exist"}), 404

    # Write new content to file
    try:
        with open(file_path, 'w') as file:
            file.write(new_content)
        return j-sonify({"success": True, "message": "File updated successfully"})
    except OSError as e:
        return jsonify({"success": False, "message": str(e)}), 500


@file_api.route('/get-file', methods=['GET'])
def get_file():
    user_id = request.args.get('user_id')  # Replace with actual user identification logic
    file_name = request.args.get('file_name')

    if not user_id or not file_name:
        return jsonify({"success": False, "message": "User ID and file name are required"}), 400

    # Ensure filename is safe
    file_name = secure_filename(file_name)
    user_dir = os.path.join(BASE_DIR, user_id)

    # Check if directory exists
    if not os.path.exists(user_dir):
        return jsonify({"success": False, "message": "User directory does not exist"}), 404

    file_path = os.path.join(user_dir, file_name)

    # Check if file exists
    if not os.path.exists(file_path):
        return jsonify({"success": False, "message": "File does not exist"}), 404

    # Read file content
    try:
        with open(file_path, 'r') as file:
            content = file.read()
        return jsonify({"success": True, "content": content})
    except OSError as e:
        return jsonify({"success": False, "message": str(e)}), 500