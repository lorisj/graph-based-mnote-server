from flask import Flask, render_template
from api.file_manager import file_api

app = Flask(__name__)

app.register_blueprint(file_api, url_prefix='/api')


@app.route('/')
def home():
    return render_template('editor.html')

if __name__ == '__main__':
    app.run(debug=True)
