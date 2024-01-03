from flask import Blueprint, jsonify

file_api = Blueprint('file_api', __name__)

@file_api.route('/list-files', methods=['GET'])
def list_files():
    # Static list of files for demonstration purposes
    files = ["file1", "file2"]
    return jsonify(files)
