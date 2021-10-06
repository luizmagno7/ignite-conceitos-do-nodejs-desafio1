const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const body = request.headers;

  if (!body.hasOwnProperty('username')) {
    return response.status(400).json({
      error: "Username não existe!"
    });
  }

  if (!users.some(( user ) => { return user.username == body.username})) {
    return response.status(404).json({
      error: "Usuário não encontrado"
    })
  }

  request.body.user = users.filter(( user ) => { return user.username == body.username});

  next();
}

app.post('/users', (request, response) => {
  const body = request.body,
        id = uuidv4();

  if (!body.hasOwnProperty('name') || !body.hasOwnProperty('username')) {
    return response.status(400).json({
      error: "Informações do usuário não encontradas"
    });
  }

  if (users.some(( user ) => { return user.username == body.username})) {
    return response.status(400).json({
      error: "Usuário já existe!"
    });
  }

  let user = { 
    id: id,
    name: body.name, 
    username: body.username, 
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.body.user;
  
  return response.status(200).json(user[0].todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const body = request.body,
      user = request.body.user,
      id = uuidv4();

  if (!body.hasOwnProperty('title') || !body.hasOwnProperty('deadline')) {
    return response.status(400).json({
      error: "Informações da tarefa não encontradas!"
    });
  }

  const task = { 
    id: id,
    title: body.title,
    done: false, 
    deadline: new Date(body.deadline),
    created_at: new Date()
  }

  user[0].todos.push(task)

  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const body = request.body,
      user = request.body.user,
      id = request.params.id;

  if (!body.hasOwnProperty('title') || !body.hasOwnProperty('deadline')) {
    return response.status(400).json({
      error: "Informações da tarefa não encontradas!"
    });
  }

  const task = user[0].todos.findIndex(( todo ) => { return todo.id == id});

  if (task == -1) {
    return response.status(404).json({
      error: `Tarefa (${id}) não foi encontrada!`
    })
  }

  user[0].todos[task].title = body.title;
  user[0].todos[task].deadline = new Date(body.deadline);

  return response.status(200).json(user[0].todos[task]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const body = request.body,
      user = request.body.user,
      id = request.params.id;

  const task = user[0].todos.findIndex(( todo ) => { return todo.id == id});

  if (task == -1) {
    return response.status(404).json({
      error: `Tarefa (${id}) não foi encontrada!`
    })
  }

  user[0].todos[task].done = true;

  return response.status(200).json(user[0].todos[task]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.body.user, 
      id = request.params.id;

  const task = user[0].todos.findIndex(( todo ) => { return todo.id == id});

  if (task == -1) {
    return response.status(404).json({
      error: `Tarefa (${id}) não foi encontrada!`
    })
  }

  user[0].todos.splice(task, 1);

  return response.status(204).json(user);
});

module.exports = app;