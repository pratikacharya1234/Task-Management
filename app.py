from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# In-memory task storage 
tasks = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_task', methods=['POST'])
def add_task():
    data = request.get_json()
    task = {'name': data['name'], 'date': data['date']}
    tasks.append(task)
    return jsonify(tasks)

@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

if __name__ == '__main__':
    app.run(debug=True)